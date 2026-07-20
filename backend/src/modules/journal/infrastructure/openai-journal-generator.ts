import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { env } from "src/shared/config/env";
import { AppError } from "src/shared/errors/app-error";
import type { CreateJournalInput } from "src/shared/seed-data/journals";

export const AiJournalGenerationSchema = z.object({
  name: z.string().min(1),
  publisher: z.string().min(1),
  description: z.string().min(1).optional(),
  guidelinePack: z.string().min(1),
  specialtyId: z.string().min(1).optional(),
  sections: z.array(
    z.object({
      title: z.string().min(1),
      sectionOrder: z.number().int().min(1),
      isOptional: z.boolean().default(false),
      maxChars: z.number().int().min(1),
      sectionPrompt: z.string().min(1),
      checklists: z.array(
        z.object({
          title: z.string().nullable().default(null),
          items: z.array(z.string().min(1)).min(1),
        }),
      ),
      subsections: z
        .array(
          z.object({
            title: z.string().min(1),
            sectionOrder: z.number().int().min(1),
            isOptional: z.boolean().default(false),
            maxChars: z.number().int().min(1),
            sectionPrompt: z.string().min(1),
            checklists: z.array(
              z.object({
                title: z.string().nullable().default(null),
                items: z.array(z.string().min(1)).min(1),
              }),
            ),
          }),
        )
        .optional()
        .default([]),
    }),
  ),
});

export interface JournalGenerationContext {
  journalName: string;
  userPrompt: string;
}

export const buildJournalGenerationContext = (
  journalName: string,
): JournalGenerationContext => {
  return {
    journalName,
    userPrompt: `
You are generating a journal template for a medical case report workflow.

Task:
Create a JSON object matching the journal schema for the journal named "${journalName}".

Requirements:
- Return a complete journal payload with name, publisher, description, guidelinePack, and sections.
- The sections should reflect a publication-ready case report structure appropriate for the journal.
- Use concise but useful checklists and section prompts.
- Prefer evidence-based structure, but do not invent unsupported facts.
- Keep the output valid JSON only.
    `.trim(),
  };
};

export class OpenAiJournalGenerator {
  private readonly client = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
    baseURL: env.OPENAI_BASE_URL,
    timeout: env.OPENAI_TIMEOUT_MS,
  });

  public async generateJournalTemplate(input: {
    journalName: string;
  }): Promise<CreateJournalInput> {
    if (!env.OPENAI_API_KEY) {
      throw new AppError(
        "OPENAI_API_KEY is missing.",
        500,
        "OPENAI_NOT_CONFIGURED",
      );
    }

    const context = buildJournalGenerationContext(input.journalName);

    const response = await this.client.beta.chat.completions.parse({
      model: env.OPENAI_MODEL,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You generate structured journal templates for medical case report workflows. Return strict JSON matching the schema.",
        },
        { role: "user", content: context.userPrompt },
      ],
      response_format: zodResponseFormat(
        AiJournalGenerationSchema,
        "journal_template_generation",
      ),
    });

    const parsed = response.choices[0]?.message.parsed;
    if (!parsed) {
      throw new AppError(
        "OpenAI journal generation response could not be parsed.",
        502,
        "OPENAI_PARSE_ERROR",
      );
    }

    return {
      ...parsed,
      specialtyId: parsed.specialtyId ?? "",
      sections: parsed.sections.map((section, index) => ({
        ...section,
        sectionOrder: section.sectionOrder ?? index + 1,
        isOptional: section.isOptional ?? false,
        maxChars: section.maxChars,
        checklists: section.checklists,
        subsections: section.subsections.map((subsection) => ({
          ...subsection,
          isOptional: subsection.isOptional ?? false,
        })),
      })),
    };
  }
}
