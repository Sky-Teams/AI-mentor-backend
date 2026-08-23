import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { StatusCodes } from "http-status-codes";
import { env } from "src/shared/config/env";
import { AppError } from "src/shared/errors/app-error";
import { CreateJournalInput } from "src/modules/journal/domain/journal.repository.js";

export const AiJournalGenerationSchema = z.object({
  name: z.string().min(1),
  publisher: z.string().min(1),
  description: z.string().min(1),
  guidelinePack: z.string().min(1),
  sections: z.array(
    z.object({
      title: z.string().min(1),
      sectionOrder: z.number().int().min(1),
      isOptional: z.boolean().default(false),
      maxWords: z.number().int().min(1),
      sectionPrompt: z.string().min(1),
      checklists: z.array(
        z.object({
          title: z.string().nullable().default(null),
          items: z.array(z.string().min(1)).min(1),
        }),
      ),
      subsections: z.array(
        z.object({
          title: z.string().min(1),
          sectionOrder: z.number().int().min(1),
          isOptional: z.boolean().default(false),
          maxWords: z.number().int().min(1),
          sectionPrompt: z.string().min(1),
          checklists: z.array(
            z.object({
              title: z.string().nullable().default(null),
              items: z.array(z.string().min(1)).min(1),
            }),
          ),
        }),
      ),
    }),
  ),
});

export interface JournalGenerationContext {
  journalName: string;
  userPrompt: string;
}

const isSchemaValidationError = (error: unknown): boolean => {
  const apiError = error as { code?: string; message?: string };
  return (
    apiError?.code === "json_validate_failed" ||
    apiError?.message?.includes(
      "Generated JSON does not match the expected schema",
    ) === true
  );
};

export const buildJournalGenerationContext = (
  journalName: string,
  extra?: { publisher?: string; url?: string; issn?: string | null },
): JournalGenerationContext => {
  const extraInfoLines = [
    extra?.publisher ? `- Publisher: ${extra.publisher}` : "",
    extra?.url ? `- URL: ${extra.url}` : "",
    extra?.issn ? `- ISSN: ${extra.issn}` : "",
  ].filter(Boolean);

  const extraInfoBlock = extraInfoLines.length
    ? `
Known metadata (use as truth, do not contradict it):
${extraInfoLines.join("\n")}
${extra?.url ? "- Do not fetch or inspect the URL. Just use it as a reference label." : ""}
`
    : "";

  return {
    journalName,
    userPrompt: `
You are generating a journal template for a medical case report workflow.

Task:
Create a JSON object matching the journal schema for the journal named "${journalName}".
${extraInfoBlock}
Rules:
- Sections can have subsections, but subsections must NOT contain their own subsections.
- Do not add a "subsections" field inside any subsection object.
- subsections must always be included, use empty array [] if none. description is required too.
- Every item in a section's "subsections" array must be one complete subsection object. Never put field names, labels, punctuation, or strings directly in that array.

guidelinePack field:
- This must be a full instructional text (not a short label or code name) written for an AI reviewer, explaining how to review a case report section for this journal.
- Write it in clear sections with headers, covering:
  1. General expectations (case reporting principles, accuracy, no fabrication, tone)
  2. Content quality (precision, clinical accuracy, no redundancy)
  3. Review behavior (highlight gaps, give actionable feedback)
  4. Section-specific expectations (tailor feedback to each section's role)
  5. Output expectations (constructive, publication-focused feedback)
- Length: multiple short paragraphs or bullet lists, not a single sentence.

Requirements:
- Return a complete journal payload with name, publisher, description, guidelinePack, and sections.
- The sections should reflect a publication-ready case report structure appropriate for the journal.
- Use concise but useful checklists and section prompts.
- Prefer evidence-based structure, but do not invent unsupported facts.
- Keep the output valid JSON only.

- A section titled "References" is mandatory.
- Always include exactly one References section.
- The References section must be a root section, not a subsection.
- It must be non-optional.
- It must include a sectionPrompt explaining that it contains all cited sources.
- If the journal guidelines do not mention references, still add the References section at the end.
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
    publisher?: string;
    url?: string;
    issn?: string | null;
  }): Promise<CreateJournalInput> {
    if (!env.OPENAI_API_KEY) {
      throw new AppError(
        "OPENAI_API_KEY is missing.",
        500,
        "OPENAI_NOT_CONFIGURED",
      );
    }

    const context = buildJournalGenerationContext(input.journalName, {
      publisher: input.publisher,
      url: input.url,
      issn: input.issn,
    });

    let response;

    try {
      response = await this.client.beta.chat.completions.parse({
        model: env.OPENAI_MODEL,
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content:
              "You generate structured journal templates for medical case report workflows. Return only a JSON object that conforms exactly to the supplied schema. In particular, each `subsections` array must contain only objects matching the subsection schema; use [] when there are no subsections.",
          },
          { role: "user", content: context.userPrompt },
        ],
        response_format: zodResponseFormat(
          AiJournalGenerationSchema,
          "journal_template_generation",
        ),
      });
    } catch (error: any) {
      const isLengthError =
        error?.name === "LengthFinishReasonError" ||
        error?.type === "LengthFinishReasonError" ||
        error?.message?.includes("length limit was reached");

      const isContextTooLong = error?.code === "context_length_exceeded";

      if (isLengthError || isContextTooLong) {
        throw new AppError(
          "The generated journal is too large for the AI response limit. Please try again.",
          StatusCodes.UNPROCESSABLE_ENTITY,
          "AI_RESPONSE_LIMIT_REACHED",
        );
      }

      if (isSchemaValidationError(error)) {
        throw new AppError(
          "The AI returned an invalid journal template. Please try again.",
          StatusCodes.BAD_GATEWAY,
          "AI_SCHEMA_VALIDATION_FAILED",
        );
      }

      throw error;
    }

    const parsed = response.choices[0]?.message.parsed;
    if (!parsed) {
      throw new AppError(
        "OpenAI journal generation response could not be parsed.",
        StatusCodes.BAD_GATEWAY,
        "OPENAI_PARSE_ERROR",
      );
    }

    return {
      ...parsed,
      name: input.journalName || parsed.name,
      publisher: input.publisher || parsed.publisher,
      specialtyId: "",
      sections: parsed.sections.map((section, index) => ({
        ...section,
        sectionOrder: section.sectionOrder ?? index + 1,
        isOptional: section.isOptional ?? false,
        maxWords: section.maxWords,
        checklists: section.checklists,
        subsections: section.subsections.map((subsection) => ({
          ...subsection,
          isOptional: subsection.isOptional ?? false,
        })),
      })),
    };
  }
}
