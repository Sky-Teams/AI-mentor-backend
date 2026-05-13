import z from "zod";

export const journalIdParamsSchema = z.object({
  id: z.string().min(1),
});
