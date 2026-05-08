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
  title: z.string().min(3).max(180),
  targetJournal: z.string().max(100),
  metadata: z
    .object({
      specialty: z.string().max(120).optional(),
      patientAge: z.string().max(40).optional(),
      patientSex: z.string().max(40).optional(),
      country: z.string().max(80).optional(),
      institution: z.string().max(180).optional(),
      articleGoals: z.string().max(400).optional(),
    })
    .optional(),
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
