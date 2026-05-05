import { env } from "src/shared/config/env";

export const planBillingModels = [
  "FREE",
  "MONTHLY",
  "CREDIT_PACK",
  "HYBRID",
] as const;
export type PlanBillingModel = (typeof planBillingModels)[number];
export type AiOperation = "REVIEW" | "PARAPHRASE";
export const OPERATION_CONFIG = {
  REVIEW: {
    cost: env.APP_REVIEW_CREDIT_COST,
    label: "review",
    source: "AI_REVIEW",
  },
  PARAPHRASE: {
    cost: env.APP_PARAPHRASE_CREDIT_COST,
    label: "paraphrase",
    source: "AI_PARAPHRASE",
  },
};

export const subscriptionStatuses = [
  "ACTIVE",
  "PAST_DUE",
  "CANCELLED",
  "EXPIRED",
  "TRIALING",
] as const;
export type UserSubscriptionStatus = (typeof subscriptionStatuses)[number];

export const creditTransactionTypes = [
  "ALLOCATION",
  "DEDUCTION",
  "ADJUSTMENT",
  "EXPIRY",
  "REFUND",
  "PURCHASE",
] as const;
export type CreditTransactionType = (typeof creditTransactionTypes)[number];

export interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  description: string | null;
  billingModel: PlanBillingModel;
  monthlyPriceCents: number | null;
  includedCredits: number;
  status: "ACTIVE" | "ARCHIVED";
}

export interface UserSubscription {
  id: string;
  userId: string;
  subscriptionPlanId: string;
  status: UserSubscriptionStatus;
  startedAt: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  autoRenew: boolean;
  subscriptionPlan?: SubscriptionPlan;
}

export interface CreditWallet {
  id: string;
  userId: string;
  balance: number;
  lifetimeCreditsGranted: number;
  lifetimeCreditsConsumed: number;
}

export interface CreditTransaction {
  id: string;
  walletId: string;
  userId: string;
  type: CreditTransactionType;
  source: "SUBSCRIPTION" | "AI_REVIEW" | "AI_PARAPHRASE" | "ADMIN_ADJUSTMENT" | "PURCHASE" | "MANUAL";
  amount: number;
  balanceAfter: number;
  description: string | null;
  createdAt: Date;
}

export interface BillingOverview {
  wallet: CreditWallet;
  activeSubscription: UserSubscription | null;
  plans: SubscriptionPlan[];
  recentTransactions: CreditTransaction[];
  recentUsage: Array<{
    id: string;
    model: string;
    technicalTotalTokens: number;
    billedCredits: number;
    status: "SUCCESS" | "FAILED" | "SKIPPED";
    createdAt: Date;
  }>;
}
