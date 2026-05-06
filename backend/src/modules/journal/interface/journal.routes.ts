import { Router } from "express";
import { TokenService } from "src/modules/auth/domain/token-service.js";
import { JournalController } from "src/modules/journal/interface/journal.controller.js";
import { asyncHandler } from "src/shared/http/async-handler.js";
import { authenticate } from "src/shared/middleware/authenticate.js";

export const createJournalRouter = (
  controller: JournalController,
  tokenService: TokenService,
): Router => {
  const router = Router();

  router.use(authenticate(tokenService));

  router.get(
    "/",
    asyncHandler((req, res) => controller.listJournals(req, res)),
  );

  return router;
};
