import { z } from "zod";
import { ReferenceStyles, ReferenceValue } from "../domain/reference";

const doiPattern = /^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;

export const queryReferenceSchema = z
  .object({
    doi: z.string().trim().min(1).regex(doiPattern).optional(),
    title: z.string().trim().min(1).optional(),
    type: z.enum(ReferenceValue),
  })
  .refine((data) => data.doi || data.title, {
    message: "Please enter title or DOI",
    path: ["title"],
  });

const authorSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

const journalSchema = z.object({
  type: z.literal("JOURNAL"),
  reference: z.object({
    authors: z.array(authorSchema).optional(),
    publisher: z.string().min(1).nullable().optional(),
    doi: z.string().min(1).nullable().optional(),
    issue: z.string().min(1).nullable().optional(),
    volume: z.string().min(1).nullable().optional(),
    page: z.string().min(1).nullable().optional(),
    title: z.string().min(1).nullable().optional(),
    journalName: z.string().min(1).nullable().optional(),
    datePublished: z.string().min(1).nullable().optional(),
  }),
});

export const referenceSchema = z.object({
  references: z.array(z.discriminatedUnion("type", [journalSchema])),
  style: z.enum(ReferenceStyles),
});
