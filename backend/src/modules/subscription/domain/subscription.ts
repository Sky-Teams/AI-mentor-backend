import { PlanBillingModel } from "src/modules/billing/domain/billing";

export type SubscriptionRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

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
}
