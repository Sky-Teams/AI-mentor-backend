import { PrismaClient } from "@prisma/client";
import cron from "node-cron";
import { SubscriptionService } from "src/modules/subscription/application/subscription.service";
import { PrismaSubscriptionRepository } from "src/modules/subscription/infrastructure/prisma-subscription.repository";
import { PrismaUserRepository } from "src/modules/users/infrastructure/prisma-user.repository";
import { env } from "src/shared/config/env";
const prisma = new PrismaClient();

const userRepository = new PrismaUserRepository(prisma);
const subscriptionRepository = new PrismaSubscriptionRepository(prisma);

const subscriptionService = new SubscriptionService(
  subscriptionRepository,
  userRepository,
);

export function startSubscriptionJobs() {
  const scheduleTime = env.SUBSCRIPTION_EXPIRE_SCHEDULE_TIME;

  cron.schedule(scheduleTime, async () => {
    console.log(
      "Subscription expiration and Free plan reactivating job is running...",
    );

    try {
      const expirePlansResult = await subscriptionService.expirePlans();
      console.log(expirePlansResult.message);
    } catch (error) {
      console.error("Expire plans job failed:", error);
    }

    try {
      const renewedFreePlansCount = await subscriptionService.renewFreePlans();
      console.log(`Reactivated ${renewedFreePlansCount} Free plans.`);
    } catch (error) {
      console.error("Free plan reactivation job failed:", error);
    }
  });
}
