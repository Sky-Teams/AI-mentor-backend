import type { SubscriptionPlan } from "../../billing/domain/billing";
import type {
  AdminUsageUserSummary,
  GuidelinePack,
  PromptTemplate,
  PlanUpsertInput,
} from "../domain/admin";
import type { AdminRepository } from "../domain/admin.repository";
import { AppError } from "../../../shared/errors/app-error";

export class AdminService {
  public constructor(private readonly adminRepository: AdminRepository) {}

  public async listGuidelinePacks(): Promise<GuidelinePack[]> {
    return this.adminRepository.listGuidelinePacks();
  }

  public async upsertGuidelinePack(input: {
    id?: string;
    name: string;
    code: string;
    version: string;
    description?: string;
    status: GuidelinePack["status"];
    rules: Record<string, unknown>;
    isDefault: boolean;
  }): Promise<GuidelinePack> {
    return this.adminRepository.upsertGuidelinePack(input);
  }

  public async listPromptTemplates(): Promise<PromptTemplate[]> {
    return this.adminRepository.listPromptTemplates();
  }

  public async upsertPromptTemplate(input: {
    id?: string;
    name: string;
    code: string;
    description?: string;
    type: PromptTemplate["type"];
    version?: number;
    status: PromptTemplate["status"];
    templateText: string;
    customContent?: string | null;
    responseSchema?: Record<string, unknown>;
    config?: Record<string, unknown>;
  }): Promise<PromptTemplate> {
    return this.adminRepository.upsertPromptTemplate(input);
  }

  public async updatePromptTemplateCustomContent(
    id: string,
    customContent: string | null,
  ): Promise<PromptTemplate> {
    const template =
      await this.adminRepository.updatePromptTemplateCustomContent(
        id,
        customContent,
      );
    if (!template) {
      throw new AppError(
        "Prompt template not found.",
        404,
        "PROMPT_TEMPLATE_NOT_FOUND",
      );
    }
    return template;
  }

  public async listPlans(): Promise<SubscriptionPlan[]> {
    return this.adminRepository.listPlans();
  }

  public async upsertPlan(input: PlanUpsertInput): Promise<SubscriptionPlan> {
    return this.adminRepository.upsertPlan(input);
  }

  public async listUsersUsage(): Promise<AdminUsageUserSummary[]> {
    return this.adminRepository.listUsersUsage();
  }
}
