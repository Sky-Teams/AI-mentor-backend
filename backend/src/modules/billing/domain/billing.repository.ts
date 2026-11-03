import type { AiOperation, BillingOverview } from "./billing";
import type { AiProvider } from "@prisma/client";

export interface BillingRepository {
  getBillingOverview(userId: string): Promise<BillingOverview>;
  getWalletBalance(userId: string): Promise<number>;
  deductCredits(input: {
    userId: string;
    reviewRunId?: string;
    paraphraseRunId?: string;
    operation: AiOperation;
    amount: number;
    model: string;
    provider: AiProvider;
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
    provider: AiProvider;
  }): Promise<void>;
}
