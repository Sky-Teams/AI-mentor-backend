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
  const scheduleTime =
    process.env.SUBSCRIPTION_EXPIRE_SCHEDULE_TIME ?? "0 0 * * *";
  const freePlanRenewalTime = env.FREE_PLAN_RENEW_SCHEDULE_TIME;

  cron.schedule(scheduleTime, async () => {
    try {
      console.log("Subscription expiration job is running...");
      const result = await subscriptionService.expirePlans();
      console.log(result.message);
    } catch (error) {
      console.error("Expire plans job failed:", error);
    }
  });

  cron.schedule(freePlanRenewalTime, async () => {
    try {
      console.log("Free plan reactivating job is running...");
      const result = await subscriptionService.renewFreePlans();
      console.log(result);
    } catch (err) {
      console.log("Reactivating Free plans job failed: ", err);
    }
  });
}
