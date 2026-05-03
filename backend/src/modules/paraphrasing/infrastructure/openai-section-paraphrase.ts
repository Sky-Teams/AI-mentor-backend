import z from "zod";
import {
  ParaphraseContext,
  ParaphraseExecutionResult,
  SectionParaphrase,
} from "../domain/section-paraphrase";
import OpenAI from "openai";
import { env } from "../../../shared/config/env";
import { AppError } from "src/shared/errors/app-error";
import { zodResponseFormat } from "openai/helpers/zod";
import { LENGTH_VALUES, TONE_VALUES } from "../interface/paraphrase.schema";

const changesSchema = z.object({
  originalPhrase: z.string().min(1),
  replacedWith: z.string().min(1),
  reason: z.string().min(1),
  startIndex: z.number().optional(),
  endIndex: z.number().optional(),
});

const metricsSchema = z.object({
  name: z.string().min(1),
  score: z.number().int().min(0).max(100),
  label: z.string().min(1),
  retionale: z.string().optional(),
});

const grammarTipsSchema = z.object({
  ruleName: z.string().min(1),
  explanation: z.string().min(1),
  example: z.string().optional(),
});
const AiParaphraseResponseSchema = z.object({
  paraphrasedText: z.string().min(1),
  tone: z.enum(TONE_VALUES).default("SIMPLE"),
  lengthStrategy: z.enum(LENGTH_VALUES).default("SHORTEN"),
  changes: z.array(changesSchema).optional().default([]),
  metrics: z.array(metricsSchema).optional().default([]),
  grammarTips: z.array(grammarTipsSchema).optional().default([]),
  readabilityScore: z.number().int().min(0).max(100),
});

export class OpenAiSectionParaphrase implements SectionParaphrase {
  private readonly client = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
    baseURL: env.OPENAI_BASE_URL,
    timeout: env.OPENAI_TIMEOUT_MS,
  });

  public async paraphraseSection(
    content: ParaphraseContext,
  ): Promise<ParaphraseExecutionResult> {
    if (!env.OPENAI_API_KEY) {
      throw new AppError(
        "OPENAI_API_KEY is missing.",
        500,
        "OPENAI_NOT_CONFIGURED",
      );
    }

    if (!content.originalText || content.originalText.length === 0)
      throw new AppError("Text for paraphrase is empty", 400);

    const preservedWordsRule =
      content.preservedWords && content.preservedWords?.length > 0
        ? `You MUST keep these words exactly as they are: [${content.preservedWords.join(", ")}]. Do not use synonyms for them.`
        : "";

    const systemPrompt = [
      `Return only structured JSON that matches the schema.`,
      `TASK: Paraphrase the text based on these specific constraints:`,
      `1. Tone requirement: ${content.tone}.`,
      `2. Length strategy: ${content.lengthStrategy}`,
      `3. STRUCTURE: Ensure the output avoids plagiarism by changing sentence structures and using synonyms appropriately.`,
      `4. Preserved Words Rule: ${preservedWordsRule}`,
      `Do not repeat the same information. If a sentence doesn't add new value, merge or delete it`,
      `Limit the 'changes' array to a maximum of 2 essential items.`,
      `You MUST include 'metrics', 'grammarTips', and 'readabilityScore' keys, even if they contain empty arrays or default values.`,
      `Do not let the response cut off.`,
    ].join("\n\n");

    const userPrompt = JSON.stringify(
      {
        projectId: content.projectId,
        sectionId: content.sectionId,
        originalText: content.originalText,
        tone: content.tone,
        preservedWords: content.preservedWords,
        lengthStrategy: content.lengthStrategy,
      },
      null,
      2,
    );

    const response = await this.client.beta.chat.completions.parse({
      model: env.OPENAI_MODEL,
      temperature: env.OPENAI_PARAPHRASE_TEMPERATURE,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: zodResponseFormat(
        AiParaphraseResponseSchema,
        "case_report_section_paraphrase",
      ),
    });

    const parsed = response.choices[0]?.message.parsed;
    if (!parsed) {
      throw new AppError(
        "OpenAI paraphrase response could not be parsed.",
        502,
        "OPENAI_PARSE_ERROR",
      );
    }

    return {
      result: parsed,
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
