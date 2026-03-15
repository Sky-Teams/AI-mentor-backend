import { Router } from "express";
import { asyncHandler } from "../../../shared/http/async-handler";
import { validate } from "../../../shared/http/validation";
import { authenticate } from "../../../shared/middleware/authenticate";
import type { TokenService } from "../../auth/domain/token-service";
import type { ReviewController } from "./review.controller";
import {
  issueParamsSchema,
  reviewProjectParamsSchema,
  reviewRunParamsSchema,
  triggerReviewSchema,
  updateIssueSchema,
} from "./review.schemas";

export const createReviewRouter = (
  controller: ReviewController,
  tokenService: TokenService,
): Router => {
  const router = Router();
  router.use(authenticate(tokenService));

  router.post(
    "/projects/:projectId/reviews",
    validate(reviewProjectParamsSchema, "params"),
    validate(triggerReviewSchema),
    asyncHandler((request, response) => controller.triggerReview(request, response)),
  );

  router.get(
    "/projects/:projectId/reviews",
    validate(reviewProjectParamsSchema, "params"),
    asyncHandler((request, response) => controller.listProjectReviews(request, response)),
  );

  router.get(
    "/projects/:projectId/issues",
    validate(reviewProjectParamsSchema, "params"),
    asyncHandler((request, response) => controller.listIssues(request, response)),
  );

  router.get(
    "/projects/:projectId/readiness",
    validate(reviewProjectParamsSchema, "params"),
    asyncHandler((request, response) => controller.getReadiness(request, response)),
  );

  router.get(
    "/reviews/:reviewRunId",
    validate(reviewRunParamsSchema, "params"),
    asyncHandler((request, response) => controller.getReviewRun(request, response)),
  );

  router.patch(
    "/issues/:issueId",
    validate(issueParamsSchema, "params"),
    validate(updateIssueSchema),
    asyncHandler((request, response) => controller.updateIssue(request, response)),
  );

  return router;
};
