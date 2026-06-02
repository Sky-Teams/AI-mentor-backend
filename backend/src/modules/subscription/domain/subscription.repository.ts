import { UserSubscription } from "src/modules/billing/domain/billing";
import { SubscriptionPlan } from "./subscription";

export interface SubscriptionRepository {
  listPlans(): Promise<SubscriptionPlan[]>;
  findPlanById(subscriptionPlanId: string): Promise<SubscriptionPlan | null>;
  buyPlan(
    subscriptionPlanId: string,
    userId: string,
  ): Promise<UserSubscription>;
}
