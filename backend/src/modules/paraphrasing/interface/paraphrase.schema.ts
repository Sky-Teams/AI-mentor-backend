import { z } from "zod";
export const TONE_VALUES = ["SIMPLE", "ACADEMIC", "CASUAL", "NATURAL"] as const;
export const LENGTH_VALUES = ["SHORTEN", "EXPAND", "MAINTAIN"] as const;

export const paraphraseSchema = z.object({
  sectionId: z.string().min(1),
  tone: z.enum(TONE_VALUES).default("SIMPLE"),
  lengthStrategy: z.enum(LENGTH_VALUES).default("SHORTEN"),
  preservedWords: z.array(z.string()).optional(),
});

export const paraphraseRunIdSchema = z.object({
  paraphraseRunId: z.string().min(1),
});

export const queryParaphraseSchema = z.object({
  sectionId: z.string().min(1),
  projectId: z.string().min(1),
});
