import { response, Router } from "express";
import { asyncHandler } from "../../../shared/http/async-handler";
import { validate } from "../../../shared/http/validation";
import { authenticate } from "../../../shared/middleware/authenticate";
import type { TokenService } from "../domain/token-service";
import type { AuthController } from "./auth.controller";
import {
  loginSchema,
  refreshSchema,
  registerSchema,
  verifiedTokenSchema,
} from "./auth.schemas";

export const createAuthRouter = (
  controller: AuthController,
  tokenService: TokenService,
): Router => {
  const router = Router();

  router.post(
    "/register",
    validate(registerSchema),
    asyncHandler((request, response) => controller.register(request, response)),
  );
  router.post(
    "/login",
    validate(loginSchema),
    asyncHandler((request, response) => controller.login(request, response)),
  );
  router.post(
    "/refresh",
    validate(refreshSchema),
    asyncHandler((request, response) => controller.refresh(request, response)),
  );
  router.get(
    "/me",
    authenticate(tokenService),
    asyncHandler((request, response) => controller.me(request, response)),
  );
  router.get(
    "/verify-email",
    validate(verifiedTokenSchema, "query"),
    asyncHandler((request, response) =>
      controller.verifyEmail(request, response),
    ),
  );
  return router;
};
