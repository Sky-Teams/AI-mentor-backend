import { ArticleTypesStatus } from "@prisma/client";

export const SPECIALTIES = [
  "General Medicine",
  "Internal Medicine",
  "Cardiology",
  "Cardiac Surgery",
  "Thoracic Surgery",
  "Pulmonology / Respiratory Medicine",
  "Gastroenterology & Hepatology",
  "General Surgery",
  "Pediatric Surgery",
  "Neurosurgery",
  "Neurology",
  "Urology",
  "Orthopedic Surgery",
  "Plastic & Reconstructive Surgery",
  "Vascular Surgery",
  "Pediatric Medicine",
  "Obstetrics & Gynecology",
  "Oncology",
  "Hematology",
  "Nephrology",
  "Endocrinology",
  "Infectious Diseases",
  "Rheumatology",
  "Dermatology",
  "Ophthalmology",
  "Otolaryngology (ENT)",
  "Pathology",
  "Radiology",
  "Emergency Medicine",
  "Critical Care Medicine",
  "Anesthesiology",
  "Dentistry & Oral Surgery",
  "Psychiatry",
  "Family Medicine",
  "Rehabilitation Medicine",
];

export const ARTICLE_TYPES: {
  name: string;
  description: string;
  status: ArticleTypesStatus;
}[] = [
  {
    name: "Case Report",
    description:
      "Single patient with a rare, unusual, or educational condition.",
    status: "ACTIVE",
  },
  {
    name: "Case Series",
    description: "Multiple patients with a similar condition or treatment.",
    status: "INACTIVE",
  },
  {
    name: "Original Research Article",
    description: "Clinical or laboratory research with original data.",
    status: "INACTIVE",
  },
  {
    name: "Retrospective Study",
    description: "Analysis of previously collected patient data.",
    status: "INACTIVE",
  },
  {
    name: "Prospective Study",
    description: "Patients are followed forward in time.",
    status: "INACTIVE",
  },
  {
    name: "Cohort Study",
    description: "Comparison of groups over a period of time.",
    status: "INACTIVE",
  },
  {
    name: "Case-Control Study",
    description: "Comparison between patients with and without a condition.",
    status: "INACTIVE",
  },
  {
    name: "Cross-Sectional Study",
    description: "Analysis of data collected at a specific point in time.",
    status: "INACTIVE",
  },
  {
    name: "Randomized Controlled Trial (RCT)",
    description: "Patients randomly assigned to treatment groups.",
    status: "INACTIVE",
  },
  {
    name: "Systematic Review",
    description: "Structured review of published evidence.",
    status: "INACTIVE",
  },
  {
    name: "Meta-Analysis",
    description: "Statistical combination of results from multiple studies.",
    status: "INACTIVE",
  },
  {
    name: "Scoping Review",
    description: "Broad mapping and summarization of available evidence.",
    status: "INACTIVE",
  },
];
