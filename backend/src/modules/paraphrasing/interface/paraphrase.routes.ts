import { Router } from "express";
import { asyncHandler } from "../../../shared/http/async-handler";
import { validate } from "../../../shared/http/validation";
import { authenticate } from "../../../shared/middleware/authenticate";
import type { TokenService } from "../../auth/domain/token-service";
import type { ParaphraseController } from "./paraphrase.controller";
import { projectIdParamsSchema } from "src/modules/projects/interfaces/project.schemas";
import {
  paraphraseRunIdSchema,
  paraphraseSchema,
  queryParaphraseSchema,
} from "./paraphrase.schema";

export const createParaphraseRouter = (
  controller: ParaphraseController,
  tokenService: TokenService,
): Router => {
  const router = Router();
  router.use(authenticate(tokenService));

  router.post(
    "/:projectId",
    validate(projectIdParamsSchema, "params"),
    validate(paraphraseSchema, "body"),
    asyncHandler((request, response) =>
      controller.createParaphrase(request, response),
    ),
  );

  router.get(
    "/",
    validate(queryParaphraseSchema, "query"),
    asyncHandler((request, response) =>
      controller.getSectionParaphrase(request, response),
    ),
  );

  router.get(
    "/:paraphraseRunId",
    validate(paraphraseRunIdSchema, "params"),
    asyncHandler((request, response) =>
      controller.getParaphraseRun(request, response),
    ),
  );

  router.delete(
    "/:paraphraseRunId",
    validate(paraphraseRunIdSchema, "params"),
    asyncHandler((request, response) =>
      controller.deleteParaphraseRun(request, response),
    ),
  );

  return router;
};
