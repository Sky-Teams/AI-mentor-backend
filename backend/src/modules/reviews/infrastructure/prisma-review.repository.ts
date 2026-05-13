import { PrismaClient, type Prisma } from "@prisma/client";
import type { ProjectSection } from "../../projects/domain/project";
import type {
  ReadinessSnapshot,
  ReviewIssue,
  ReviewMetric,
  ReviewRun,
  ReviewSuggestion,
} from "../domain/review";
import type {
  ReviewCompletionInput,
  ReviewRepository,
} from "../domain/review.repository";

const mapIssue = (issue: {
  id: string;
  reviewRunId: string;
  projectId: string;
  sectionId: string;
  severity: ReviewIssue["severity"];
  category: string;
  title: string;
  description: string;
  reason: string;
  fixSuggestion: string;
  status: ReviewIssue["status"];
  resolvedAt: Date | null;
  resolvedById: string | null;
}): ReviewIssue => ({
  id: issue.id,
  reviewRunId: issue.reviewRunId,
  projectId: issue.projectId,
  sectionId: issue.sectionId,
  severity: issue.severity,
  category: issue.category,
  title: issue.title,
  description: issue.description,
  reason: issue.reason,
  fixSuggestion: issue.fixSuggestion,
  status: issue.status,
  resolvedAt: issue.resolvedAt,
  resolvedById: issue.resolvedById,
});

const mapSuggestion = (suggestion: {
  id: string;
  reviewRunId: string;
  type: string;
  title: string;
  content: string;
}): ReviewSuggestion => ({
  id: suggestion.id,
  reviewRunId: suggestion.reviewRunId,
  type: suggestion.type,
  title: suggestion.title,
  content: suggestion.content,
});

const mapMetric = (metric: {
  id: string;
  reviewRunId: string;
  name: string;
  score: number;
  weight: number | null;
  rationale: string | null;
}): ReviewMetric => ({
  id: metric.id,
  reviewRunId: metric.reviewRunId,
  name: metric.name,
  score: metric.score,
  weight: metric.weight,
  rationale: metric.rationale,
});

const mapReviewRun = (review: {
  id: string;
  projectId: string;
  sectionId: string;
  initiatedById: string;
  aiModel: string;
  status: ReviewRun["status"];
  summary: string | null;
  overallScore: number | null;
  readinessIndicator: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  appCreditsConsumed: number;
  errorMessage: string | null;
  createdAt: Date;
  completedAt: Date | null;
  missingInfoQuestions?: unknown;
  nextSteps?: unknown;
  warnings?: unknown;
  section?: { key: ProjectSection["key"] };
  issues?: Array<Parameters<typeof mapIssue>[0]>;
  suggestions?: Array<Parameters<typeof mapSuggestion>[0]>;
  metrics?: Array<Parameters<typeof mapMetric>[0]>;
}): ReviewRun => ({
  id: review.id,
  projectId: review.projectId,
  sectionId: review.sectionId,
  initiatedById: review.initiatedById,
  aiModel: review.aiModel,
  status: review.status,
  summary: review.summary,
  overallScore: review.overallScore,
  readinessIndicator: review.readinessIndicator,
  inputTokens: review.inputTokens,
  outputTokens: review.outputTokens,
  totalTokens: review.totalTokens,
  appCreditsConsumed: review.appCreditsConsumed,
  errorMessage: review.errorMessage,
  createdAt: review.createdAt,
  completedAt: review.completedAt,
  sectionKey: review.section?.key,
  missingInfoQuestions:
    (review.missingInfoQuestions as string[] | undefined) ?? [],
  nextSteps: (review.nextSteps as string[] | undefined) ?? [],
  warnings: (review.warnings as string[] | undefined) ?? [],
  issues: review.issues?.map(mapIssue),
  suggestions: review.suggestions?.map(mapSuggestion),
  metrics: review.metrics?.map(mapMetric),
});

const mapReadinessSnapshot = (snapshot: {
  id: string;
  projectId: string;
  overallScore: number;
  status: ReadinessSnapshot["status"];
  summary: string;
  blockers: unknown;
  strengths: unknown;
  sectionScores: unknown;
  createdAt: Date;
}): ReadinessSnapshot => ({
  id: snapshot.id,
  projectId: snapshot.projectId,
  overallScore: snapshot.overallScore,
  status: snapshot.status,
  summary: snapshot.summary,
  blockers: (snapshot.blockers as string[] | undefined) ?? [],
  strengths: (snapshot.strengths as string[] | undefined) ?? [],
  sectionScores:
    (snapshot.sectionScores as Record<string, number> | undefined) ?? {},
  createdAt: snapshot.createdAt,
});

export class PrismaReviewRepository implements ReviewRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async createQueuedReview(input: {
    projectId: string;
    sectionId: string;
    initiatedById: string;
    aiModel: string;
    promptTemplateId?: string;
    guidelinePackId?: string;
  }): Promise<ReviewRun> {
    const review = await this.prisma.reviewRun.create({
      data: {
        projectId: input.projectId,
        sectionId: input.sectionId,
        initiatedById: input.initiatedById,
        aiModel: input.aiModel,
        promptTemplateId: input.promptTemplateId,
        guidelinePackId: input.guidelinePackId,
        status: "QUEUED",
      },
    });

    return mapReviewRun(review);
  }

  public async markReviewProcessing(reviewRunId: string): Promise<void> {
    await this.prisma.reviewRun.update({
      where: { id: reviewRunId },
      data: {
        status: "PROCESSING",
        startedAt: new Date(),
      },
    });
  }

  public async markReviewFailed(
    reviewRunId: string,
    errorMessage: string,
  ): Promise<void> {
    await this.prisma.reviewRun.update({
      where: { id: reviewRunId },
      data: {
        status: "FAILED",
        errorMessage,
        completedAt: new Date(),
      },
    });
  }

  public async completeReview(
    input: ReviewCompletionInput,
  ): Promise<ReviewRun> {
    const review = await this.prisma.$transaction(
      async (transaction: Prisma.TransactionClient) => {
        const existingReviewRun = await transaction.reviewRun.findUnique({
          where: {
            id: input.reviewRunId,
          },
          select: {
            projectId: true,
            sectionId: true,
          },
        });

        if (!existingReviewRun)
          throw new Error("Review run ${input.reviewRunId} was not found");

        await transaction.reviewIssue.deleteMany({
          where: {
            reviewRunId: input.reviewRunId,
          },
        });
        await transaction.reviewSuggestion.deleteMany({
          where: {
            reviewRunId: input.reviewRunId,
          },
        });
        await transaction.reviewMetric.deleteMany({
          where: {
            reviewRunId: input.reviewRunId,
          },
        });

        const reviewRun = await transaction.reviewRun.update({
          where: {
            id: input.reviewRunId,
          },
          data: {
            status: "COMPLETED",
            summary: input.summary,
            missingInfoQuestions: input.missingInfoQuestions,
            nextSteps: input.nextSteps,
            warnings: input.warnings,
            overallScore: input.overallScore,
            readinessIndicator: input.readinessIndicator,
            rawResponse: input.rawResponse as Prisma.InputJsonValue,
            inputTokens: input.inputTokens,
            outputTokens: input.outputTokens,
            totalTokens: input.totalTokens,
            appCreditsConsumed: input.appCreditsConsumed,
            completedAt: new Date(),
            issues: {
              create: input.issues.map((issue) => ({
                ...issue,
                project: {
                  connect: { id: existingReviewRun.projectId },
                },
                section: {
                  connect: { id: existingReviewRun.sectionId },
                },
              })),
            },
            suggestions: {
              create: input.suggestions,
            },
            metrics: {
              create: input.metrics,
            },
          },
          include: {
            section: true,
            issues: true,
            suggestions: true,
            metrics: true,
          },
        });

        await transaction.project.update({
          where: {
            id: reviewRun.projectId,
          },
          data: {
            status: "IN_REVIEW",
            lastReviewedAt: new Date(),
          },
        });

        await transaction.projectSection.update({
          where: {
            id: reviewRun.sectionId,
          },
          data: {
            status: "IN_REVIEW",
          },
        });

        return reviewRun;
      },
    );

    return mapReviewRun(review);
  }

  public async listProjectReviews(
    projectId: string,
    ownerId: string,
  ): Promise<ReviewRun[]> {
    const reviews = await this.prisma.reviewRun.findMany({
      where: {
        projectId,
        project: {
          ownerId,
          deletedAt: null,
        },
      },
      include: {
        section: true,
        issues: true,
        suggestions: true,
        metrics: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return reviews.map(mapReviewRun);
  }

  public async findReviewRun(
    reviewRunId: string,
    ownerId: string,
  ): Promise<ReviewRun | null> {
    const review = await this.prisma.reviewRun.findFirst({
      where: {
        id: reviewRunId,
        project: {
          ownerId,
          deletedAt: null,
        },
      },
      include: {
        section: true,
        issues: true,
        suggestions: true,
        metrics: true,
      },
    });

    return review ? mapReviewRun(review) : null;
  }

  public async findIssue(
    issueId: string,
    ownerId: string,
  ): Promise<ReviewIssue | null> {
    const issue = await this.prisma.reviewIssue.findFirst({
      where: {
        id: issueId,
        project: {
          ownerId,
          deletedAt: null,
        },
      },
    });

    return issue ? mapIssue(issue) : null;
  }

  public async updateIssueStatus(input: {
    issueId: string;
    ownerId: string;
    status: ReviewIssue["status"];
  }): Promise<ReviewIssue> {
    const issue = await this.prisma.reviewIssue.update({
      where: {
        id: input.issueId,
      },
      data: {
        status: input.status,
        resolvedAt: input.status === "RESOLVED" ? new Date() : null,
        resolvedById: input.status === "RESOLVED" ? input.ownerId : null,
      },
    });

    return mapIssue(issue);
  }

  public async listProjectIssues(
    projectId: string,
    ownerId: string,
  ): Promise<ReviewIssue[]> {
    const issues = await this.prisma.reviewIssue.findMany({
      where: {
        projectId,
        project: {
          ownerId,
          deletedAt: null,
        },
      },
      orderBy: [{ status: "asc" }, { severity: "desc" }, { createdAt: "desc" }],
    });

    return issues.map(mapIssue);
  }

  public async findSectionForReview(
    projectId: string,
    sectionKey: ProjectSection["key"],
    ownerId: string,
  ): Promise<ProjectSection | null> {
    const section = await this.prisma.projectSection.findFirst({
      where: {
        projectId,
        key: sectionKey,
        project: {
          ownerId,
          deletedAt: null,
        },
      },
    });

    if (!section) {
      return null;
    }

    return {
      id: section.id,
      projectId: section.projectId,
      key: section.key,
      title: section.title,
      content: section.content,
      sectionOrder: section.sectionOrder,
      isOptional: section.isOptional,
      status: section.status,
      lastEditedAt: section.lastEditedAt,
      updatedAt: section.updatedAt,
    };
  }

  public async saveReadinessSnapshot(
    input: Omit<ReadinessSnapshot, "id" | "createdAt">,
  ): Promise<ReadinessSnapshot> {
    const snapshot = await this.prisma.$transaction(
      async (transaction: Prisma.TransactionClient) => {
        const created = await transaction.readinessSnapshot.create({
          data: {
            projectId: input.projectId,
            overallScore: input.overallScore,
            status: input.status,
            summary: input.summary,
            blockers: input.blockers,
            strengths: input.strengths,
            sectionScores: input.sectionScores,
          },
        });

        await transaction.project.update({
          where: {
            id: input.projectId,
          },
          data: {
            readinessScore: input.overallScore,
            status:
              input.status === "READY_FOR_SUBMISSION" ? "READY" : undefined,
          },
        });

        return created;
      },
    );

    return mapReadinessSnapshot(snapshot);
  }

  public async getLatestReadiness(
    projectId: string,
    ownerId: string,
  ): Promise<ReadinessSnapshot | null> {
    const snapshot = await this.prisma.readinessSnapshot.findFirst({
      where: {
        projectId,
        project: {
          ownerId,
          deletedAt: null,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return snapshot ? mapReadinessSnapshot(snapshot) : null;
  }

  public async getActiveReviewPrompt(): Promise<{
    id: string;
    templateText: string;
  } | null> {
    const template = await this.prisma.promptTemplate.findFirst({
      where: {
        code: "case-report-section-review",
        status: "ACTIVE",
      },
      orderBy: {
        version: "desc",
      },
    });

    return template
      ? {
          id: template.id,
          templateText: template.templateText,
        }
      : null;
  }

  public async getDefaultGuidelinePack(): Promise<{
    id: string;
    name: string;
    version: string;
    rules: Record<string, unknown>;
  } | null> {
    const guidelinePack = await this.prisma.guidelinePack.findFirst({
      where: {
        isDefault: true,
        status: "ACTIVE",
      },
    });

    return guidelinePack
      ? {
          id: guidelinePack.id,
          name: guidelinePack.name,
          version: guidelinePack.version,
          rules: guidelinePack.rules as Record<string, unknown>,
        }
      : null;
  }
}
