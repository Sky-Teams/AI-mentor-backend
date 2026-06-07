import { z } from "zod";
export const referenceTypes = ["JOURNAL", "BOOK"] as const;

const doiPattern = /^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;

export const queryRefereceSchema = z.object({
  doi: z.string().trim().min(1).regex(doiPattern).optional(),
  title: z.string().trim().min(1).optional(),
  type: z.enum(referenceTypes),
});
