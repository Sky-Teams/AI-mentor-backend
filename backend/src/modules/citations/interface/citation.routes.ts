import { Router } from "express";
import { CitationController } from "./citation.controller";
import { asyncHandler } from "src/shared/http/async-handler";
import { TokenService } from "src/modules/auth/domain/token-service";
import { authenticate } from "src/shared/middleware/authenticate";
import { validate } from "src/shared/http/validation";
import { CreateCitationSchema } from "./citation.schema";

export const createCitationRouter = (
  controller: CitationController,
  tokenService: TokenService,
): Router => {
  const router = Router();
  router.use(authenticate(tokenService));

  router.post(
    "/:projectId",
    validate(CreateCitationSchema,"body"),
    asyncHandler((request, response) =>
      controller.CreateCitation(request, response),
    ),
  );
  return router;
};
