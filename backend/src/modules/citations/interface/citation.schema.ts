import { z } from "zod";

const AuthorSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

const BookSchema = z.object({
  type: z.literal("BOOK"),
  publisher: z.string().min(1),
  placePublished: z.string().optional(),
  isbn: z.string().optional(),
  page: z.string().optional(),
  volumeNumber: z.number().optional(),
  edition: z.string().optional(),
});

const WebsiteSchema = z.object({
  type: z.literal("WEBSITE"),
  url: z.string().url(),
  websiteName: z.string().min(1),
  dateAccess: z.coerce.date(),
});

const JournalSchema = z.object({
  type: z.literal("JOURNAL"),
  journalName: z.string().min(1),
  volumeNumber: z.number().optional(),
  issueNumber: z.number().optional(),
  page: z.string().optional(),
  doi: z.string().optional(),
});
const ReportSchema = z.object({
  type: z.literal("REPORT"),
  publisher: z.string().optional(),
  url: z.string().optional(),
});
const BaseCitation = z.object({
  authors: z.array(AuthorSchema).min(1),
  title: z.string().min(1),
  datePublished: z.coerce.date(),
});

export const CitationSchema = z.object({
  citation: z.discriminatedUnion("type", [
    BaseCitation.merge(BookSchema),
    BaseCitation.merge(WebsiteSchema),
    BaseCitation.merge(JournalSchema),
    BaseCitation.merge(ReportSchema),
  ]),
  style: z.enum(["APA", "MLA"]),
});

export const CitationIdSchema = z.object({
  id: z.string().min(1),
});
