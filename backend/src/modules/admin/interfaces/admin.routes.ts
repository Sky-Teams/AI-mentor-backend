import { Router } from "express";
import { asyncHandler } from "../../../shared/http/async-handler";
import { validate } from "../../../shared/http/validation";
import { authenticate } from "../../../shared/middleware/authenticate";
import { authorize } from "../../../shared/middleware/authorize";
import type { TokenService } from "../../auth/domain/token-service";
import type { AdminController } from "./admin.controller";
import {
  guidelinePackSchema,
  planSchema,
  promptTemplateSchema,
} from "./admin.schemas";
import {
  requestedPlanIdSchema,
  userIdSchema,
} from "src/modules/subscription/interfaces/subscription.schema";
import {
  createJournalSchema,
  updateJournalSchema,
} from "src/modules/journal/interface/journal.schema.js";

export const createAdminRouter = (
  controller: AdminController,
  tokenService: TokenService,
): Router => {
  const router = Router();
  router.use(authenticate(tokenService));
  router.use(authorize("ADMIN"));

  router.get(
    "/guideline-packs",
    asyncHandler((request, response) =>
      controller.listGuidelines(request, response),
    ),
  );
  router.put(
    "/guideline-packs",
    validate(guidelinePackSchema),
    asyncHandler((request, response) =>
      controller.upsertGuideline(request, response),
    ),
  );
  router.get(
    "/prompt-templates",
    asyncHandler((request, response) =>
      controller.listPromptTemplates(request, response),
    ),
  );
  router.put(
    "/prompt-templates",
    validate(promptTemplateSchema),
    asyncHandler((request, response) =>
      controller.upsertPromptTemplate(request, response),
    ),
  );
  router.get(
    "/plans",
    asyncHandler((request, response) =>
      controller.listPlans(request, response),
    ),
  );
  router.put(
    "/plans",
    validate(planSchema),
    asyncHandler((request, response) =>
      controller.upsertPlan(request, response),
    ),
  );
  router.get(
    "/users/usage",
    asyncHandler((request, response) =>
      controller.listUsersUsage(request, response),
    ),
  );

  router.post(
    "/journals",
    validate(createJournalSchema),
    asyncHandler((req, res) => controller.createJournal(req, res)),
  );

  router.put(
    "/journals/:id",
    validate(updateJournalSchema, "body"),
    asyncHandler((req, res) => controller.updateJournal(req, res)),
  );

  // Subscription Routes
  router.get(
    "/subscriptions/requested-plans",
    asyncHandler((request, response) =>
      controller.getRequestedPlans(request, response),
    ),
  );

  router.patch(
    "/subscriptions/requested-plans/:id",
    validate(requestedPlanIdSchema, "params"),
    validate(userIdSchema, "body"),
    asyncHandler((req, res) => controller.approveRequestedPlan(req, res)),
  );

  return router;
};
