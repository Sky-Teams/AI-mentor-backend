import { UserSubscription } from "src/modules/billing/domain/billing.js";
import {
  RequestedPlans,
  SubscriptionPlan,
  SubscriptionRequest,
} from "./subscription";

export interface SubscriptionRepository {
  listPlans(): Promise<SubscriptionPlan[]>;
  findPlanById(subscriptionPlanId: string): Promise<SubscriptionPlan | null>;
  buyPlan(
    subscriptionPlanId: string,
    userId: string,
  ): Promise<SubscriptionRequest>;
  getRequestedPlans(): Promise<RequestedPlans[]>;
  approveRequestedPlan(userId: string, id: string): Promise<RequestedPlans>;
  upgradePlan(
    subscriptionPlanId: string,
    userId: string,
  ): Promise<SubscriptionRequest>;
  getActivePlan(userId: string): Promise<UserSubscription | null>;
  cancelRequestedPlan(id: string, userId: string): Promise<RequestedPlans>;
  getUserRequestedPlan(userId: string): Promise<RequestedPlans | null>;
}
