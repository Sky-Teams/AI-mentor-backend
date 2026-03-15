import type { ProjectSection } from "../../projects/domain/project";
import type { ReadinessSnapshot, ReviewIssue, ReviewRun } from "./review";

export interface ReviewCompletionInput {
  reviewRunId: string;
  summary: string;
  missingInfoQuestions: string[];
  nextSteps: string[];
  warnings: string[];
  overallScore: number;
  readinessIndicator: number;
  issues: Array<{
    category: string;
    severity: ReviewIssue["severity"];
    title: string;
    description: string;
    reason: string;
    fixSuggestion: string;
  }>;
  suggestions: Array<{
    type: string;
    title: string;
    content: string;
  }>;
  metrics: Array<{
    name: string;
    score: number;
    weight?: number;
    rationale?: string;
  }>;
  rawResponse: Record<string, unknown>;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  appCreditsConsumed: number;
}

export interface ReviewRepository {
  createQueuedReview(input: {
    projectId: string;
    sectionId: string;
    initiatedById: string;
    aiModel: string;
    promptTemplateId?: string;
    guidelinePackId?: string;
  }): Promise<ReviewRun>;
  markReviewProcessing(reviewRunId: string): Promise<void>;
  markReviewFailed(reviewRunId: string, errorMessage: string): Promise<void>;
  completeReview(input: ReviewCompletionInput): Promise<ReviewRun>;
  listProjectReviews(projectId: string, ownerId: string): Promise<ReviewRun[]>;
  findReviewRun(reviewRunId: string, ownerId: string): Promise<ReviewRun | null>;
  findIssue(issueId: string, ownerId: string): Promise<ReviewIssue | null>;
  updateIssueStatus(input: {
    issueId: string;
    ownerId: string;
    status: ReviewIssue["status"];
  }): Promise<ReviewIssue>;
  listProjectIssues(projectId: string, ownerId: string): Promise<ReviewIssue[]>;
  findSectionForReview(projectId: string, sectionKey: ProjectSection["key"], ownerId: string): Promise<ProjectSection | null>;
  saveReadinessSnapshot(input: Omit<ReadinessSnapshot, "id" | "createdAt">): Promise<ReadinessSnapshot>;
  getLatestReadiness(projectId: string, ownerId: string): Promise<ReadinessSnapshot | null>;
  getActiveReviewPrompt(): Promise<{ id: string; templateText: string } | null>;
  getDefaultGuidelinePack(): Promise<{ id: string; name: string; version: string; rules: Record<string, unknown> } | null>;
}
