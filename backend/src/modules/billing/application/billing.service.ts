import { StatusCodes } from "http-status-codes";
import { env } from "../../../shared/config/env";
import { AppError } from "../../../shared/errors/app-error";
import type { BillingOverview } from "../domain/billing";
import type { BillingRepository } from "../domain/billing.repository";

export class BillingService {
  public constructor(private readonly billingRepository: BillingRepository) {}

  public async getOverview(userId: string): Promise<BillingOverview> {
    return this.billingRepository.getBillingOverview(userId);
  }

  public async assertCanAffordReview(userId: string): Promise<void> {
    const balance = await this.billingRepository.getWalletBalance(userId);
    if (balance < env.APP_REVIEW_CREDIT_COST) {
      throw new AppError(
        "Not enough application credits to run an AI review.",
        StatusCodes.PAYMENT_REQUIRED,
        "INSUFFICIENT_CREDITS",
        {
          requiredCredits: env.APP_REVIEW_CREDIT_COST,
          balance,
        },
      );
    }
  }

  public async recordSuccessfulReviewUsage(input: {
    userId: string;
    reviewRunId: string;
    projectId: string;
    model: string;
    usage: {
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
    };
  }): Promise<number> {
    return this.billingRepository.deductCreditsForReview({
      ...input,
      amount: env.APP_REVIEW_CREDIT_COST,
    });
  }

  public async recordFailedReviewUsage(input: {
    userId: string;
    reviewRunId: string;
    projectId: string;
    model: string;
  }): Promise<void> {
    await this.billingRepository.recordFailedUsage(input);
  }
}
