export const projectStatuses = [
  "DRAFT",
  "IN_REVIEW",
  "READY",
  "ARCHIVED",
] as const;
export type ProjectStatus = (typeof projectStatuses)[number];
export type ManuscriptType = "CASE_REPORT";

export const sectionStatuses = [
  "NOT_STARTED",
  "DRAFT",
  "IN_REVIEW",
  "READY",
] as const;
export type SectionStatus = (typeof sectionStatuses)[number];

export interface CaseReportMetadata {
  journalTarget?: string;
  specialty?: string;
  patientAge?: string;
  patientSex?: string;
  country?: string;
  institution?: string;
  articleGoals?: string;
}

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
  code: string;
  guidelinePack: {
    id?: string;
    rules: Record<string, unknown>;
  } | null;
}

export interface Project {
  id: string;
  ownerId: string;
  journalCode: string;
  targetJournal: string | null;
  journal?: Journal | null;
  manuscriptType: ManuscriptType;
  title: string;
  status: ProjectStatus;
  metadata: CaseReportMetadata | null;
  readinessScore: number | null;
  lastReviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  sections?: ProjectSection[];
}
