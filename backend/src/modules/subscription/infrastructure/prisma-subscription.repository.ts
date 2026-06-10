import { PrismaClient } from "@prisma/client";
import {
  RequestedPlans,
  SubscriptionPlan,
  SubscriptionRequest,
} from "../domain/subscription";
import { SubscriptionRepository } from "../domain/subscription.repository";
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
  ): Promise<SubscriptionRequest> {
    const pendingSubscription = await this.prisma.subscriptionRequest.findFirst(
      {
        where: { userId: userId, status: "PENDING" },
      },
    );

    if (pendingSubscription)
      throw new AppError(
        "Already have a pending request",
        StatusCodes.BAD_REQUEST,
        `ALREADY_HAVE_PENDING_REQUEST`,
      );

    return await this.prisma.subscriptionRequest.create({
      data: {
        userId: userId,
        subscriptionPlanId: subscriptionPlanId,
        status: "PENDING",
      },
    });
  }

  public async getRequestedPlans(): Promise<RequestedPlans[]> {
    return await this.prisma.subscriptionRequest.findMany({
      where: { status: "PENDING" },
      select: {
        id: true,
        status: true,
        subscriptionPlan: true,
        user: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  public async approveRequestedPlan(
    userId: string,
    id: string,
  ): Promise<RequestedPlans> {
    const result = await this.prisma.$transaction(async (transaction) => {
      const updateRequestedPlan = await transaction.subscriptionRequest.update({
        where: { id, userId },
        data: { status: "APPROVED" },
        include: { subscriptionPlan: true, user: true },
      });

      await transaction.creditWallet.update({
        where: { userId },
        data: {
          balance: {
            increment: updateRequestedPlan.subscriptionPlan.includedCredits,
          },
          lifetimeCreditsGranted: {
            increment: updateRequestedPlan.subscriptionPlan.includedCredits,
          },
        },
      });

      return updateRequestedPlan;
    });

    return result;
  }
}
