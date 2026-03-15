import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../../../shared/errors/app-error";
import type {
  BillingOverview,
  CreditTransaction,
  CreditWallet,
  SubscriptionPlan,
  UserSubscription,
} from "../domain/billing";
import type { BillingRepository } from "../domain/billing.repository";

const mapWallet = (wallet: {
  id: string;
  userId: string;
  balance: number;
  lifetimeCreditsGranted: number;
  lifetimeCreditsConsumed: number;
}): CreditWallet => ({
  id: wallet.id,
  userId: wallet.userId,
  balance: wallet.balance,
  lifetimeCreditsGranted: wallet.lifetimeCreditsGranted,
  lifetimeCreditsConsumed: wallet.lifetimeCreditsConsumed,
});

const mapPlan = (plan: {
  id: string;
  name: string;
  code: string;
  description: string | null;
  billingModel: SubscriptionPlan["billingModel"];
  monthlyPriceCents: number | null;
  includedCredits: number;
  status: SubscriptionPlan["status"];
}): SubscriptionPlan => ({
  id: plan.id,
  name: plan.name,
  code: plan.code,
  description: plan.description,
  billingModel: plan.billingModel,
  monthlyPriceCents: plan.monthlyPriceCents,
  includedCredits: plan.includedCredits,
  status: plan.status,
});

const mapSubscription = (subscription: {
  id: string;
  userId: string;
  subscriptionPlanId: string;
  status: UserSubscription["status"];
  startedAt: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  autoRenew: boolean;
  subscriptionPlan?: {
    id: string;
    name: string;
    code: string;
    description: string | null;
    billingModel: SubscriptionPlan["billingModel"];
    monthlyPriceCents: number | null;
    includedCredits: number;
    status: SubscriptionPlan["status"];
  };
}): UserSubscription => ({
  id: subscription.id,
  userId: subscription.userId,
  subscriptionPlanId: subscription.subscriptionPlanId,
  status: subscription.status,
  startedAt: subscription.startedAt,
  currentPeriodStart: subscription.currentPeriodStart,
  currentPeriodEnd: subscription.currentPeriodEnd,
  autoRenew: subscription.autoRenew,
  subscriptionPlan: subscription.subscriptionPlan ? mapPlan(subscription.subscriptionPlan) : undefined,
});

const mapTransaction = (transaction: {
  id: string;
  walletId: string;
  userId: string;
  type: CreditTransaction["type"];
  source: CreditTransaction["source"];
  amount: number;
  balanceAfter: number;
  description: string | null;
  createdAt: Date;
}): CreditTransaction => ({
  id: transaction.id,
  walletId: transaction.walletId,
  userId: transaction.userId,
  type: transaction.type,
  source: transaction.source,
  amount: transaction.amount,
  balanceAfter: transaction.balanceAfter,
  description: transaction.description,
  createdAt: transaction.createdAt,
});

export class PrismaBillingRepository implements BillingRepository {
  public constructor(private readonly prisma: PrismaClient) {}

  public async getBillingOverview(userId: string): Promise<BillingOverview> {
    const [wallet, activeSubscription, plans, recentTransactions, recentUsage] = await Promise.all([
      this.prisma.creditWallet.findUniqueOrThrow({
        where: { userId },
      }),
      this.prisma.userSubscription.findFirst({
        where: {
          userId,
          status: {
            in: ["ACTIVE", "TRIALING"],
          },
        },
        include: {
          subscriptionPlan: true,
        },
        orderBy: {
          currentPeriodEnd: "desc",
        },
      }),
      this.prisma.subscriptionPlan.findMany({
        where: {
          status: "ACTIVE",
        },
        orderBy: {
          monthlyPriceCents: "asc",
        },
      }),
      this.prisma.creditTransaction.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      }),
      this.prisma.aiUsageLog.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      }),
    ]);

    return {
      wallet: mapWallet(wallet),
      activeSubscription: activeSubscription ? mapSubscription(activeSubscription) : null,
      plans: plans.map(mapPlan),
      recentTransactions: recentTransactions.map(mapTransaction),
      recentUsage: recentUsage.map((usage) => ({
        id: usage.id,
        model: usage.model,
        technicalTotalTokens: usage.technicalTotalTokens,
        billedCredits: usage.billedCredits,
        status: usage.status,
        createdAt: usage.createdAt,
      })),
    };
  }

  public async getWalletBalance(userId: string): Promise<number> {
    const wallet = await this.prisma.creditWallet.findUnique({
      where: { userId },
    });

    return wallet?.balance ?? 0;
  }

  public async deductCreditsForReview(input: {
    userId: string;
    reviewRunId: string;
    amount: number;
    model: string;
    projectId: string;
    usage: {
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
    };
  }): Promise<number> {
    await this.prisma.$transaction(async (transaction) => {
      const wallet = await transaction.creditWallet.findUnique({
        where: {
          userId: input.userId,
        },
      });

      if (!wallet) {
        throw new AppError("Credit wallet not found.", StatusCodes.NOT_FOUND, "WALLET_NOT_FOUND");
      }

      if (wallet.balance < input.amount) {
        throw new AppError(
          "Not enough credits to complete review.",
          StatusCodes.PAYMENT_REQUIRED,
          "INSUFFICIENT_CREDITS",
        );
      }

      const nextBalance = wallet.balance - input.amount;
      await transaction.creditWallet.update({
        where: {
          id: wallet.id,
        },
        data: {
          balance: nextBalance,
          lifetimeCreditsConsumed: wallet.lifetimeCreditsConsumed + input.amount,
        },
      });

      await transaction.creditTransaction.create({
        data: {
          walletId: wallet.id,
          userId: input.userId,
          type: "DEDUCTION",
          source: "AI_REVIEW",
          amount: -input.amount,
          balanceAfter: nextBalance,
          relatedReviewRunId: input.reviewRunId,
          description: `AI section review using ${input.model}`,
        },
      });

      await transaction.aiUsageLog.upsert({
        where: {
          reviewRunId: input.reviewRunId,
        },
        create: {
          userId: input.userId,
          projectId: input.projectId,
          reviewRunId: input.reviewRunId,
          model: input.model,
          operation: "section_review",
          status: "SUCCESS",
          technicalInputTokens: input.usage.inputTokens,
          technicalOutputTokens: input.usage.outputTokens,
          technicalTotalTokens: input.usage.totalTokens,
          billedCredits: input.amount,
        },
        update: {
          status: "SUCCESS",
          technicalInputTokens: input.usage.inputTokens,
          technicalOutputTokens: input.usage.outputTokens,
          technicalTotalTokens: input.usage.totalTokens,
          billedCredits: input.amount,
        },
      });
    });

    return input.amount;
  }

  public async recordFailedUsage(input: {
    userId: string;
    reviewRunId: string;
    projectId: string;
    model: string;
  }): Promise<void> {
    await this.prisma.aiUsageLog.upsert({
      where: {
        reviewRunId: input.reviewRunId,
      },
      create: {
        userId: input.userId,
        projectId: input.projectId,
        reviewRunId: input.reviewRunId,
        model: input.model,
        operation: "section_review",
        status: "FAILED",
        technicalInputTokens: 0,
        technicalOutputTokens: 0,
        technicalTotalTokens: 0,
        billedCredits: 0,
      },
      update: {
        status: "FAILED",
      },
    });
  }
}
