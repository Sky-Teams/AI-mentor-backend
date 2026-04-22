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

export const projectSectionKeys = [
  "TITLE",
  "KEYWORDS",
  "HIGHLIGHTS",
  "ABSTRACT",
  "ARTIFICIAL_INTELLIGENCE",
  "INTRODUCTION",
  "GUIDELINE_CITATION",
  "TIMELINE",
  "PATIENT_INFORMATION",
  "CLINICAL_FINDINGS",
  "DIAGNOSTIC_ASSESSMENT_AND_INTERPRETATION",
  "INTERVENTION",
  "FOLLOW_UP_AND_OUTCOMES",
  "DISCUSSION",
  "STRENGTHS_AND_LIMITATIONS",
  "PATIENT_PERSPECTIVE",
  "INFORMED_CONSENT",
  "ADDITIONAL_INFORMATION",
  "CLINICAL_IMAGES_AND_VIDEOS",
] as const;

export type ProjectSectionKey = (typeof projectSectionKeys)[number];

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
  key: ProjectSectionKey;
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

export interface Project {
  id: string;
  ownerId: string;
  journalCode: string;
  manuscriptType: ManuscriptType;
  title: string;
  status: ProjectStatus;
  targetJournal: string | null;
  metadata: CaseReportMetadata | null;
  readinessScore: number | null;
  lastReviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  sections?: ProjectSection[];
}
