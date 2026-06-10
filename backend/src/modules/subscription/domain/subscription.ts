import { PlanBillingModel } from "src/modules/billing/domain/billing";

export type SubscriptionRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export type SubscriptionPlanStatus = "ACTIVE" | "ARCHIVED";

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

export type RequestedPlans = Pick<SubscriptionRequest, "id" | "status"> & {
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  subscriptionPlan:  {
    createdAt: Date;
    updatedAt: Date;
    status: SubscriptionPlanStatus;
  };
};
