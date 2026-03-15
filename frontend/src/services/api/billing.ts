import { apiClient, unwrap } from "./client";
import type { ApiSuccessResponse, BillingOverview } from "../../types/api";

export const billingApi = {
  async getOverview(): Promise<BillingOverview> {
    const response = await apiClient.get<ApiSuccessResponse<BillingOverview>>(
      "/billing/overview",
    );
    return unwrap(response.data);
  },
};
