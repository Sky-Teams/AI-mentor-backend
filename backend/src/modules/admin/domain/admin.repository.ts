import type { SubscriptionPlan } from "../../billing/domain/billing";
import type { GuidelinePack, PromptTemplate, AdminUsageUserSummary, PlanUpsertInput } from "./admin";

export interface AdminRepository {
  listGuidelinePacks(): Promise<GuidelinePack[]>;
  upsertGuidelinePack(input: {
    id?: string;
    name: string;
    code: string;
    version: string;
    description?: string;
    status: GuidelinePack["status"];
    rules: Record<string, unknown>;
    isDefault: boolean;
  }): Promise<GuidelinePack>;
  listPromptTemplates(): Promise<PromptTemplate[]>;
  upsertPromptTemplate(input: {
    id?: string;
    name: string;
    code: string;
    description?: string;
    type: PromptTemplate["type"];
    version?: number;
    status: PromptTemplate["status"];
    templateText: string;
    responseSchema?: Record<string, unknown>;
    config?: Record<string, unknown>;
  }): Promise<PromptTemplate>;
  listPlans(): Promise<SubscriptionPlan[]>;
  upsertPlan(input: PlanUpsertInput): Promise<SubscriptionPlan>;
  listUsersUsage(): Promise<AdminUsageUserSummary[]>;
}
