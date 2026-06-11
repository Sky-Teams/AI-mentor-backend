import { z } from "zod";

export const subscriptionPlanIdSchema = z.object({
  subscriptionPlanId: z.string().min(1),
});
