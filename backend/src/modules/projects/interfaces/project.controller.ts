import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { successResponse } from "../../../shared/http/api-response";
import type { ProjectService } from "../application/project.service";
import type { ProjectSectionKey } from "../domain/project";

export class ProjectController {
  public constructor(private readonly projectService: ProjectService) {}

  public async listProjects(request: Request, response: Response): Promise<void> {
    const projects = await this.projectService.listProjects(request.auth!.userId);
    response.status(StatusCodes.OK).json(successResponse(projects));
  }

  public async createProject(request: Request, response: Response): Promise<void> {
    const project = await this.projectService.createProject({
      ownerId: request.auth!.userId,
      ...request.body,
    });
    response.status(StatusCodes.CREATED).json(successResponse(project));
  }

  public async getProject(request: Request, response: Response): Promise<void> {
    const project = await this.projectService.getProject(request.params.projectId, request.auth!.userId);
    response.status(StatusCodes.OK).json(successResponse(project));
  }

  public async updateProject(request: Request, response: Response): Promise<void> {
    const project = await this.projectService.updateProject({
      ownerId: request.auth!.userId,
      projectId: request.params.projectId,
      ...request.body,
    });
    response.status(StatusCodes.OK).json(successResponse(project));
  }

  public async archiveProject(request: Request, response: Response): Promise<void> {
    await this.projectService.archiveProject(request.params.projectId, request.auth!.userId);
    response.status(StatusCodes.OK).json(successResponse({ archived: true }));
  }

  public async getSection(request: Request, response: Response): Promise<void> {
    const section = await this.projectService.getSection(
      request.params.projectId,
      request.auth!.userId,
      request.params.sectionKey as ProjectSectionKey,
    );
    response.status(StatusCodes.OK).json(successResponse(section));
  }

  public async updateSection(request: Request, response: Response): Promise<void> {
    const result = await this.projectService.updateSection({
      ownerId: request.auth!.userId,
      projectId: request.params.projectId,
      sectionKey: request.params.sectionKey as ProjectSectionKey,
      ...request.body,
    });
    response.status(StatusCodes.OK).json(successResponse(result));
  }
}
