import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { env } from "../../../shared/config/env";
import { AppError } from "../../../shared/errors/app-error";
import type {
  ReviewContext,
  ReviewExecutionResult,
  SectionReviewer,
} from "../domain/section-reviewer";
import { AiSectionReviewResult } from "src/modules/reviews/domain/review.js";
import { getAiClient } from "src/shared/ai/ai-client.js";

const issueSchema = z.object({
  category: z.string().min(1),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  title: z.string().min(1),
  description: z.string().min(1),
  reason: z.string().min(1),
  fixSuggestion: z.string().min(1),
});

const suggestionSchema = z.object({
  type: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
});

const metricSchema = z.object({
  name: z.string().min(1),
  score: z.number().int().min(0).max(100),
  weight: z.number().int().min(1).max(100).nullable(),
  rationale: z.string().min(1).nullable(),
});

export const sectionReviewSchema = z.object({
  summary: z.string().min(1),
  issues: z.array(issueSchema),
  missingInfoQuestions: z.array(z.string().min(1)),
  nextSteps: z.array(z.string().min(1)),
  suggestions: z.array(suggestionSchema),
  metrics: z.array(metricSchema),
  warnings: z.array(z.string().min(1)),
  overallScore: z.number().int().min(0).max(100),
  readinessIndicator: z.number().int().min(0).max(100),
});

export class OpenAiSectionReviewer implements SectionReviewer {
  public async reviewSection(
    context: ReviewContext,
  ): Promise<ReviewExecutionResult> {
    const systemPrompt = [
      context.promptTemplate,
      "Return only structured JSON that matches the schema.",
      "Never invent facts, references, patient details, laboratory values, timelines, or outcomes.",
      "If information is absent, add warnings and missingInfoQuestions instead of guessing.",
      "Align your reasoning to case report publication and CARE-like completeness.",
    ].join("\n\n");

    const userPrompt = JSON.stringify(
      {
        projectTitle: context.project.title,
        targetJournal: context.project.targetJournal,
        section: context.section,
        sectionGuideline: context.section.sectionPrompt,
        allSectionStates: (context.project.sections ?? []).map((section) => ({
          key: section.key,
          title: section.title,
          drafted: section.content.text.trim().length > 0,
        })),
        guidelineRules: context.guidelineRules,
      },
      null,
      2,
    );

    const response = await getAiClient(
      context.ai.provider,
    ).beta.chat.completions.parse({
      model: context.ai.model,
      temperature: env.AI_REVIEW_TEMPERATURE,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: zodResponseFormat(
        sectionReviewSchema,
        "case_report_section_review",
      ),
    });

    const parsed = response.choices[0]?.message.parsed;
    if (!parsed) {
      throw new AppError(
        "AI review response could not be parsed.",
        502,
        "AI_PARSE_ERROR",
      );
    }

    return {
      result: {
        ...parsed,
        metrics: parsed.metrics.map((metric) => ({
          ...metric,
          weight: metric.weight ?? undefined,
          rationale: metric.rationale ?? undefined,
        })),
      } satisfies AiSectionReviewResult,
      rawResponse: JSON.parse(JSON.stringify(response)) as Record<
        string,
        unknown
      >,
      usage: {
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
        totalTokens: response.usage?.total_tokens ?? 0,
      },
    };
  }
}
