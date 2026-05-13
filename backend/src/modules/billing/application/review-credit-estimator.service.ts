import { encodingForModel, getEncoding, type TiktokenModel } from "js-tiktoken";
import type { Project } from "../../projects/domain/project";

import { sectionReviewSchema } from "../../reviews/infrastructure/openai-section-reviewer";

export interface ReviewCreditEstimateInput {
  project: Project;
  section: {
    key: string;
    title: string;
    content: string;
  };
  promptTemplate: string;
  guidelineRules: Record<string, unknown>;
  model: string;
}

export interface ReviewCreditEstimate {
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  estimatedTotalTokens: number;
  estimatedCredits: number;
}

export class ReviewCreditEstimatorService {
  public estimate(input: ReviewCreditEstimateInput): ReviewCreditEstimate {
    const systemPrompt = input.promptTemplate;

    const userPrompt = JSON.stringify({
      manuscriptType: input.project.manuscriptType,
      projectTitle: input.project.title,
      section: input.section,
      guidelineRules: input.guidelineRules,
    });

    const requestPayload = JSON.stringify({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: sectionReviewSchema,
    });

    const estimatedInputTokens = this.countTokens(requestPayload, input.model);
    const estimatedOutputTokens = Math.floor(estimatedInputTokens * 1.1);

    const estimatedTotalTokens = estimatedInputTokens + estimatedOutputTokens;

    return {
      estimatedInputTokens,
      estimatedOutputTokens,
      estimatedTotalTokens,
      estimatedCredits: estimatedTotalTokens,
    };
  }

  private countTokens(text: string, model: string): number {
    try {
      return encodingForModel(model as TiktokenModel).encode(text).length;
    } catch {
      return getEncoding("cl100k_base").encode(text).length;
    }
  }

  public calculateActualCredit(usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  }): number {
    return usage.totalTokens;
  }
}
