import { PrismaClient } from "@prisma/client";
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
  const intervalHours = Number(
    process.env.SUBSCRIPTION_EXPIRE_SCHEDULE_TIME ?? 1,
  );
  const intervalMs = intervalHours * 60 * 60 * 1000;
  setInterval(async () => {
    try {
      console.log("Subscription expiration job is running...");
      const result = await subscriptionService.expirePlans();
      console.log(result.message);
    } catch (error) {
      console.log("Subscription expiration job failed:", error);
    }
  }, intervalMs);
}
