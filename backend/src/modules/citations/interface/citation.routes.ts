import { Router } from "express";
import { CitationController } from "./citation.controller";
import { asyncHandler } from "src/shared/http/async-handler";
import { TokenService } from "src/modules/auth/domain/token-service";
import { authenticate } from "src/shared/middleware/authenticate";
import { validate } from "src/shared/http/validation";
import { CitationIdSchema, CitationSchema } from "./citation.schema";
import { projectIdParamsSchema } from "src/modules/projects/interfaces/project.schemas";

export const createCitationRouter = (
  controller: CitationController,
  tokenService: TokenService,
): Router => {
  const router = Router();
  router.use(authenticate(tokenService));

  router.post(
    "/:projectId",
    validate(projectIdParamsSchema, "params"),
    validate(CitationSchema, "body"),
    asyncHandler((request, response) =>
      controller.CreateCitation(request, response),
    ),
  );

  router.put(
    "/:projectId",
    validate(projectIdParamsSchema, "params"),
    validate(CitationIdSchema, "body"),
    validate(CitationSchema, "body"),
    asyncHandler((request, response) =>
      controller.UpdateCitation(request, response),
    ),
  );
  return router;
};
