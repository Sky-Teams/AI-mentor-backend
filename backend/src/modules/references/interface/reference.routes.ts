import { Router } from "express";
import { ReferenceController } from "./reference.controller";
import { asyncHandler } from "src/shared/http/async-handler";
import { TokenService } from "src/modules/auth/domain/token-service";
import { authenticate } from "src/shared/middleware/authenticate";
import { validate } from "src/shared/http/validation";
import { queryReferenceSchema, referenceSchema } from "./reference.schema";

export const createReferenceRouter = (
  controller: ReferenceController,
  tokenService: TokenService,
): Router => {
  const router = Router();
  router.use(authenticate(tokenService));

  router.get(
    "/search",
    validate(queryReferenceSchema, "query"),
    asyncHandler((request, response) =>
      controller.getReferences(request, response),
    ),
  );

  router.post(
    "/format-style",
    validate(referenceSchema, "body"),
    asyncHandler((request, response) =>
      controller.formatReference(request, response),
    ),
  );

  return router;
};
