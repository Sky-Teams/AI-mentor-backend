import { z } from "zod";
import { planBillingModels } from "../../billing/domain/billing";

export const guidelinePackSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2).max(120),
  code: z.string().min(2).max(120),
  version: z.string().min(1).max(30),
  description: z.string().max(240).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  rules: z.record(z.unknown()),
  isDefault: z.boolean(),
});

export const promptTemplateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2).max(120),
  code: z.string().min(2).max(120),
  description: z.string().max(240).optional(),
  type: z.enum([
    "SECTION_REVIEW",
    "SECTION_PARAPHRASE",
    "SYSTEM_GUARDRAIL",
    "FOLLOW_UP",
  ]),
  version: z.number().int().positive().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  templateText: z.string().min(20),
  customContent: z
    .string()
    .max(4000)
    .nullable()
    .optional()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed || null;
    }),
  responseSchema: z.record(z.unknown()).optional(),
  config: z.record(z.unknown()).optional(),
});

export const promptTemplateCustomContentOnlySchema = z
  .object({
    id: z.string().min(1),
    customContent: z
      .string()
      .max(4000)
      .nullable(),
  })
  .strict()
  .transform(({ id, customContent }) => {
    const trimmed = customContent?.trim();
    return { id, customContent: trimmed || null };
  });

export const promptTemplateUpdateSchema = z.union([
  promptTemplateSchema,
  promptTemplateCustomContentOnlySchema,
]);

export const planSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2).max(120),
  code: z.string().min(2).max(120),
  description: z.string().max(240).optional(),
  billingModel: z.enum(planBillingModels),
  monthlyPriceCents: z.number().int().nonnegative().nullable().optional(),
  includedCredits: z.number().int().nonnegative(),
  status: z.enum(["ACTIVE", "ARCHIVED"]),
});
