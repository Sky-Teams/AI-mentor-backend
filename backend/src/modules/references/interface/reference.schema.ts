import { z } from "zod";
import { ReferenceValue } from "../domain/reference";

const doiPattern = /^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;

export const queryReferenceSchema = z
  .object({
    doi: z.string().trim().min(1).regex(doiPattern).optional(),
    title: z.string().trim().min(1).optional(),
    type: z.enum(ReferenceValue),
  })
  .refine((data) => data.doi || data.title, {
    message: 'Please enter title or DOI',
    path: ["title"],
  });
