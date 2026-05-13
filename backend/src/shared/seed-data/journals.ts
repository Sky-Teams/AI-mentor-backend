export interface JournalSectionDefinition {
  key: string;
  title: string;
  order: number;
  optional: boolean;
  description: string;
}

export interface JournalDefinition {
  code: string;
  name: string;
  publisher: string;
  description: string;
  manuscriptType: "CASE_REPORT";
  isDefault?: boolean;
  sections: JournalSectionDefinition[];
  guidelinePack: string;
}

export const ELSEVIER_SCARE_JOURNAL: JournalDefinition = {
  isDefault: true,
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
      description:
        "The words 'case report' should appear in the title, and the title should be concise and highlight the area of focus.",
    },
    {
      key: "KEYWORDS",
      title: "Key Words",
      order: 2,
      optional: false,
      description:
        "Include three to six keywords that identify what is covered in the case report, and include 'case report' as one keyword.",
    },
    {
      key: "HIGHLIGHTS",
      title: "Highlights",
      order: 3,
      optional: true,
      description:
        "Include three to five bullet points capturing the novel findings, brief background, key results, clinical relevance, and any validation performed.",
    },
    {
      key: "ABSTRACT",
      title: "Abstract",
      order: 4,
      optional: false,
      description:
        "Provide a structured abstract including introduction and importance, case presentation, clinical discussion, and conclusion. Clearly explain what is known, what is unique, and what this case adds to the literature. Summarize patient details, complaints, findings, investigations, diagnosis, interventions, and outcomes. Relate clinical findings to existing knowledge and highlight the relevance and impact of the case, including at least three key take-away lessons.",
    },
    {
      key: "ARTIFICIAL_INTELLIGENCE",
      title: "Artificial Intelligence (AI)",
      order: 5,
      optional: true,
      description:
        "Clearly state whether AI was used in the study or manuscript preparation. If used, describe its purpose, scope, and stage of use, and confirm author responsibility. Provide details about each AI tool including name, vendor, model, version, and usage context. Explain data inputs, privacy safeguards, and approvals. Describe human oversight, verification, and any edits made to AI outputs. Address bias, ethical considerations, and reproducibility where applicable.",
    },
    {
      key: "INTRODUCTION",
      title: "Introduction",
      order: 6,
      optional: false,
      description:
        "Introduce the topic with relevant background information and context. Explain why this case is important, unique, or different from existing literature. Support the discussion with references to relevant studies, guidelines, and standard practices.",
    },
    {
      key: "GUIDELINE_CITATION",
      title: "Guideline Citation",
      order: 7,
      optional: true,
      description:
        "State clearly that the case report follows the SCARE (or relevant) guidelines and include the appropriate citation at the end of the introduction.",
    },
    {
      key: "TIMELINE",
      title: "Timeline",
      order: 8,
      optional: true,
      description:
        "Provide a clear and structured timeline of the case, including key events, delays in diagnosis or treatment, and important clinical milestones using standardized dates where possible.",
    },
    {
      key: "PATIENT_INFORMATION",
      title: "Patient Information",
      order: 9,
      optional: true,
      description:
        "Include de-identified patient demographics and relevant background information. Describe the presenting complaint, history of the condition, past medical and surgical history, medications, allergies, family and social history, and any other relevant contextual details.",
    },
    {
      key: "CLINICAL_FINDINGS",
      title: "Clinical Findings",
      order: 10,
      optional: true,
      description:
        "Describe the key clinical findings from physical examination and initial patient assessment, focusing on relevant and significant observations.",
    },
    {
      key: "DIAGNOSTIC_ASSESSMENT_AND_INTERPRETATION",
      title: "Diagnostic Assessment & Interpretation",
      order: 11,
      optional: true,
      description:
        "Describe all diagnostic evaluations including laboratory tests, imaging, and other assessments. Explain any challenges encountered and how they were addressed. Provide diagnostic reasoning, including differential diagnoses considered and excluded, and include prognostic information if relevant.",
    },
    {
      key: "INTERVENTION",
      title: "Intervention",
      order: 12,
      optional: true,
      description:
        "Describe the intervention in detail, including preparation, type of treatment, techniques used, and any supporting therapies. Explain the rationale, timing, and execution of the intervention. Include details about the clinical setting, operators involved, and any deviations from the planned approach.",
    },
    {
      key: "FOLLOW_UP_AND_OUTCOMES",
      title: "Follow-Up and Outcomes",
      order: 13,
      optional: true,
      description:
        "Describe the follow-up process including timing, methods, and clinical settings. Report patient adherence, response to treatment, and outcomes achieved. Compare expected and actual results, and clearly document any complications or adverse events, or explicitly state if none occurred.",
    },
    {
      key: "DISCUSSION",
      title: "Discussion",
      order: 14,
      optional: true,
      description:
        "Summarize the key findings and explain their significance. Compare the case with existing literature and similar reports. Discuss clinical implications and potential impact on practice. Highlight the main lessons learned and any recommendations for future cases.",
    },
    {
      key: "STRENGTHS_AND_LIMITATIONS",
      title: "Strengths and Limitations",
      order: 15,
      optional: true,
      description:
        "Describe the strengths of the case, including its uniqueness or multidisciplinary relevance. Also discuss limitations, challenges faced, and any risks or uncertainties related to the case or intervention.",
    },
    {
      key: "PATIENT_PERSPECTIVE",
      title: "Patient Perspective",
      order: 16,
      optional: true,
      description:
        "Include the patient’s perspective on their condition and treatment where appropriate, providing insight into their experience.",
    },
    {
      key: "INFORMED_CONSENT",
      title: "Informed Consent",
      order: 17,
      optional: true,
      description:
        "Provide clear confirmation that informed consent was obtained for both treatment and publication. Describe the method of consent and explain any exceptions if applicable.",
    },
    {
      key: "ADDITIONAL_INFORMATION",
      title: "Additional Information",
      order: 18,
      optional: true,
      description:
        "Include additional details such as author contributions, acknowledgments, conflicts of interest, funding sources, ethical approvals, prior presentations, and publication status.",
    },
    {
      key: "CLINICAL_IMAGES_AND_VIDEOS",
      title: "Clinical Images and Videos",
      order: 19,
      optional: true,
      description:
        "Include relevant clinical images or videos with clear captions, annotations, and explanations to support the case findings.",
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
