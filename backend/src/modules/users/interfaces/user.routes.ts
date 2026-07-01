import { Router } from "express";
import { UserController } from "./user.controller";
import { TokenService } from "src/modules/auth/domain/token-service";
import { authenticate } from "src/shared/middleware/authenticate";
import { changePasswordSchema, updateProfileSchema } from "./user.schema";
import { validate } from "src/shared/http/validation";
import { asyncHandler } from "src/shared/http/async-handler";

export const createUserRoute = (
  controller: UserController,
  tokenService: TokenService,
): Router => {
  const router = Router();
  router.use(authenticate(tokenService));

  router.post(
    "/change-password",
    validate(changePasswordSchema, "body"),
    asyncHandler((request, response) =>
      controller.changePassword(request, response),
    ),
  );

  router.patch(
    "/update-profile",
    validate(updateProfileSchema, "body"),
    asyncHandler((request, response) =>
      controller.updateProfile(request, response),
    ),
  );
  return router;
};
