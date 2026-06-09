import { UserSubscription } from "src/modules/billing/domain/billing";
import { SubscriptionPlan, SubscriptionRequest } from "../domain/subscription";
import { SubscriptionRepository } from "../domain/subscription.repository";
import { UserRepository } from "src/modules/users/domain/user";
import { AppError } from "src/shared/errors/app-error";
import { StatusCodes } from "http-status-codes";

export class SubscriptionService {
  public constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly userRepository: UserRepository,
  ) {}

  public async listPlans(): Promise<SubscriptionPlan[]> {
    return this.subscriptionRepository.listPlans();
  }

  public async buyPlan(
    subscriptionPlanId: string,
    userId: string,
  ): Promise<SubscriptionRequest> {
    await this.userRepository.getUserById(userId);

    const plan =
      await this.subscriptionRepository.findPlanById(subscriptionPlanId);
    if (!plan)
      throw new AppError(
        "Plan was not found",
        StatusCodes.NOT_FOUND,
        `PLAN_NOT_FOUND`,
      );

    return await this.subscriptionRepository.buyPlan(
      subscriptionPlanId,
      userId,
    );
  }

  public async getRequestedPlans(): Promise<SubscriptionRequest[]> {
    return this.subscriptionRepository.getRequestedPlans();
  }
}
