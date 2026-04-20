import { encodingForModel, getEncoding, type TiktokenModel } from "js-tiktoken";
import type {
  Project,
  ProjectSectionKey,
} from "../../projects/domain/project.ts";

import { sectionReviewSchema } from "../../reviews/infrastructure/openai-section-reviewer.js";

export interface ReviewCreditEstimateInput {
  project: Project;
  section: {
    key: ProjectSectionKey;
    title: string;
    content: string;
  };
  promptTemplate: string;
  guideLineRules: Record<string, unknown>;
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
    const systemPrompt = [
      input.promptTemplate,
      "Return only structured JSON that matches the schema.",
      "Never invent facts, references, patient details, laboratory values, timelines, or outcomes.",
      "If information is absent, add warnings and missingInfoQuestions instead of guessing.",
      "Align your reasoning to case report publication and CARE-like completeness.",
    ].join("\n\n");

    const userPrompt = JSON.stringify({
      manuscriptType: input.project.manuscriptType,
      projectTitle: input.project.title,
      targetJournal: input.project.targetJournal,
      projectMetadata: input.project.metadata,
      section: input.section,
      guidelineRules: input.guideLineRules,
    });

    const requestPayload = JSON.stringify({
      model: input.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "case_report_section_review",
          schema: sectionReviewSchema,
        },
      },
    });

    const estimatedInputTokens = this.countTokens(requestPayload, input.model);
    const estimatedOutputTokens = 2000;
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
      console.log(encodingForModel(model as TiktokenModel).encode(text));
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
