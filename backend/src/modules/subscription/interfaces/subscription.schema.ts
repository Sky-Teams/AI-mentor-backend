import { z } from "zod";

export const subscriptionPlanIdSchema = z.object({
  subscriptionPlanId: z.string().min(1),
});

export const requestedPlanIdSchema = z.object({
  id: z.string().min(1),
});

export const userIdSchema = z.object({
  userId: z.string().min(1),
});
