import { SubscriptionPlan, SubscriptionRequest } from "./subscription";

export interface SubscriptionRepository {
  listPlans(): Promise<SubscriptionPlan[]>;
  findPlanById(subscriptionPlanId: string): Promise<SubscriptionPlan | null>;
  buyPlan(
    subscriptionPlanId: string,
    userId: string,
  ): Promise<SubscriptionRequest>;
}
