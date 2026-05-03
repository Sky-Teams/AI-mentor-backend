import type { AiOperation, BillingOverview } from "./billing";

export interface BillingRepository {
  getBillingOverview(userId: string): Promise<BillingOverview>;
  getWalletBalance(userId: string): Promise<number>;
  deductCreditsForReview(input: {
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
  }): Promise<number>;
  deductAiCredits(input: {
    userId: string;
    reviewRunId?: string;
    paraphraseRunId?: string;
    operation: AiOperation;
    amount: number;
    model: string;
    projectId: string;
    usage: {
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
    };
  }): Promise<number>;
  recordFailedUsage(input: {
    userId: string;
    reviewRunId?: string;
    projectId: string;
    paraphraseRunId?: string;
    operation: AiOperation;
    model: string;
  }): Promise<void>;
}
