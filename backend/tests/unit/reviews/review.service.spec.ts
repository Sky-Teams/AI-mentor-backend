import { describe, expect, it, jest } from "@jest/globals";
import { ReviewService } from "../../../src/modules/reviews/application/review.service";
import type { ReviewRepository } from "../../../src/modules/reviews/domain/review.repository";
import type { ProjectService } from "../../../src/modules/projects/application/project.service";
import type { SectionReviewer } from "../../../src/modules/reviews/domain/section-reviewer";
import type { BillingService } from "../../../src/modules/billing/application/billing.service";
import type { ReviewCreditEstimatorService } from "../../../src/modules/billing/application/review-credit-estimator.service";
import type { ReadinessSnapshot } from "../../../src/modules/reviews/domain/review";

describe("ReviewService", () => {
  it("returns an existing readiness snapshot without recalculating", async () => {
    const existingSnapshot: ReadinessSnapshot = {
      id: "snapshot-1",
      projectId: "project-1",
      overallScore: 72,
      status: "READY_FOR_INTERNAL_REVIEW",
      summary: "Existing readiness",
      blockers: [],
      strengths: [],
      sectionScores: {},
      createdAt: new Date(),
    };

    const reviewRepository = {
      createQueuedReview: jest.fn(),
      markReviewProcessing: jest.fn(),
      markReviewFailed: jest.fn(),
      completeReview: jest.fn(),
      listProjectReviews: jest.fn(),
      findReviewRun: jest.fn(),
      findIssue: jest.fn(),
      updateIssueStatus: jest.fn(),
      listProjectIssues: jest.fn(),
      findSectionForReview: jest.fn(),
      saveReadinessSnapshot: jest.fn(),
      getLatestReadiness: jest
        .fn<(projectId: string, ownerId: string) => Promise<ReadinessSnapshot | null>>()
        .mockResolvedValue(existingSnapshot),
      getActiveReviewPrompt: jest.fn(),
      getDefaultGuidelinePack: jest.fn(),
    } as unknown as jest.Mocked<ReviewRepository>;

    const projectService = {
      getProject: jest.fn(),
    } as unknown as jest.Mocked<ProjectService>;

    const sectionReviewer = {} as SectionReviewer;
    const billingService = {} as BillingService;
    const reviewCreditEstimator = {} as ReviewCreditEstimatorService;

    const reviewService = new ReviewService(
      reviewRepository,
      projectService,
      sectionReviewer,
      billingService,
      reviewCreditEstimator,
    );

    const readiness = await reviewService.getReadiness("project-1", "user-1");
    expect(readiness.summary).toBe("Existing readiness");
    expect(reviewRepository.saveReadinessSnapshot).not.toHaveBeenCalled();
  });
});
