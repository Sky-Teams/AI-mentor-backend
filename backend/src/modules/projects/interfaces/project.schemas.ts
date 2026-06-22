import { z } from "zod";
import { projectStatuses } from "../domain/project";

export const projectIdParamsSchema = z.object({
  projectId: z.string().min(1),
});

export const sectionParamsSchema = z.object({
  projectId: z.string().min(1),
  sectionKey: z.string().min(1),
});

export const createProjectSchema = z.object({
  articleTypeId: z.string().cuid(),
  specialtyId: z.string().cuid(),
  targetJournal: z.string().cuid(),
  title: z.string().min(3).max(180),
});

export const updateProjectSchema = z.object({
  title: z.string().min(3).max(180).optional(),
  targetJournal: z.string().max(180).nullable().optional(),
  status: z.enum(projectStatuses).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateSectionSchema = z.object({
  content: z.string().max(60000),
  changeSummary: z.string().max(240).optional(),
});

export const toggleSectionChecklistItemSchema = z.object({
  projectId: z.string(),
  sectionKey: z.string(),
  checklistId: z.string(),
  itemIndex: z.coerce.number().int().min(0),
});
