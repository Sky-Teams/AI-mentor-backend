import type { ManuscriptType } from "../../projects/domain/project";
import type { PlanBillingModel, SubscriptionPlan } from "../../billing/domain/billing";

export interface GuidelinePack {
  id: string;
  name: string;
  code: string;
  version: string;
  description: string | null;
  manuscriptType: ManuscriptType;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  rules: Record<string, unknown>;
  isDefault: boolean;
}

export interface PromptTemplate {
  id: string;
  name: string;
  code: string;
  description: string | null;
  type: "SECTION_REVIEW" | "SYSTEM_GUARDRAIL" | "FOLLOW_UP" | "SECTION_PARAPHRASE";
  version: number;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  templateText: string;
  responseSchema: Record<string, unknown> | null;
  config: Record<string, unknown> | null;
}

export interface AdminUsageUserSummary {
  id: string;
  email: string;
  fullName: string;
  role: "USER" | "ADMIN";
  walletBalance: number;
  totalTechnicalTokens: number;
  totalBilledCredits: number;
}

export interface PlanUpsertInput {
  id?: string;
  name: string;
  code: string;
  description?: string;
  billingModel: PlanBillingModel;
  monthlyPriceCents?: number | null;
  includedCredits: number;
  status: SubscriptionPlan["status"];
}
