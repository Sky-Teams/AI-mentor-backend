import { ApiSuccessResponse } from "../../types/api";
import { apiClient, unwrap } from "./client";

export const planBillingModels = [
  "FREE",
  "MONTHLY",
  "CREDIT_PACK",
  "HYBRID",
] as const;
export type PlanBillingModel = (typeof planBillingModels)[number];

export type SubscriptionRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export type SubscriptionRequestType = "PURCHASE" | "UPGRADE";

export interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  description: string | null;
  billingModel: PlanBillingModel;
  monthlyPriceCents: number | null;
  includedCredits: number;
}

export interface SubscriptionRequest {
  id: string;
  userId: string;
  subscriptionPlanId: string;
  status: SubscriptionRequestStatus;
  type: SubscriptionRequestType;
}

export type RequestedPlans = Pick<
  SubscriptionRequest,
  "status" | "id" | "type"
> & {
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  subscriptionPlan: SubscriptionPlan;
};

export const subscriptionApi = {
  async listPlans() {
    const response =
      await apiClient.get<ApiSuccessResponse<SubscriptionPlan[]>>(
        `/subscriptions/plans`,
      );

    return unwrap(response.data);
  },

  async buyPlan(subscriptionPlanId: string) {
    const response = await apiClient.patch<
      ApiSuccessResponse<SubscriptionRequest>
    >(`/subscriptions/plans/buy/${subscriptionPlanId}`);

    return unwrap(response.data);
  },

  async upgradePlan(subscriptionPlanId: string) {
    const response = await apiClient.patch<
      ApiSuccessResponse<SubscriptionRequest>
    >(`/subscriptions/plans/upgrade/${subscriptionPlanId}`);

    return unwrap(response.data);
  },

  async getActivePlan() {
    const response = await apiClient.get<ApiSuccessResponse<any>>(
      `/subscriptions/plans/active`,
    );
    return unwrap(response.data);
  },

  async getUserRequestedPlan() {
    const response = await apiClient.get<ApiSuccessResponse<RequestedPlans>>(
      `/subscriptions/plans/requested-plan`,
    );

    return unwrap(response.data);
  },

  async cancelRequestedPlan(id: string) {
    const response = await apiClient.patch<ApiSuccessResponse<RequestedPlans>>(
      `/subscriptions/plans/requested-plan/${id}/cancel`,
    );

    return unwrap(response.data);
  },
};
