import { Router } from "express";
import { ReferenceController } from "./reference.controller";
import { asyncHandler } from "src/shared/http/async-handler";
import { TokenService } from "src/modules/auth/domain/token-service";
import { authenticate } from "src/shared/middleware/authenticate";
import { validate } from "src/shared/http/validation";
import { queryRefereceSchema } from "./reference.schema";

export const createReferenceRouter = (
  controller: ReferenceController,
  tokenService: TokenService,
): Router => {
  const router = Router();
  router.use(authenticate(tokenService));

  router.get(
    "/search",
    validate(queryRefereceSchema, "query"),
    asyncHandler((request, response) =>
      controller.getReferences(request, response),
    ),
  );

  return router;
};
