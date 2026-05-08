export const reviewRunStatuses = ["QUEUED", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"] as const;
export type ReviewRunStatus = (typeof reviewRunStatuses)[number];

export const issueSeverities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type IssueSeverity = (typeof issueSeverities)[number];

export const issueStatuses = ["OPEN", "RESOLVED", "IGNORED"] as const;
export type IssueStatus = (typeof issueStatuses)[number];

export const readinessStatuses = [
  "NOT_READY",
  "NEEDS_ATTENTION",
  "READY_FOR_INTERNAL_REVIEW",
  "READY_FOR_SUBMISSION",
] as const;
export type ReadinessStatus = (typeof readinessStatuses)[number];

export interface AiReviewIssue {
  category: string;
  severity: IssueSeverity;
  title: string;
  description: string;
  reason: string;
  fixSuggestion: string;
}

export interface AiReviewSuggestion {
  type: string;
  title: string;
  content: string;
}

export interface AiReviewMetric {
  name: string;
  score: number;
  weight?: number;
  rationale?: string;
}

export interface AiSectionReviewResult {
  summary: string;
  issues: AiReviewIssue[];
  missingInfoQuestions: string[];
  nextSteps: string[];
  suggestions: AiReviewSuggestion[];
  metrics: AiReviewMetric[];
  warnings: string[];
  overallScore: number;
  readinessIndicator: number;
}

export interface ReviewRun {
  id: string;
  projectId: string;
  sectionId: string;
  initiatedById: string;
  aiModel: string;
  status: ReviewRunStatus;
  summary: string | null;
  overallScore: number | null;
  readinessIndicator: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  appCreditsConsumed: number;
  errorMessage: string | null;
  createdAt: Date;
  completedAt: Date | null;
  sectionKey?: string;
  issues?: ReviewIssue[];
  suggestions?: ReviewSuggestion[];
  metrics?: ReviewMetric[];
  missingInfoQuestions?: string[];
  nextSteps?: string[];
  warnings?: string[];
}

export interface ReviewIssue {
  id: string;
  reviewRunId: string;
  projectId: string;
  sectionId: string;
  severity: IssueSeverity;
  category: string;
  title: string;
  description: string;
  reason: string;
  fixSuggestion: string;
  status: IssueStatus;
  resolvedAt: Date | null;
  resolvedById: string | null;
}

export interface ReviewSuggestion {
  id: string;
  reviewRunId: string;
  type: string;
  title: string;
  content: string;
}

export interface ReviewMetric {
  id: string;
  reviewRunId: string;
  name: string;
  score: number;
  weight: number | null;
  rationale: string | null;
}

export interface ReadinessSnapshot {
  id: string;
  projectId: string;
  overallScore: number;
  status: ReadinessStatus;
  summary: string;
  blockers: string[];
  strengths: string[];
  sectionScores: Record<string, number>;
  createdAt: Date;
}
