import { Router } from "express";
import { asyncHandler } from "../../../shared/http/async-handler";
import { validate } from "../../../shared/http/validation";
import { authenticate } from "../../../shared/middleware/authenticate";
import type { TokenService } from "../../auth/domain/token-service";
import type { ProjectController } from "./project.controller";
import {
  createProjectSchema,
  projectIdParamsSchema,
  sectionParamsSchema,
  updateProjectSchema,
  updateSectionSchema,
} from "./project.schemas";

export const createProjectRouter = (
  controller: ProjectController,
  tokenService: TokenService,
): Router => {
  const router = Router();
  router.use(authenticate(tokenService));

  router.get("/", asyncHandler((request, response) => controller.listProjects(request, response)));
  router.post("/", validate(createProjectSchema), asyncHandler((request, response) => controller.createProject(request, response)));
  router.get("/:projectId", validate(projectIdParamsSchema, "params"), asyncHandler((request, response) => controller.getProject(request, response)));
  router.patch("/:projectId", validate(projectIdParamsSchema, "params"), validate(updateProjectSchema), asyncHandler((request, response) => controller.updateProject(request, response)));
  router.delete("/:projectId", validate(projectIdParamsSchema, "params"), asyncHandler((request, response) => controller.archiveProject(request, response)));

  router.get("/:projectId/sections/:sectionKey", validate(sectionParamsSchema, "params"), asyncHandler((request, response) => controller.getSection(request, response)));
  router.put("/:projectId/sections/:sectionKey", validate(sectionParamsSchema, "params"), validate(updateSectionSchema), asyncHandler((request, response) => controller.updateSection(request, response)));

  return router;
};
