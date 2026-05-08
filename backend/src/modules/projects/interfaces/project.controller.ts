import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { successResponse } from "../../../shared/http/api-response";
import type { ProjectService } from "../application/project.service";

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
    const { projectId } = request.params as { projectId: string };
    const project = await this.projectService.getProject(projectId, request.auth!.userId);
    response.status(StatusCodes.OK).json(successResponse(project));
  }

  public async updateProject(request: Request, response: Response): Promise<void> {
    const { projectId } = request.params as { projectId: string };
    const project = await this.projectService.updateProject({
      ownerId: request.auth!.userId,
      projectId,
      ...request.body,
    });
    response.status(StatusCodes.OK).json(successResponse(project));
  }

  public async archiveProject(request: Request, response: Response): Promise<void> {
    const { projectId } = request.params as { projectId: string };
    await this.projectService.archiveProject(projectId, request.auth!.userId);
    response.status(StatusCodes.OK).json(successResponse({ archived: true }));
  }

  public async getSection(request: Request, response: Response): Promise<void> {
    const { projectId, sectionKey } = request.params as {
      projectId: string;
      sectionKey: string;
    };
    const section = await this.projectService.getSection(
      projectId,
      request.auth!.userId,
      sectionKey,
    );
    response.status(StatusCodes.OK).json(successResponse(section));
  }

  public async updateSection(request: Request, response: Response): Promise<void> {
    const { projectId, sectionKey } = request.params as {
      projectId: string;
      sectionKey: string;
    };
    const result = await this.projectService.updateSection({
      ownerId: request.auth!.userId,
      projectId,
      sectionKey,
      ...request.body,
    });
    response.status(StatusCodes.OK).json(successResponse(result));
  }
}
