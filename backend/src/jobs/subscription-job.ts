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
  const scheduleTime =
    process.env.SUBSCRIPTION_EXPIRE_SCHEDULE_TIME ?? "0 0 * * *";

  cron.schedule(scheduleTime, async () => {
    try {
      console.log("Subscription expiration job is running...");
      const result = await subscriptionService.expirePlans();
      console.log(result.message);
    } catch (error) {
      console.error("Expire plans job failed:", error);
    }
  });
}
