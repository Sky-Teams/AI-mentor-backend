import { PrismaClient } from "@prisma/client";
import cron from "node-cron";
import { SubscriptionService } from "src/modules/subscription/application/subscription.service";
import { PrismaSubscriptionRepository } from "src/modules/subscription/infrastructure/prisma-subscription.repository";
import { PrismaUserRepository } from "src/modules/users/infrastructure/prisma-user.repository";
const prisma = new PrismaClient();

const userRepository = new PrismaUserRepository(prisma);
const subscriptionRepository = new PrismaSubscriptionRepository(prisma);

const subscriptionService = new SubscriptionService(
  subscriptionRepository,
  userRepository,
);

export function startExpirePlansJob() {
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("Subscription job is running...");
      const result = await subscriptionService.expirePlans();
      console.log(result.message);
    } catch (error) {
      console.error("Expire plans job failed:", error);
    }
  });
}
