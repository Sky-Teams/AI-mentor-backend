import type { Project } from "../../projects/domain/project";
import type { AiSectionReviewResult } from "./review";

export interface ReviewContext {
  project: Project;
  section: {
    key: string;
    title: string;
    content: string;
  };
  promptTemplate: string;
  guidelineRules: Record<string, unknown>;
}

export interface ReviewExecutionResult {
  result: AiSectionReviewResult;
  rawResponse: Record<string, unknown>;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export interface SectionReviewer {
  reviewSection(context: ReviewContext): Promise<ReviewExecutionResult>;
}
