import z from "zod";

export const journalIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const createJournalSchema = z.object({
  name: z.string().min(1).max(180),
  publisher: z.string().min(1).max(180).optional(),
  description: z.string().min(1).max(1000).optional(),
  guidelinePack: z.string().min(1),
  specialtyId: z.string().min(1),
  sections: z
    .array(
      z.object({
        key: z.string().min(1).max(80),
        title: z.string().min(1).max(180),
        sectionOrder: z.number().int().min(1),
        isOptional: z.boolean().optional(),
        maxChars: z.number().min(1),
        description: z.string().min(1).max(1000).optional(),
        checklists: z.array(
          z.object({
            title: z.string().min(1).max(180).nullable(),
            items: z.array(z.string().min(1).max(500)).min(1),
          }),
        ),
      }),
    )
    .min(1),
});
