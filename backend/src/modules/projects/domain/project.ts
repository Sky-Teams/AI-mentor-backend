import { ArticleTypesStatus } from "@prisma/client";

export const projectStatuses = [
  "DRAFT",
  "IN_REVIEW",
  "READY",
  "ARCHIVED",
] as const;
export type ProjectStatus = (typeof projectStatuses)[number];

export const sectionStatuses = [
  "NOT_STARTED",
  "DRAFT",
  "IN_REVIEW",
  "READY",
] as const;
export type SectionStatus = (typeof sectionStatuses)[number];

export interface ProjectSection {
  id: string;
  projectId: string;
  key: string;
  title: string;
  content: string;
  sectionOrder: number;
  isOptional: boolean;
  status: SectionStatus;
  lastEditedAt: Date | null;
  updatedAt: Date;
  checklist?: Array<{
    id: string;
    title: string | null;
    items: Array<{ text: string; checked: boolean }>;
  }>;
}

export interface SectionVersion {
  id: string;
  sectionId: string;
  versionNumber: number;
  content: string;
  changeSummary: string | null;
  editedById: string;
  createdAt: Date;
}

export interface Journal {
  guidelinePack: {
    id?: string;
    rules: Record<string, unknown>;
  } | null;
}

export type ArticleType = {
  name: string;
  description?: string;
  status: ArticleTypesStatus;
};
export interface Project {
  id: string;
  ownerId: string;
  targetJournal: string | null;
  journal?: Journal | null;
  title: string;
  status: ProjectStatus;
  readinessScore: number | null;
  lastReviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  sections?: ProjectSection[];
  specialty: string;
  articleType: ArticleType;
}
