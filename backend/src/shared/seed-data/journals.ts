export interface SectionChecklistsGroup {
  title: string | null;
  items: string[];
}

export interface JournalSectionDefinition {
  key: string;
  title: string;
  sectionOrder: number;
  isOptional: boolean;
  description?: string;
  checklists: SectionChecklistsGroup[];
}

export interface JournalDefinition {
  name: string;
  publisher: string;
  description?: string;
  manuscriptType: "CASE_REPORT";
  isDefault?: boolean;
  sections: JournalSectionDefinition[];
  guidelinePack: string;
}

export type CreateJournalInput = JournalDefinition;

export const ELSEVIER_SCARE_JOURNAL: JournalDefinition = {
  isDefault: true,
  name: "Elsevier Surgical Case Report (SCARE 2025)",
  publisher: "Elsevier",
  description:
    "Elsevier surgical case report template aligned with the approved SCARE Guideline Checklists 2025.",
  manuscriptType: "CASE_REPORT",
  sections: [
    {
      key: "TITLE",
      title: "Title",
      sectionOrder: 1,
      isOptional: false,
      description:
        "The words 'case report' should appear in the title, and the title should be concise and highlight the area of focus.",
      checklists: [
        {
          title: null,
          items: [
            "Include the words “case report”",
            "Keep the title concise",
            "Highlight focus area (presentation, diagnosis, intervention, outcome)",
          ],
        },
      ],
    },
    {
      key: "KEYWORDS",
      title: "Key Words",
      sectionOrder: 2,
      isOptional: false,
      description:
        "Include three to six keywords that identify what is covered in the case report, and include 'case report' as one keyword.",
      checklists: [
        {
          title: null,
          items: [
            "Add 3–6 keywords",
            "Include “case report” as one keyword",
            "Keywords should reflect diagnosis / population / intervention",
          ],
        },
      ],
    },
    {
      key: "HIGHLIGHTS",
      title: "Highlights",
      sectionOrder: 3,
      isOptional: true,
      description:
        "Include three to five bullet points capturing the novel findings, brief background, key results, clinical relevance, and any validation performed.",
      checklists: [
        {
          title: null,
          items: [
            "Add 3–5 bullet points",
            "Mention novel findings",
            "Include key results",
            "Mention clinical relevance",
            "Include validation if applicable",
          ],
        },
      ],
    },
    {
      key: "ABSTRACT",
      title: "Abstract",
      sectionOrder: 4,
      isOptional: false,
      description:
        "Provide a structured abstract including introduction and importance, case presentation, clinical discussion, and conclusion. Clearly explain what is known, what is unique, and what this case adds to the literature. Summarize patient details, complaints, findings, investigations, diagnosis, interventions, and outcomes. Relate clinical findings to existing knowledge and highlight the relevance and impact of the case, including at least three key take-away lessons.",
      checklists: [
        {
          title: "Introduction & Importance",
          items: [
            "Explain current knowledge",
            "Explain what is unique or educational",
            "State contribution to literature",
          ],
        },
        {
          title: "Presentation of Case",
          items: [
            "Describe presenting complaint",
            "Include demographic details",
            "Mention patient concerns / expectations",
            "Include findings and investigations",
            "State diagnosis / differential diagnosis",
            "Explain rationale for intervention",
            "State outcome",
          ],
        },
        {
          title: "Clinical Discussion",
          items: ["Relate findings to existing literature"],
        },
        {
          title: "Conclusion",
          items: [
            "State report relevance",
            "Mention impact on practice",
            "Include at least 3 take-away lessons",
          ],
        },
      ],
    },
    {
      key: "ARTIFICIAL_INTELLIGENCE",
      title: "Artificial Intelligence (AI)",
      sectionOrder: 5,
      isOptional: true,
      description:
        "Clearly state whether AI was used in the study or manuscript preparation. If used, describe its purpose, scope, and stage of use, and confirm author responsibility. Provide details about each AI tool including name, vendor, model, version, and usage context. Explain data inputs, privacy safeguards, and approvals. Describe human oversight, verification, and any edits made to AI outputs. Address bias, ethical considerations, and reproducibility where applicable.",
      checklists: [
        {
          title: null,
          items: [
            "Declare whether AI was used",
            "State purpose of AI use",
            "Mention tool name/version/date",
            "Describe provided inputs",
            "Confirm human verification",
            "Mention ethical compliance",
            "Include reproducibility details if needed",
          ],
        },
      ],
    },
    {
      key: "INTRODUCTION",
      title: "Introduction",
      sectionOrder: 6,
      isOptional: false,
      description:
        "Introduce the topic with relevant background information and context. Explain why this case is important, unique, or different from existing literature. Support the discussion with references to relevant studies, guidelines, and standard practices.",
      checklists: [
        {
          title: null,
          items: [
            "Describe background context",
            "Explain why case is different",
            "Explain why case is important",
            "Reference relevant literature",
            "Mention standards/guidelines",
            "Add SCARE citation statement",
          ],
        },
      ],
    },
    {
      key: "GUIDELINE_CITATION",
      title: "Guideline Citation",
      sectionOrder: 7,
      isOptional: true,
      description:
        "State clearly that the case report follows the SCARE (or relevant) guidelines and include the appropriate citation at the end of the introduction.",
      checklists: [{ title: null, items: ["Add SCARE citation statement"] }],
    },
    {
      key: "TIMELINE",
      title: "Timeline",
      sectionOrder: 8,
      isOptional: true,
      description:
        "Provide a clear and structured timeline of the case, including key events, delays in diagnosis or treatment, and important clinical milestones using standardized dates where possible.",
      checklists: [
        {
          title: null,
          items: [
            "Summarize sequence of events",
            "Mention delays if any",
            "Use dates/time clearly",
            "Add timeline table/figure if useful",
          ],
        },
      ],
    },
    {
      key: "PATIENT_INFORMATION",
      title: "Patient Information",
      sectionOrder: 9,
      isOptional: true,
      description:
        "Include de-identified patient demographics and relevant background information. Describe the presenting complaint, history of the condition, past medical and surgical history, medications, allergies, family and social history, and any other relevant contextual details.",
      checklists: [
        {
          title: "Demographics",
          items: [
            "Include age",
            "Include sex",
            "Include ethnicity if relevant",
            "Include occupation if relevant",
          ],
        },
        {
          title: "Presentation",
          items: [
            "Describe complaint",
            "Explain how patient presented",
            "Mention where patient presented",
          ],
        },
        {
          title: "History",
          items: [
            "Include past medical history",
            "Include past surgical history",
            "Mention previous outcomes if relevant",
          ],
        },
        {
          title: "Medication & Allergies",
          items: [
            "List medications",
            "Mention allergies/adverse reactions",
            "Mention contraindications if any",
          ],
        },
        {
          title: "Family & Social History",
          items: [
            "Include family conditions",
            "Mention smoking/alcohol/drug use",
            "Include social independence/accommodation",
            "Include review of systems",
          ],
        },
      ],
    },
    {
      key: "CLINICAL_FINDINGS",
      title: "Clinical Findings",
      sectionOrder: 10,
      isOptional: true,
      description:
        "Describe the key clinical findings from physical examination and initial patient assessment, focusing on relevant and significant observations.",
      checklists: [
        {
          title: null,
          items: [
            "Describe physical examination findings",
            "Include significant observations",
          ],
        },
      ],
    },
    {
      key: "DIAGNOSTIC_ASSESSMENT_AND_INTERPRETATION",
      title: "Diagnostic Assessment & Interpretation",
      sectionOrder: 11,
      isOptional: true,
      description:
        "Describe all diagnostic evaluations including laboratory tests, imaging, and other assessments. Explain any challenges encountered and how they were addressed. Provide diagnostic reasoning, including differential diagnoses considered and excluded, and include prognostic information if relevant.",
      checklists: [
        {
          title: "Investigations",
          items: [
            "Include bedside tests",
            "Include lab tests",
            "Include imaging",
            "Include invasive diagnostics if done",
          ],
        },
        {
          title: "Challenges",
          items: [
            "Describe diagnostic difficulties",
            "Explain how challenges were managed",
          ],
        },
        {
          title: "Reasoning",
          items: [
            "Mention differential diagnoses",
            "Explain inclusion/exclusion reasoning",
          ],
        },
        {
          title: "Prognostic Factors",
          items: ["Include staging / prognostic characteristics if relevant"],
        },
      ],
    },
    {
      key: "INTERVENTION",
      title: "Intervention",
      sectionOrder: 12,
      isOptional: true,
      description:
        "Describe the intervention in detail, including preparation, type of treatment, techniques used, and any supporting therapies. Explain the rationale, timing, and execution of the intervention. Include details about the clinical setting, operators involved, and any deviations from the planned approach.",
      checklists: [
        {
          title: "Preparation",
          items: ["Mention optimization steps", "Mention pre-op preparation"],
        },
        {
          title: "Treatment",
          items: [
            "Describe intervention type",
            "Mention concurrent treatments",
            "Specify devices/manufacturer if used",
          ],
        },
        {
          title: "Procedure Details",
          items: [
            "Explain rationale",
            "Describe how intervention was performed",
            "Include timing",
            "Mention novelty if applicable",
            "Include dosage/route/duration for medications",
          ],
        },
        {
          title: "Operator Details",
          items: [
            "Mention operator experience",
            "Mention intervention setting",
            "Mention collaboration if applicable",
          ],
        },
        {
          title: "Changes to Plan",
          items: ["State deviations from original plan", "Explain reasons"],
        },
      ],
    },
    {
      key: "FOLLOW_UP_AND_OUTCOMES",
      title: "Follow-Up and Outcomes",
      sectionOrder: 13,
      isOptional: true,
      description:
        "Describe the follow-up process including timing, methods, and clinical settings. Report patient adherence, response to treatment, and outcomes achieved. Compare expected and actual results, and clearly document any complications or adverse events, or explicitly state if none occurred.",
      checklists: [
        {
          title: "Follow-Up Details",
          items: [
            "Mention timing",
            "Mention location",
            "Mention responsible clinician",
            "Describe follow-up method",
          ],
        },
        {
          title: "Adherence",
          items: [
            "Describe compliance",
            "Explain tolerance to treatment",
            "Explain measurement method",
          ],
        },
        {
          title: "Outcomes",
          items: [
            "Compare expected vs actual outcomes",
            "Include patient-reported outcomes if available",
            "Mention when outcomes were recorded",
          ],
        },
        {
          title: "Complications",
          items: [
            "Report complications/adverse events",
            "Mention prevention measures",
            "State management steps",
            "State if no complications occurred",
          ],
        },
      ],
    },
    {
      key: "DISCUSSION",
      title: "Discussion",
      sectionOrder: 14,
      isOptional: true,
      description:
        "Summarize the key findings and explain their significance. Compare the case with existing literature and similar reports. Discuss clinical implications and potential impact on practice. Highlight the main lessons learned and any recommendations for future cases.",
      checklists: [
        {
          title: "Summary",
          items: ["Summarize key findings", "Explain conclusions"],
        },
        {
          title: "Literature Comparison",
          items: ["Compare with published cases"],
        },
        { title: "Implications", items: ["Explain future clinical relevance"] },
        {
          title: "Lessons Learned",
          items: [
            "State clinical takeaways",
            "Mention future practice changes",
          ],
        },
      ],
    },
    {
      key: "STRENGTHS_AND_LIMITATIONS",
      title: "Strengths and Limitations",
      sectionOrder: 15,
      isOptional: true,
      description:
        "Describe the strengths of the case, including its uniqueness or multidisciplinary relevance. Also discuss limitations, challenges faced, and any risks or uncertainties related to the case or intervention.",
      checklists: [
        {
          title: "Strengths",
          items: [
            "Highlight major strengths",
            "Mention multidisciplinary relevance if applicable",
          ],
        },
        {
          title: "Limitations",
          items: [
            "Describe weaknesses",
            "Explain challenges",
            "Mention risks / contraindications if relevant",
          ],
        },
      ],
    },
    {
      key: "PATIENT_PERSPECTIVE",
      title: "Patient Perspective",
      sectionOrder: 16,
      isOptional: true,
      description:
        "Include the patient’s perspective on their condition and treatment where appropriate, providing insight into their experience.",
      checklists: [
        {
          title: null,
          items: [
            "Include patient perspective if possible",
            "Add anonymized quote if available",
          ],
        },
      ],
    },
    {
      key: "INFORMED_CONSENT",
      title: "Informed Consent",
      sectionOrder: 17,
      isOptional: true,
      description:
        "Provide clear confirmation that informed consent was obtained for both treatment and publication. Describe the method of consent and explain any exceptions if applicable.",
      checklists: [
        {
          title: null,
          items: [
            "Confirm consent obtained",
            "Mention consent type",
            "Explain absence of consent if unavailable",
          ],
        },
      ],
    },
    {
      key: "ADDITIONAL_INFORMATION",
      title: "Additional Information",
      sectionOrder: 18,
      isOptional: true,
      description:
        "Include additional details such as author contributions, acknowledgments, conflicts of interest, funding sources, ethical approvals, prior presentations, and publication status.",
      checklists: [
        {
          title: null,
          items: [
            "Mention author contributions",
            "Add acknowledgements",
            "Declare conflicts of interest",
            "Mention funding sources",
            "Mention ethical approval if required",
            "Declare prior conference presentation if applicable",
          ],
        },
      ],
    },
    {
      key: "CLINICAL_IMAGES_AND_VIDEOS",
      title: "Clinical Images and Videos",
      sectionOrder: 19,
      isOptional: true,
      description:
        "Include relevant clinical images or videos with clear captions, annotations, and explanations to support the case findings.",
      checklists: [
        {
          title: null,
          items: [
            "Include relevant media",
            "Ensure proper annotation",
            "Add captions",
            "Highlight key points",
            "Add video link if available",
          ],
        },
      ],
    },
  ],

  guidelinePack: `
  You are reviewing a medical case report section based on journal-specific standards.

  General expectations:
  - Ensure the content follows CARE-style case reporting principles and is complete, structured, and publication-ready.
  - Maintain clarity, logical flow, and professional academic tone throughout the section.
  - Do not fabricate any patient data, clinical findings, timelines, references, or outcomes.
  - Clearly identify any missing, unclear, or inconsistent information and raise explicit questions.
  - Ensure ethical considerations, patient safety, and consent-related aspects are properly addressed where applicable.

  Content quality:
  - The section should be precise, concise, and clinically meaningful.
  - Avoid redundancy while ensuring all critical details are included.
  - Use medically accurate terminology and consistent reasoning.

  Review behavior:
  - Highlight gaps, weaknesses, or inconsistencies in the section.
  - Provide actionable and specific suggestions for improvement.
  - If key information is missing, explicitly state what is missing and why it matters.
  - Ensure the content aligns with real-world clinical practice and existing literature.

  Section-specific expectations:
  - Follow the specific purpose and structure of the section being reviewed.
  - Ensure all required elements for this section are present and well-developed.
  - Tailor feedback to the role of this section within the overall case report.

  Output expectations:
  - Focus on constructive, practical, and journal-oriented feedback.
  - Prioritize issues that impact publication readiness and scientific quality.
  `,
};
