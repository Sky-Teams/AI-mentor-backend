import { UserSubscription } from "src/modules/billing/domain/billing";
import { SubscriptionPlan } from "./subscription";

export interface SubscriptionRepository {
  listPlans(): Promise<SubscriptionPlan[]>;
  getPlan(subscriptionPlanId: string): Promise<SubscriptionPlan | null>;
}
