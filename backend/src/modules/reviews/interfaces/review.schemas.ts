import { z } from "zod";
import { issueStatuses } from "../domain/review";
import { projectSectionKeys } from "../../projects/domain/project";

export const reviewProjectParamsSchema = z.object({
  projectId: z.string().min(1),
});

export const triggerReviewSchema = z.object({
  sectionKey: z.enum(projectSectionKeys),
});

export const reviewRunParamsSchema = z.object({
  reviewRunId: z.string().min(1),
});

export const issueParamsSchema = z.object({
  issueId: z.string().min(1),
});

export const updateIssueSchema = z.object({
  status: z.enum(issueStatuses),
});
