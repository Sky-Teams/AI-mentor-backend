import { SubscriptionPlan } from "../domain/subscription";
import { SubscriptionRepository } from "../domain/subscription.repository";

export class SubscriptionService {
  public constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  public async listPlans(): Promise<SubscriptionPlan[]> {
    return this.subscriptionRepository.listPlans();
  }
}
