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
        title: z.string().min(1).max(180),
        sectionOrder: z.number().int().min(1),
        isOptional: z.boolean().optional(),
        maxChars: z.number().min(1),
        sectionPrompt: z.string().min(1).optional(),
        checklists: z.array(
          z.object({
            title: z.string().min(1).max(180).nullable(),
            items: z.array(z.string().min(1).max(500)).optional().default([]),
          }),
        ),
        subsections: z
          .array(
            z.object({
              title: z.string().min(1).max(180),
              sectionOrder: z.number().int().min(1),
              isOptional: z.boolean().optional(),
              maxChars: z.number().min(1),
              sectionPrompt: z.string().min(1).max(1000).optional(),
              checklists: z
                .array(
                  z.object({
                    title: z.string().min(1).max(180).nullable(),
                    items: z.array(z.string().min(1).max(500)).optional().default([]),
                  }),
                )
                .optional()
                .default([]),
            }),
          )
          .optional(),
      }),
    )
    .min(1),
});

export const specialtyIdQuerySchema = z.object({
  specialtyId: z.string().cuid().optional(),
});

export const updateJournalSchema = z.object({
  name: z.string().min(1).max(180).optional(),
  publisher: z.string().min(1).max(180).optional(),
  description: z.string().min(1).max(1000).optional(),
  guidelinePack: z.string().min(1).optional(),
  specialtyId: z.string().min(1).optional(),
  sections: z
    .array(
      z.object({
        id: z.string().optional(),
        title: z.string().min(1).max(180).optional(),
        sectionOrder: z.number().int().min(1).optional(),
        isOptional: z.boolean().optional().optional(),
        maxChars: z.number().min(1).optional(),
        sectionPrompt: z.string().min(1).max(1000).optional(),
        checklists: z
          .array(
            z.object({
              id: z.string().optional(),
              title: z.string().min(1).max(180).nullable().optional(),
              items: z.array(z.string().min(1).max(500)).optional().default([]),
            }),
          )
          .optional(),
        subsections: z
          .array(
            z.object({
              id: z.string().optional(),
              title: z.string().min(1).max(180).optional(),
              sectionOrder: z.number().int().min(1).optional(),
              isOptional: z.boolean().optional(),
              maxChars: z.number().min(1).optional(),
              sectionPrompt: z.string().min(1).max(1000).optional(),
              checklists: z
                .array(
                  z.object({
                    id: z.string().optional(),
                    title: z.string().min(1).max(180).nullable().optional(),
                    items: z
                      .array(z.string().min(1).max(500))
                      .optional()
                      .default([]),
                  }),
                )
                .optional()
                .default([]),
            }),
          )
          .optional(),
      }),
    )
    .min(1)
    .optional(),
});
