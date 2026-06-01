import { PlanBillingModel } from "src/modules/billing/domain/billing";

export interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  description: string | null;
  billingModel: PlanBillingModel;
  monthlyPriceCents: number | null;
  includedCredits: number;
}