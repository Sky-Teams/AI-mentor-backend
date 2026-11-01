import { UserSubscription } from "src/modules/billing/domain/billing.js";
import {
  RequestedPlans,
  SubscriptionPlan,
  SubscriptionRequest,
} from "./subscription";
import { AiTarget } from "src/shared/ai/ai-client.js";

export interface SubscriptionRepository {
  listPlans(): Promise<SubscriptionPlan[]>;
  findPlanById(subscriptionPlanId: string): Promise<SubscriptionPlan | null>;
  buyPlan(
    subscriptionPlanId: string,
    userId: string,
  ): Promise<SubscriptionRequest | UserSubscription>;
  getRequestedPlans(): Promise<RequestedPlans[]>;
  approveRequestedPlan(userId: string, id: string): Promise<RequestedPlans>;
  upgradePlan(
    subscriptionPlanId: string,
    userId: string,
  ): Promise<SubscriptionRequest | UserSubscription>;
  getActivePlan(userId: string): Promise<UserSubscription | null>;
  cancelRequestedPlan(id: string, userId: string): Promise<RequestedPlans>;
  getUserRequestedPlan(userId: string): Promise<RequestedPlans | null>;
  expirePlans(): Promise<{ message: string }>;
  getAiTargetForUser(userId: string): Promise<AiTarget>;
}
