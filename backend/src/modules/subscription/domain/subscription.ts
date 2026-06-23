import { PlanBillingModel } from "src/modules/billing/domain/billing";

export type SubscriptionRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export type SubscriptionPlanStatus = "ACTIVE" | "ARCHIVED";

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
  type: SubscriptionRequestType;
  subscriptionPlanId: string;
  status: SubscriptionRequestStatus;
}

export type RequestedPlans = Pick<
  SubscriptionRequest,
  "id" | "status" | "type"
> & {
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  subscriptionPlan: SubscriptionPlan & {
    status: SubscriptionPlanStatus;
  };
};
