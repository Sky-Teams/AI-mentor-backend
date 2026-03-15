import type { ProjectSectionKey } from "../../modules/projects/domain/project";

export interface SectionDefinition {
  key: ProjectSectionKey;
  title: string;
  order: number;
  optional: boolean;
}

export const CASE_REPORT_SECTION_DEFINITIONS: SectionDefinition[] = [
  { key: "TITLE", title: "Title", order: 1, optional: false },
  { key: "ABSTRACT", title: "Abstract", order: 2, optional: false },
  { key: "KEYWORDS", title: "Keywords", order: 3, optional: false },
  { key: "INTRODUCTION", title: "Introduction", order: 4, optional: false },
  { key: "CASE_PRESENTATION", title: "Case Presentation", order: 5, optional: false },
  { key: "DISCUSSION", title: "Discussion", order: 6, optional: false },
  { key: "CONCLUSION", title: "Conclusion", order: 7, optional: false },
  { key: "PATIENT_PERSPECTIVE", title: "Patient Perspective", order: 8, optional: true },
  { key: "INFORMED_CONSENT", title: "Informed Consent / Ethical Statement", order: 9, optional: false },
  { key: "REFERENCES", title: "References", order: 10, optional: false },
  { key: "COVER_LETTER", title: "Cover Letter", order: 11, optional: true },
];

export const REQUIRED_SECTION_KEYS = CASE_REPORT_SECTION_DEFINITIONS.filter(
  (section) => !section.optional,
).map((section) => section.key);
