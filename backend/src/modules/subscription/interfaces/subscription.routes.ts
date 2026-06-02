import { Router } from "express";
import { asyncHandler } from "../../../shared/http/async-handler";
import { authenticate } from "../../../shared/middleware/authenticate";
import type { TokenService } from "../../auth/domain/token-service";
import { SubscriptionController } from "./subscription.controller";

export const createSubscriptionRouter = (
  controller: SubscriptionController,
  tokenService: TokenService,
): Router => {
  const router = Router();
  router.use(authenticate(tokenService));

  // User Routes
  router.get(
    "/plans",
    asyncHandler((request, response) =>
      controller.listPlans(request, response),
    ),
  );

  router.patch(
    "/plans/buy/:subscriptionPlanId",
    asyncHandler((request, response) => controller.buyPlan(request, response)),
  );

  // Admin Routes
  return router;
};
