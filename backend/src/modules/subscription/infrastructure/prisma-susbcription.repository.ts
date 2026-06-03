import { PrismaClient } from "@prisma/client";
import { SubscriptionPlan } from "../domain/subscription";
import { SubscriptionRepository } from "../domain/subscription.repository";
import { UserSubscription } from "src/modules/billing/domain/billing";
import { AppError } from "src/shared/errors/app-error";
import { StatusCodes } from "http-status-codes";

const mapPlan = (plan: {
  id: string;
  name: string;
  code: string;
  description: string | null;
  billingModel: SubscriptionPlan["billingModel"];
  monthlyPriceCents: number | null;
  includedCredits: number;
}): SubscriptionPlan => ({
  id: plan.id,
  name: plan.name,
  code: plan.code,
  description: plan.description,
  billingModel: plan.billingModel,
  monthlyPriceCents: plan.monthlyPriceCents,
  includedCredits: plan.includedCredits,
});

export class PrismaSubscriptionRepository implements SubscriptionRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async listPlans(): Promise<SubscriptionPlan[]> {
    const plans = await this.prisma.subscriptionPlan.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ monthlyPriceCents: "asc" }, { includedCredits: "asc" }],
    });

    return plans.map(mapPlan);
  }

  public async findPlanById(
    subscriptionPlanId: string,
  ): Promise<SubscriptionPlan | null> {
    const plan = await this.prisma.subscriptionPlan.findFirst({
      where: { id: subscriptionPlanId, status: "ACTIVE" },
    });

    if (!plan) return null;

    return plan;
  }

  public async buyPlan(
    subscriptionPlanId: string,
    userId: string,
  ): Promise<UserSubscription> {
    const activeSubscription = await this.prisma.userSubscription.findFirst({
      where: { userId: userId, status: "ACTIVE" },
    });

    if (activeSubscription)
      throw new AppError(
        "Already has an active subscription",
        StatusCodes.BAD_REQUEST,
        `ALREADY_HAS_ACTIVE_SUBSCRIPTION`,
      );

    const pendingSubscription = await this.prisma.userSubscription.findFirst({
      where: { userId: userId, status: "PENDING" },
    });

    const result = pendingSubscription
      ? await this.prisma.userSubscription.update({
          where: { id: pendingSubscription.id },
          data: {
            subscriptionPlanId: subscriptionPlanId,
            status: "PENDING",
          },
        })
      : await this.prisma.userSubscription.create({
          data: {
            userId: userId,
            subscriptionPlanId: subscriptionPlanId,
            status: "PENDING",
          },
        });

    return result;
  }
}
