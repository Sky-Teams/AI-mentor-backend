import { Router } from "express";
import { asyncHandler } from "../../../shared/http/async-handler";
import { authenticate } from "../../../shared/middleware/authenticate";
import type { TokenService } from "../../auth/domain/token-service";
import type { BillingController } from "./billing.controller";

export const createBillingRouter = (
  controller: BillingController,
  tokenService: TokenService,
): Router => {
  const router = Router();
  router.use(authenticate(tokenService));
  router.get("/overview", asyncHandler((request, response) => controller.getOverview(request, response)));
  return router;
};
