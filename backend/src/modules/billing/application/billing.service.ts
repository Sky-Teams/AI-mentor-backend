import { StatusCodes } from "http-status-codes";
import { AppError } from "../../../shared/errors/app-error";
import {
  OPERATION_CONFIG,
  type AiOperation,
  type BillingOverview,
} from "../domain/billing";
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

  public async assertCanAfford(
    userId: string,
    operation: AiOperation,
  ): Promise<void> {
    const { cost, label, source } = OPERATION_CONFIG[operation];
    const balance = await this.billingRepository.getWalletBalance(userId);
    if (balance < cost) {
      throw new AppError(
        `Not enough application credits to run an AI ${label}.`,
        StatusCodes.PAYMENT_REQUIRED,
        "INSUFFICIENT_CREDITS",
        {
          requiredCredits: cost,
          balance,
        },
      );
    }
  }

  public async recordSuccess(input: {
    userId: string;
    reviewRunId?: string;
    paraphraseRunId?: string;
    operation: AiOperation;
    projectId: string;
    model: string;
    amount: number;
    usage: {
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
    };
  }): Promise<number> {
    const { cost } = OPERATION_CONFIG[input.operation];
    return this.billingRepository.deductAiCredits({
      ...input,
      amount: cost,
    });
  }

  public async recordFailed(input: {
    userId: string;
    reviewRunId?: string;
    paraphraseRunId?: string;
    operation: AiOperation;
    projectId: string;
    model: string;
  }): Promise<void> {
    await this.billingRepository.recordFailedUsage(input);
  }
}
