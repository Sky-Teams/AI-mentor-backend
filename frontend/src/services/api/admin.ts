import { apiClient, unwrap } from "./client";
import type {
  AdminUsageUserSummary,
  ApiSuccessResponse,
  BillingOverview,
  GuidelinePack,
  PromptTemplate,
} from "../../types/api";

type Plan = BillingOverview["plans"][number];

export const adminApi = {
  async getGuidelines(): Promise<GuidelinePack[]> {
    const response = await apiClient.get<ApiSuccessResponse<GuidelinePack[]>>(
      "/admin/guideline-packs",
    );
    return unwrap(response.data);
  },

  async getPromptTemplates(): Promise<PromptTemplate[]> {
    const response = await apiClient.get<ApiSuccessResponse<PromptTemplate[]>>(
      "/admin/prompt-templates",
    );
    return unwrap(response.data);
  },

  async getPlans(): Promise<Plan[]> {
    const response = await apiClient.get<ApiSuccessResponse<Plan[]>>("/admin/plans");
    return unwrap(response.data);
  },

  async getUsersUsage(): Promise<AdminUsageUserSummary[]> {
    const response = await apiClient.get<ApiSuccessResponse<AdminUsageUserSummary[]>>(
      "/admin/users/usage",
    );
    return unwrap(response.data);
  },
};
