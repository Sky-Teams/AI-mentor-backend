import z from "zod";
import { authorSchema } from "src/modules/references/interface/reference.schema";
import { ReferenceStyles } from "src/modules/references/domain/reference";

export const citationSchema = z.object({
  style: z.enum(ReferenceStyles),
  references: z.array(
    z.object({
      reference: z.object({
        id: z.string().optional(),
        authors: z.array(authorSchema).optional(),
        publisher: z.string().min(1).nullable().optional(),
        doi: z.string().min(1).nullable().optional(),
        issue: z.string().min(1).nullable().optional(),
        volume: z.string().min(1).nullable().optional(),
        page: z.string().min(1).nullable().optional(),
        title: z.string().min(1).nullable().optional(),
        journalName: z.string().min(1).nullable().optional(),
        datePublished: z.string().min(1).nullable().optional(),
        journalNameAbbrev: z.string().min(1).nullable().optional(),
      }),
      referenceIndex: z.number().min(1),
    }),
  ),
});
