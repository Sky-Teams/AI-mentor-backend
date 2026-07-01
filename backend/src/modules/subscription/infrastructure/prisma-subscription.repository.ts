import { PrismaClient } from "@prisma/client";
import {
  RequestedPlans,
  SubscriptionPlan,
  SubscriptionPlanStatus,
  SubscriptionRequest,
  SubscriptionRequestStatus,
  SubscriptionRequestType,
} from "../domain/subscription";
import { SubscriptionRepository } from "../domain/subscription.repository";
import { AppError } from "src/shared/errors/app-error";
import { StatusCodes } from "http-status-codes";
import {
  PlanBillingModel,
  UserSubscription,
} from "src/modules/billing/domain/billing";

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

const mapRequestedPlan = (item: {
  id: string;
  status: SubscriptionRequestStatus;
  type: SubscriptionRequestType;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  subscriptionPlan: {
    id: string;
    name: string;
    code: string;
    description: string | null;
    billingModel: PlanBillingModel;
    monthlyPriceCents: number | null;
    includedCredits: number;
    status: SubscriptionPlanStatus;
  };
}): RequestedPlans => ({
  id: item.id,
  status: item.status,
  type: item.type,
  user: {
    id: item.user.id,
    fullName: item.user.fullName,
    email: item.user.email,
  },
  subscriptionPlan: {
    id: item.subscriptionPlan.id,
    name: item.subscriptionPlan.name,
    code: item.subscriptionPlan.code,
    description: item.subscriptionPlan.description,
    billingModel: item.subscriptionPlan.billingModel,
    monthlyPriceCents: item.subscriptionPlan.monthlyPriceCents,
    includedCredits: item.subscriptionPlan.includedCredits,
    status: item.subscriptionPlan.status,
  },
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
    const activeSubscription = await this.prisma.userSubscription.findFirst({
      where: { userId, status: "ACTIVE" },
    });

    /** Check user active plan */
    if (activeSubscription)
      throw new AppError(
        "You already have an active subscription.Please upgrade instead",
        StatusCodes.BAD_REQUEST,
        `ALREADY_HAVE_ACTIVE_PLAN`,
      );

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
        type: "PURCHASE",
      },
    });
  }

  public async getRequestedPlans(): Promise<RequestedPlans[]> {
    const result = await this.prisma.subscriptionRequest.findMany({
      where: { status: "PENDING" },
      include: {
        subscriptionPlan: true,
        user: true,
      },
    });

    return result.map(mapRequestedPlan);
  }

  public async approveRequestedPlan(
    userId: string,
    id: string,
  ): Promise<RequestedPlans> {
    const existing = await this.prisma.subscriptionRequest.findFirst({
      where: { id, userId, status: "PENDING" },
    });

    if (!existing)
      throw new AppError(
        "Subscription request not found",
        StatusCodes.NOT_FOUND,
        "SUBSCRIPTION_REQUEST_NOT_FOUND",
      );

    const result = await this.prisma.$transaction(async (transaction) => {
      const updateRequestedPlan = await transaction.subscriptionRequest.update({
        where: { id },
        data: { status: "APPROVED" },
        include: { subscriptionPlan: true, user: true },
      });

      const activeSubscription = await transaction.userSubscription.findFirst({
        where: { userId, status: "ACTIVE" },
      });

      /** Deactivate the user's active subscription */
      if (existing.type === "UPGRADE") {
        if (!activeSubscription)
          throw new AppError(
            "Active subscription not found.",
            StatusCodes.NOT_FOUND,
            "ACTIVE_SUBSCRIPTION_NOT_FOUND",
          );

        await transaction.userSubscription.update({
          where: { id: activeSubscription.id },
          data: {
            status: "INACTIVE",
          },
        });
      }

      const billingModel = updateRequestedPlan.subscriptionPlan.billingModel;

      const startDate = new Date();
      let endDate = new Date(startDate);

      if (billingModel === "CREDIT_PACK") {
        endDate.setFullYear(endDate.getFullYear() + 50);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      /** Create a new user subscription */
      await transaction.userSubscription.create({
        data: {
          userId: userId,
          subscriptionPlanId: updateRequestedPlan.subscriptionPlanId,
          status: "ACTIVE",
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
          autoRenew: false,
        },
      });

      const creditsToGrant =
        updateRequestedPlan.subscriptionPlan.includedCredits;

      const wallet = await transaction.creditWallet.update({
        where: { userId },
        data: {
          balance: {
            increment: creditsToGrant,
          },
          lifetimeCreditsGranted: {
            increment: creditsToGrant,
          },
        },
      });

      await transaction.creditTransaction.create({
        data: {
          walletId: wallet.id,
          userId: userId,
          type: "PURCHASE",
          source: "SUBSCRIPTION",
          amount: creditsToGrant,
          balanceAfter: wallet.balance,
          description: "Subscription approved and credits added",
        },
      });

      return updateRequestedPlan;
    });

    return mapRequestedPlan(result);
  }

  public async upgradePlan(
    subscriptionPlanId: string,
    userId: string,
  ): Promise<SubscriptionRequest> {
    const activeSubscription = await this.prisma.userSubscription.findFirst({
      where: { userId, status: "ACTIVE" },
    });

    if (!activeSubscription)
      throw new AppError(
        "You don't have an active subscription to upgrade.",
        StatusCodes.NOT_FOUND,
        `ACTIVE_SUBSCRIPTION_NOT_FOUND`,
      );

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
        type: "UPGRADE",
      },
    });
  }

  public async getActivePlan(userId: string): Promise<UserSubscription | null> {
    const activePlan = await this.prisma.userSubscription.findFirst({
      where: { userId },
      include: {
        subscriptionPlan: true,
      },
    });

    return activePlan || null;
  }

  public async cancelRequestedPlan(
    id: string,
    userId: string,
  ): Promise<RequestedPlans> {
    const existing = await this.prisma.subscriptionRequest.findFirst({
      where: { id, userId, status: "PENDING" },
    });

    if (!existing)
      throw new AppError(
        "Subscription request not found",
        StatusCodes.NOT_FOUND,
        "SUBSCRIPTION_REQUEST_NOT_FOUND",
      );

    const result = await this.prisma.subscriptionRequest.update({
      where: { id: existing.id },
      data: {
        status: "CANCELLED",
      },
      include: { subscriptionPlan: true, user: true },
    });

    return mapRequestedPlan(result);
  }

  public async getUserRequestedPlan(
    userId: string,
  ): Promise<RequestedPlans | null> {
    const result = await this.prisma.subscriptionRequest.findFirst({
      where: { userId, status: "PENDING" },
      include: { subscriptionPlan: true, user: true },
    });

    if (!result) return null;
    return mapRequestedPlan(result);
  }
}
