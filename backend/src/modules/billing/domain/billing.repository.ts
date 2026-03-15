import type { BillingOverview } from "./billing";

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
  recordFailedUsage(input: {
    userId: string;
    reviewRunId: string;
    projectId: string;
    model: string;
  }): Promise<void>;
}
