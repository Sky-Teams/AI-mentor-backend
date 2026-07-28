import { Router } from "express";
import { TokenService } from "src/modules/auth/domain/token-service";
import { validate } from "src/shared/http/validation";
import { authenticate } from "src/shared/middleware/authenticate";
import { citationSchema } from "./citation.schema";
import { CitationController } from "./citation.controller";
import { asyncHandler } from "src/shared/http/async-handler";

export const createCitationRouter = (
  controller: CitationController,
  tokenService: TokenService,
): Router => {
  const router = Router();
  router.use(authenticate(tokenService));

  router.post(
    "/format-style",
    validate(citationSchema, "body"),
    asyncHandler((request, response) =>
      controller.formatCitation(request, response),
    ),
  );

  return router;
};
