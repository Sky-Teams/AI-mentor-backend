export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export type Role = "USER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: User;
  tokens: AuthTokens;
}

export type ProjectStatus = "DRAFT" | "IN_REVIEW" | "READY" | "ARCHIVED";
export type SectionStatus = "NOT_STARTED" | "DRAFT" | "IN_REVIEW" | "READY";
export type ProjectSectionKey =
  | "TITLE"
  | "ABSTRACT"
  | "KEYWORDS"
  | "INTRODUCTION"
  | "CASE_PRESENTATION"
  | "DISCUSSION"
  | "CONCLUSION"
  | "PATIENT_PERSPECTIVE"
  | "INFORMED_CONSENT"
  | "REFERENCES"
  | "COVER_LETTER";

export interface ProjectSection {
  id: string;
  projectId: string;
  key: ProjectSectionKey;
  title: string;
  content: string;
  sectionOrder: number;
  isOptional: boolean;
  status: SectionStatus;
  lastEditedAt: string | null;
  updatedAt: string;
}

export interface Project {
  id: string;
  ownerId: string;
  manuscriptType: "CASE_REPORT";
  title: string;
  status: ProjectStatus;
  targetJournal: string | null;
  metadata: Record<string, unknown> | null;
  readinessScore: number | null;
  lastReviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  sections?: ProjectSection[];
}

export type IssueSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type IssueStatus = "OPEN" | "RESOLVED" | "IGNORED";

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
  resolvedAt: string | null;
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

export interface ReviewRun {
  id: string;
  projectId: string;
  sectionId: string;
  initiatedById: string;
  aiModel: string;
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  summary: string | null;
  overallScore: number | null;
  readinessIndicator: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  appCreditsConsumed: number;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
  sectionKey?: ProjectSectionKey;
  issues?: ReviewIssue[];
  suggestions?: ReviewSuggestion[];
  metrics?: ReviewMetric[];
  missingInfoQuestions?: string[];
  nextSteps?: string[];
  warnings?: string[];
}

export type ToneType = "SIMPLE"| "ACADEMIC"| "CASUAL"| "NATURAL" 
export type LengthStrategy = "SHORTEN"| "MAINTAIN"

export interface ParaphraseChange {
  originalPhrase: string;
  replacedWith: string;
  reason: string;
  startIndex?: number;
  endIndex?: number;
}

export interface ParaphraseMetric {
  name: string;
  score: number;
  label: string;
  retionale?: string;
}

export interface GrammarTip {
  ruleName: string;
  explanation: string;
  example?: string;
}

export interface ParaphraseRun {
  id: string;
  projectId: string;
  sectionId: string;
  initiatedById: string;
  originalText: string;
  paraphrasedText: string;
  grammarTips?: GrammarTip[];
  tone?: ToneType;
  changes?: ParaphraseChange[];
  metrics?: ParaphraseMetric[];
  aiModel: string;
  preservedWords: string[];
  lengthStrategy: LengthStrategy;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  appCreditsConsumed: number;
  errorMessage: string | null;
  createdAt: Date;
  completedAt: Date | null;
}


export interface ReadinessSnapshot {
  id: string;
  projectId: string;
  overallScore: number;
  status:
    | "NOT_READY"
    | "NEEDS_ATTENTION"
    | "READY_FOR_INTERNAL_REVIEW"
    | "READY_FOR_SUBMISSION";
  summary: string;
  blockers: string[];
  strengths: string[];
  sectionScores: Record<string, number>;
  createdAt: string;
}

export interface BillingOverview {
  wallet: {
    id: string;
    userId: string;
    balance: number;
    lifetimeCreditsGranted: number;
    lifetimeCreditsConsumed: number;
  };
  activeSubscription: {
    id: string;
    status: string;
    currentPeriodEnd: string;
    subscriptionPlan?: {
      name: string;
      code: string;
      includedCredits: number;
      monthlyPriceCents: number | null;
    };
  } | null;
  plans: Array<{
    id: string;
    name: string;
    code: string;
    description: string | null;
    billingModel: string;
    monthlyPriceCents: number | null;
    includedCredits: number;
    status: string;
  }>;
  recentTransactions: Array<{
    id: string;
    type: string;
    source: string;
    amount: number;
    balanceAfter: number;
    description: string | null;
    createdAt: string;
  }>;
  recentUsage: Array<{
    id: string;
    model: string;
    technicalTotalTokens: number;
    billedCredits: number;
    status: string;
    createdAt: string;
  }>;
}

export interface GuidelinePack {
  id: string;
  name: string;
  code: string;
  version: string;
  description: string | null;
  manuscriptType: "CASE_REPORT";
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  rules: Record<string, unknown>;
  isDefault: boolean;
}

export interface PromptTemplate {
  id: string;
  name: string;
  code: string;
  description: string | null;
  type: string;
  version: number;
  status: string;
  templateText: string;
}

export interface AdminUsageUserSummary {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  walletBalance: number;
  totalTechnicalTokens: number;
  totalBilledCredits: number;
}
