import z from "zod";

export const journalIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const createJournalSchema = z.object({
  code: z.string().min(1).max(80),
  name: z.string().min(1).max(180),
  publisher: z.string().min(1).max(180).optional(),
  description: z.string().min(1).max(1000).optional(),
  manuscriptType: z.enum(["CASE_REPORT"]).optional(),
  guidelinePackId: z.string().min(1).optional(),

  sections: z
    .array(
      z.object({
        key: z.string().min(1).max(80),
        title: z.string().min(1).max(180),
        sectionOrder: z.number().int().min(1),
        isOptional: z.boolean().optional(),
        description: z.string().min(1).max(1000).optional(),

        checklist: z
          .array(
            z.object({
              title: z.string().min(1).max(180).optional(),
              items: z.array(z.string().min(1).max(500)).min(1),
            }),
          )
          .optional(),
      }),
    )
    .min(1),
});
