import { Router } from "express";
import { asyncHandler } from "../../../shared/http/async-handler";
import { authenticate } from "../../../shared/middleware/authenticate";
import type { TokenService } from "../../auth/domain/token-service";
import { SubscriptionController } from "./subscription.controller";
import { validate } from "src/shared/http/validation";
import {
  subscriptionPlanIdSchema,
  subscriptionRequestIdSchema,
} from "./subscription.schema";

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
    validate(subscriptionPlanIdSchema, "params"),
    asyncHandler((request, response) => controller.buyPlan(request, response)),
  );

  router.get(
    "/plans/active",
    asyncHandler((req, res) => controller.getActivePlan(req, res)),
  );

  router.patch(
    "/plans/upgrade/:subscriptionPlanId",
    validate(subscriptionPlanIdSchema, "params"),
    asyncHandler((request, response) =>
      controller.upgradePlan(request, response),
    ),
  );

  router.patch(
    "/plans/requested-plan/:id/cancel",
    validate(subscriptionRequestIdSchema, "params"),
    asyncHandler((request, response) =>
      controller.cancelRequestedPlan(request, response),
    ),
  );

  router.get(
    "/plans/requested-plan",
    asyncHandler((request, response) =>
      controller.getUserRequestedPlan(request, response),
    ),
  );

  return router;
};
