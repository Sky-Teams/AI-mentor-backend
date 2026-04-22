import type { ProjectSectionKey } from "../../modules/projects/domain/project";

export interface JournalChecklistItem {
  code: string;
  description: string;
}

export interface JournalSectionDefinition {
  key: ProjectSectionKey;
  title: string;
  order: number;
  optional: boolean;
  checklistItems: JournalChecklistItem[];
}

export interface JournalDefinition {
  code: string;
  name: string;
  publisher: string;
  description: string;
  manuscriptType: "CASE_REPORT";
  sections: JournalSectionDefinition[];
  validationRules: {
    checklistName: string;
    reviewFocus: string[];
    submissionRequirements: string[];
    sourceUrls: string[];
  };
}

export const ELSEVIER_SCARE_JOURNAL: JournalDefinition = {
  code: "elsevier-ijscr-scare-2025",
  name: "Elsevier Surgical Case Report (SCARE 2025)",
  publisher: "Elsevier",
  description:
    "Elsevier surgical case report template aligned with the approved SCARE Guideline Checklist 2025.",
  manuscriptType: "CASE_REPORT",
  sections: [
    {
      key: "TITLE",
      title: "Title",
      order: 1,
      optional: false,
      checklistItems: [
        {
          code: "1",
          description:
            "The words 'case report' should appear in the title, and the title should be concise and highlight the area of focus.",
        },
      ],
    },
    {
      key: "KEYWORDS",
      title: "Key Words",
      order: 2,
      optional: false,
      checklistItems: [
        {
          code: "2",
          description:
            "Include three to six keywords that identify what is covered in the case report, and include 'case report' as one keyword.",
        },
      ],
    },
    {
      key: "HIGHLIGHTS",
      title: "Highlights",
      order: 3,
      optional: false,
      checklistItems: [
        {
          code: "3",
          description:
            "Include three to five bullet points capturing the novel findings, brief background, key results, clinical relevance, and any validation performed.",
        },
      ],
    },
    {
      key: "ABSTRACT",
      title: "Abstract",
      order: 4,
      optional: false,
      checklistItems: [
        {
          code: "4a",
          description:
            "Provide a structured abstract with the headings: introduction and importance, presentation of case, clinical discussion, and conclusion.",
        },
        {
          code: "4b",
          description:
            "Describe what is known, what is unique or educational, and what this adds to the surgical literature.",
        },
        {
          code: "4c",
          description:
            "Describe complaints, demographics, concerns, findings, investigations, differentials, diagnosis, rationale for intervention, and outcome.",
        },
        {
          code: "4d",
          description:
            "Discuss the clinical findings in relation to what is currently known.",
        },
        {
          code: "4e",
          description:
            "Describe the relevance and impact of the report and provide at least three take-away lessons or implications for practice.",
        },
      ],
    },
    {
      key: "ARTIFICIAL_INTELLIGENCE",
      title: "Artificial Intelligence (AI)",
      order: 5,
      optional: true,
      checklistItems: [
        {
          code: "5",
          description:
            "Declare whether any AI was used in the research or manuscript development.",
        },
        {
          code: "5a",
          description:
            "State the purpose, scope, workflow stage, and author responsibility for AI use.",
        },
        {
          code: "5b",
          description:
            "Name each AI tool, vendor, model, version, date of use, parameters, and deployment context.",
        },
        {
          code: "5c",
          description:
            "Describe data inputs, de-identification safeguards, and approvals or agreements.",
        },
        {
          code: "5d",
          description:
            "Describe human oversight, fact-checking, verification, and any edits or discarded AI output.",
        },
        {
          code: "5e",
          description:
            "Describe bias mitigation, ethics and regulatory compliance, and conflicts involving AI vendors.",
        },
        {
          code: "5f",
          description:
            "Support reproducibility with prompts, code snippets, logs, model cards, or repository links when applicable.",
        },
      ],
    },
    {
      key: "INTRODUCTION",
      title: "Introduction",
      order: 6,
      optional: false,
      checklistItems: [
        {
          code: "6a",
          description:
            "Describe the area of focus and relevant background contextual knowledge.",
        },
        {
          code: "6b",
          description:
            "Describe why the case differs from the literature and why it is important to report.",
        },
        {
          code: "6c",
          description:
            "Reference relevant surgical literature, standards of care, and any specific guidelines or reports.",
        },
      ],
    },
    {
      key: "GUIDELINE_CITATION",
      title: "Guideline Citation",
      order: 7,
      optional: false,
      checklistItems: [
        {
          code: "7",
          description:
            "At the end of the introduction, state that the case report has been reported in line with the SCARE checklist and include the citation.",
        },
      ],
    },
    {
      key: "TIMELINE",
      title: "Timeline",
      order: 8,
      optional: false,
      checklistItems: [
        {
          code: "8",
          description:
            "Summarise the sequence of events, delays to diagnosis or intervention, and use standardised dates and times.",
        },
      ],
    },
    {
      key: "PATIENT_INFORMATION",
      title: "Patient Information",
      order: 9,
      optional: false,
      checklistItems: [
        {
          code: "9a",
          description:
            "Include de-identified demographic details and other relevant contextual patient information.",
        },
        {
          code: "9b",
          description:
            "Describe the presenting complaint, collateral history if relevant, and how and where the patient presented.",
        },
        {
          code: "9c",
          description:
            "Include past medical and surgical history, prior interventions, and relevant outcomes.",
        },
        {
          code: "9d",
          description:
            "Specify drug history, contraindications, and allergies or adverse reactions.",
        },
        {
          code: "9e",
          description:
            "Include family history, social history, and review of systems where relevant.",
        },
      ],
    },
    {
      key: "CLINICAL_FINDINGS",
      title: "Clinical Findings",
      order: 10,
      optional: false,
      checklistItems: [
        {
          code: "10",
          description:
            "Describe the general and significant clinical findings based on initial inspection and physical examination.",
        },
      ],
    },
    {
      key: "DIAGNOSTIC_ASSESSMENT_AND_INTERPRETATION",
      title: "Diagnostic Assessment & Interpretation",
      order: 11,
      optional: false,
      checklistItems: [
        {
          code: "11a",
          description:
            "Describe bedside, laboratory, imaging, and invasive diagnostic assessment.",
        },
        {
          code: "11b",
          description:
            "Describe diagnostic challenges and how they were overcome.",
        },
        {
          code: "11c",
          description:
            "Describe diagnostic reasoning, differentials considered, and exclusions.",
        },
        {
          code: "11d",
          description: "Include prognostic characteristics where applicable.",
        },
      ],
    },
    {
      key: "INTERVENTION",
      title: "Intervention",
      order: 12,
      optional: false,
      checklistItems: [
        {
          code: "12a",
          description: "Describe pre-operative patient optimisation.",
        },
        {
          code: "12b",
          description:
            "Describe intervention types, concurrent treatments, and device details.",
        },
        {
          code: "12c",
          description:
            "Describe rationale, timing, technical details, and post-operative instructions.",
        },
        {
          code: "12d",
          description:
            "Describe operator details, setting, experience, and collaboration.",
        },
        {
          code: "12e",
          description:
            "Describe deviations from the initial management plan and the rationale.",
        },
      ],
    },
    {
      key: "FOLLOW_UP_AND_OUTCOMES",
      title: "Follow-Up and Outcomes",
      order: 13,
      optional: false,
      checklistItems: [
        {
          code: "13a",
          description:
            "Specify follow-up timing, setting, clinician, method, and surveillance requirements.",
        },
        {
          code: "13b",
          description:
            "Describe intervention adherence, compliance, tolerability, and how these were measured.",
        },
        {
          code: "13c",
          description:
            "Describe expected versus attained outcomes and when they were measured.",
        },
        {
          code: "13d",
          description:
            "Describe complications, adverse events, preventive measures, and explicitly state if none occurred.",
        },
      ],
    },
    {
      key: "DISCUSSION",
      title: "Discussion",
      order: 14,
      optional: false,
      checklistItems: [
        {
          code: "14a",
          description:
            "Provide a clear summary of the key findings and rationale for conclusions.",
        },
        {
          code: "14b",
          description:
            "Include a brief discussion of the relevant literature and similar published cases when appropriate.",
        },
        {
          code: "14c",
          description:
            "Describe future implications for clinical practice and guidelines.",
        },
        {
          code: "14d",
          description:
            "Outline the key take-away lessons and any changes the authors would make in future cases.",
        },
      ],
    },
    {
      key: "STRENGTHS_AND_LIMITATIONS",
      title: "Strengths and Limitations",
      order: 15,
      optional: false,
      checklistItems: [
        {
          code: "15a",
          description:
            "Describe the key strengths of the case, including any multidisciplinary or cross-specialty relevance.",
        },
        {
          code: "15b",
          description:
            "Describe weaknesses and limitations, how challenges were overcome, and risks or alternatives for novel techniques or devices.",
        },
      ],
    },
    {
      key: "PATIENT_PERSPECTIVE",
      title: "Patient Perspective",
      order: 16,
      optional: true,
      checklistItems: [
        {
          code: "16",
          description:
            "Where appropriate, the patient should be given the opportunity to share their perspective.",
        },
      ],
    },
    {
      key: "INFORMED_CONSENT",
      title: "Informed Consent",
      order: 17,
      optional: false,
      checklistItems: [
        {
          code: "17",
          description:
            "Provide evidence of consent for the intervention and publication, state the method of consent, and explain any exceptions or tracing efforts.",
        },
      ],
    },
    {
      key: "ADDITIONAL_INFORMATION",
      title: "Additional Information",
      order: 18,
      optional: false,
      checklistItems: [
        {
          code: "18",
          description:
            "State author contributions, acknowledgements, conflicts, funding, ethics approval, prior presentation, and whether the case is under consideration elsewhere.",
        },
      ],
    },
    {
      key: "CLINICAL_IMAGES_AND_VIDEOS",
      title: "Clinical Images and Videos",
      order: 19,
      optional: true,
      checklistItems: [
        {
          code: "19",
          description:
            "Include relevant images or videos with annotations, captions, and links where appropriate.",
        },
      ],
    },
  ],
  validationRules: {
    checklistName: "SCARE Guideline Checklist 2025",
    reviewFocus: [
      "Review each section against the approved SCARE 2025 checklist items.",
      "Require de-identified patient information.",
      "Require informed consent for publication.",
      "Require an AI declaration section when AI was used.",
      "Require a SCARE 2025 guideline citation in the introduction flow.",
      "Do not allow fabricated references or facts.",
    ],
    submissionRequirements: [
      "User must select a journal before project creation.",
      "Project sections must be generated from the journal template.",
      "Section reviews must use the selected journal rules.",
      "Case reports should follow the approved SCARE 2025 topic structure.",
    ],
    sourceUrls: [
      "https://www.elsevier.com/about/policies-and-standards/research-ethics",
      "https://shop.elsevier.com/journals/international-journal-of-surgery-case-reports/2210-2612",
    ],
  },
};

export const JOURNALS: JournalDefinition[] = [ELSEVIER_SCARE_JOURNAL];
