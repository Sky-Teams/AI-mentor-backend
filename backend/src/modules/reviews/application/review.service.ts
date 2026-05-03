import { StatusCodes } from "http-status-codes";
import { REQUIRED_SECTION_KEYS } from "../../../shared/constants/sections";
import { env } from "../../../shared/config/env";
import { AppError } from "../../../shared/errors/app-error";
import type { BillingService } from "../../billing/application/billing.service";
import type { ReviewCreditEstimatorService } from "../../billing/application/review-credit-estimator.service";
import type { ProjectService } from "../../projects/application/project.service";
import type { ProjectSectionKey } from "../../projects/domain/project";
import type {
  ReviewIssue,
  ReviewRun,
  ReadinessSnapshot,
  ReadinessStatus,
} from "../domain/review";
import type { ReviewRepository } from "../domain/review.repository";
import type { SectionReviewer } from "../domain/section-reviewer";

const severityPenalty: Record<ReviewIssue["severity"], number> = {
  LOW: 5,
  MEDIUM: 10,
  HIGH: 18,
  CRITICAL: 28,
};

export class ReviewService {
  public constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly projectService: ProjectService,
    private readonly sectionReviewer: SectionReviewer,
    private readonly billingService: BillingService,
    private readonly reviewCreditEstimator: ReviewCreditEstimatorService,
  ) {}

  public async triggerSectionReview(input: {
    projectId: string;
    ownerId: string;
    sectionKey: ProjectSectionKey;
  }): Promise<ReviewRun> {
    const project = await this.projectService.getProject(
      input.projectId,
      input.ownerId,
    );
    if (project.status === "ARCHIVED") {
      throw new AppError(
        "Archived projects cannot be reviewed.",
        StatusCodes.BAD_REQUEST,
        "PROJECT_ARCHIVED",
      );
    }

    const section = await this.reviewRepository.findSectionForReview(
      input.projectId,
      input.sectionKey,
      input.ownerId,
    );

    if (!section) {
      throw new AppError(
        "Section was not found.",
        StatusCodes.NOT_FOUND,
        "SECTION_NOT_FOUND",
      );
    }

    if (!section.content.trim()) {
      throw new AppError(
        "Section content is required before running review.",
        StatusCodes.BAD_REQUEST,
        "SECTION_EMPTY",
      );
    }

    const activePrompt = await this.reviewRepository.getActiveReviewPrompt();
    const promptTemplate =
      activePrompt?.templateText ??
      [
        "You are an expert publication mentor for medical case reports.",
        "Review a single manuscript section and return JSON only.",
        "Do not fabricate patient data, references, timelines, or facts.",
        "When information is missing, ask explicit questions and warn about the gap.",
      ].join("\n");

    const activeGuidelinePack =
      await this.reviewRepository.getDefaultGuidelinePack();

    const guidelinePack = activeGuidelinePack?.rules ?? {
      focus: [
        "CARE-like completeness",
        "Clarity and publication readiness",
        "Ethical statement completeness",
        "No fabricated facts or citations",
      ],
    };

    const estimate = this.reviewCreditEstimator.estimate({
      project,
      section: {
        key: section.key,
        title: section.title,
        content: section.content,
      },
      promptTemplate,
      guidelineRules: guidelinePack,
      model: env.OPENAI_MODEL,
    });

    await this.billingService.assertCanAffordReview(
      input.ownerId,
      estimate.estimatedCredits,
    );

    const reviewRun = await this.reviewRepository.createQueuedReview({
      aiModel: env.OPENAI_MODEL,
      initiatedById: input.ownerId,
      projectId: input.projectId,
      sectionId: section.id,
      promptTemplateId: activePrompt?.id,
      guidelinePackId: activeGuidelinePack?.id,
    });

    await this.reviewRepository.markReviewProcessing(reviewRun.id);

    try {
      const execution = await this.sectionReviewer.reviewSection({
        project,
        section: {
          key: section.key,
          title: section.title,
          content: section.content,
        },
        promptTemplate,
        guidelineRules: guidelinePack,
      });

      const actualCredits = this.reviewCreditEstimator.calculateActualCredit(
        execution.usage,
      );

      const billedCredits =
        await this.billingService.recordSuccessfulReviewUsage({
          userId: input.ownerId,
          projectId: input.projectId,
          reviewRunId: reviewRun.id,
          model: env.OPENAI_MODEL,
          amount: actualCredits,
          usage: execution.usage,
        });

      const completedReview = await this.reviewRepository.completeReview({
        reviewRunId: reviewRun.id,
        summary: execution.result.summary,
        missingInfoQuestions: execution.result.missingInfoQuestions,
        nextSteps: execution.result.nextSteps,
        warnings: execution.result.warnings,
        overallScore: execution.result.overallScore,
        readinessIndicator: execution.result.readinessIndicator,
        issues: execution.result.issues,
        suggestions: execution.result.suggestions,
        metrics: execution.result.metrics,
        rawResponse: execution.rawResponse,
        inputTokens: execution.usage.inputTokens,
        outputTokens: execution.usage.outputTokens,
        totalTokens: execution.usage.totalTokens,
        appCreditsConsumed: billedCredits,
      });

      await this.captureReadinessSnapshot(input.projectId, input.ownerId);
      return completedReview;
    } catch (error) {
      await this.billingService.recordFailed({
        userId: input.ownerId,
        projectId: input.projectId,
        operation: "REVIEW",
        reviewRunId: reviewRun.id,
        model: env.OPENAI_MODEL,
      });

      const message =
        error instanceof Error ? error.message : "Review processing failed.";
      await this.reviewRepository.markReviewFailed(reviewRun.id, message);
      throw error;
    }
  }

  public async listProjectReviews(
    projectId: string,
    ownerId: string,
  ): Promise<ReviewRun[]> {
    await this.projectService.getProject(projectId, ownerId);
    return this.reviewRepository.listProjectReviews(projectId, ownerId);
  }

  public async getReviewRun(
    reviewRunId: string,
    ownerId: string,
  ): Promise<ReviewRun> {
    const review = await this.reviewRepository.findReviewRun(
      reviewRunId,
      ownerId,
    );
    if (!review) {
      throw new AppError(
        "Review run was not found.",
        StatusCodes.NOT_FOUND,
        "REVIEW_NOT_FOUND",
      );
    }

    return review;
  }

  public async listProjectIssues(
    projectId: string,
    ownerId: string,
  ): Promise<ReviewIssue[]> {
    await this.projectService.getProject(projectId, ownerId);
    return this.reviewRepository.listProjectIssues(projectId, ownerId);
  }

  public async updateIssueStatus(input: {
    issueId: string;
    ownerId: string;
    status: ReviewIssue["status"];
  }): Promise<ReviewIssue> {
    const issue = await this.reviewRepository.findIssue(
      input.issueId,
      input.ownerId,
    );
    if (!issue) {
      throw new AppError(
        "Issue was not found.",
        StatusCodes.NOT_FOUND,
        "ISSUE_NOT_FOUND",
      );
    }

    return this.reviewRepository.updateIssueStatus(input);
  }

  public async getReadiness(
    projectId: string,
    ownerId: string,
  ): Promise<ReadinessSnapshot> {
    const existing = await this.reviewRepository.getLatestReadiness(
      projectId,
      ownerId,
    );
    if (existing) {
      return existing;
    }

    return this.captureReadinessSnapshot(projectId, ownerId);
  }

  private async captureReadinessSnapshot(
    projectId: string,
    ownerId: string,
  ): Promise<ReadinessSnapshot> {
    const project = await this.projectService.getProject(projectId, ownerId);
    const issues = await this.reviewRepository.listProjectIssues(
      projectId,
      ownerId,
    );

    const sectionScores = Object.fromEntries(
      (project.sections ?? []).map((section) => {
        const completenessScore = section.content.trim().length > 0 ? 100 : 0;
        return [section.key, completenessScore];
      }),
    );

    const requiredSections = (project.sections ?? []).filter((section) =>
      REQUIRED_SECTION_KEYS.includes(section.key),
    );
    const completedRequiredSections = requiredSections.filter(
      (section) => section.content.trim().length > 0,
    ).length;

    const completenessScore =
      requiredSections.length === 0
        ? 0
        : Math.round(
            (completedRequiredSections / requiredSections.length) * 60,
          );

    const openIssues = issues.filter((issue) => issue.status === "OPEN");
    const penalty = openIssues.reduce(
      (total, issue) => total + severityPenalty[issue.severity],
      0,
    );
    const qualityScore = Math.max(0, 40 - penalty);
    const overallScore = Math.max(
      0,
      Math.min(100, completenessScore + qualityScore),
    );

    let status: ReadinessStatus = "NOT_READY";
    if (
      overallScore >= 85 &&
      openIssues.every((issue) => issue.severity !== "CRITICAL")
    ) {
      status = "READY_FOR_SUBMISSION";
    } else if (overallScore >= 65) {
      status = "READY_FOR_INTERNAL_REVIEW";
    } else if (overallScore >= 40) {
      status = "NEEDS_ATTENTION";
    }

    const snapshot = await this.reviewRepository.saveReadinessSnapshot({
      projectId,
      overallScore,
      status,
      summary:
        overallScore >= 65
          ? "The manuscript is progressing well but still needs a targeted pass on open issues."
          : "The manuscript still has meaningful completeness or quality gaps before submission.",
      blockers: openIssues
        .filter(
          (issue) => issue.severity === "CRITICAL" || issue.severity === "HIGH",
        )
        .map((issue) => `${issue.category}: ${issue.title}`),
      strengths: requiredSections
        .filter((section) => section.content.trim().length > 0)
        .slice(0, 5)
        .map((section) => `${section.title} drafted`),
      sectionScores,
    });

    return snapshot;
  }
}
