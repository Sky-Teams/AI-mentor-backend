import { Router } from "express";
import { TokenService } from "src/modules/auth/domain/token-service.js";
import { JournalController } from "src/modules/journal/interface/journal.controller.js";
import {
  journalIdParamsSchema,
  specialtyIdQuerySchema,
} from "src/modules/journal/interface/journal.schema.js";
import { asyncHandler } from "src/shared/http/async-handler.js";
import { validate } from "src/shared/http/validation.js";
import { authenticate } from "src/shared/middleware/authenticate.js";

export const createJournalRouter = (
  controller: JournalController,
  tokenService: TokenService,
): Router => {
  const router = Router();

  router.use(authenticate(tokenService));

  router.get(
    "/",
    validate(specialtyIdQuerySchema, "query"),
    asyncHandler((req, res) => controller.getAllJournals(req, res)),
  );

  router.get(
    "/specialties",
    asyncHandler((req, res) => controller.getAllSpecialties(req, res)),
  );

  router.get(
    "/:id",
    validate(journalIdParamsSchema, "params"),
    asyncHandler((req, res) => controller.getJournalById(req, res)),
  );

  return router;
};
