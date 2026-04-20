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

  public async assertCanAffordReview(
    userId: string,
    requiredCredits: number,
  ): Promise<void> {
    const balance = await this.billingRepository.getWalletBalance(userId);

    if (balance < requiredCredits) {
      throw new AppError(
        "Not enough application credits to run an AI review.",
        StatusCodes.PAYMENT_REQUIRED,
        "INSUFFICIENT_CREDITS",
        {
          requiredCredits,
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
    amount: number;
    usage: {
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
    };
  }): Promise<number> {
    return this.billingRepository.deductCreditsForReview(input);
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
