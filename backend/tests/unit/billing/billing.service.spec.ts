import { describe, expect, it, jest } from "@jest/globals";
import { BillingService } from "../../../src/modules/billing/application/billing.service";
import type { BillingRepository } from "../../../src/modules/billing/domain/billing.repository";

describe("BillingService", () => {
  it("rejects review when balance is too low", async () => {
    const billingRepository: jest.Mocked<BillingRepository> = {
      getBillingOverview: jest.fn(),
      getWalletBalance: jest.fn().mockResolvedValue(0),
      deductCreditsForReview: jest.fn(),
      recordFailedUsage: jest.fn(),
    };

    const billingService = new BillingService(billingRepository);

    await expect(billingService.assertCanAffordReview("user-1")).rejects.toMatchObject({
      code: "INSUFFICIENT_CREDITS",
    });
  });
});
