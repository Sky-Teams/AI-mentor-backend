import { ApiSuccessResponse } from "../../types/api";
import { apiClient, unwrap } from "./client";

export const planBillingModels = [
  "FREE",
  "MONTHLY",
  "CREDIT_PACK",
  "HYBRID",
] as const;
export type PlanBillingModel = (typeof planBillingModels)[number];

export const subscriptionStatuses = [
  "ACTIVE",
  "PAST_DUE",
  "CANCELLED",
  "EXPIRED",
  "TRIALING",
  "PENDING",
] as const;
export type UserSubscriptionStatus = (typeof subscriptionStatuses)[number];

export interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  description: string | null;
  billingModel: PlanBillingModel;
  monthlyPriceCents: number | null;
  includedCredits: number;
}

export interface UserSubscription {
  id: string;
  userId: string;
  subscriptionPlanId: string;
  status: UserSubscriptionStatus;
  startedAt: Date;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  autoRenew: boolean;
  subscriptionPlan?: SubscriptionPlan;
}

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
      ApiSuccessResponse<UserSubscription>
    >(`/subscriptions/plans/buy/${subscriptionPlanId}`);

    return unwrap(response.data);
  },
};
