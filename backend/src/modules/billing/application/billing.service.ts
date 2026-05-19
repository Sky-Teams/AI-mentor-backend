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

  public async assertCanAfford(
    userId: string,
    requiredCredits: number,
    operation: AiOperation,
  ): Promise<void> {
    const balance = await this.billingRepository.getWalletBalance(userId);
    const { label } = OPERATION_CONFIG[operation];
    if (balance < requiredCredits) {
      throw new AppError(
        `Not enough application credits to run an AI ${label} .`,
        StatusCodes.PAYMENT_REQUIRED,
        "INSUFFICIENT_CREDITS",
        {
          requiredCredits,
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
    return this.billingRepository.deductCredits(input);
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
