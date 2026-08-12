import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { successResponse } from "../../../shared/http/api-response";
import type { ProjectService } from "../application/project.service";
import type { Project } from "src/modules/projects/domain/project.js";

export class ProjectController {
  public constructor(private readonly projectService: ProjectService) {}

  public async listProjects(
    request: Request,
    response: Response,
  ): Promise<void> {
    const status = request.query.status as Project["status"] | undefined;

    const projects = await this.projectService.listProjects(
      request.auth!.userId,
      status!,
    );
    response.status(StatusCodes.OK).json(successResponse(projects));
  }

  public async createProject(
    request: Request,
    response: Response,
  ): Promise<void> {
    const project = await this.projectService.createProject({
      ownerId: request.auth!.userId,
      ...request.body,
    });
    response.status(StatusCodes.CREATED).json(successResponse(project));
  }

  public async getProject(request: Request, response: Response): Promise<void> {
    const { projectId } = request.params as { projectId: string };
    const project = await this.projectService.getProject(
      projectId,
      request.auth!.userId,
    );
    response.status(StatusCodes.OK).json(successResponse(project));
  }

  public async updateProject(
    request: Request,
    response: Response,
  ): Promise<void> {
    const { projectId } = request.params as { projectId: string };
    const project = await this.projectService.updateProject({
      ownerId: request.auth!.userId,
      projectId,
      ...request.body,
    });
    response.status(StatusCodes.OK).json(successResponse(project));
  }

  public async archiveProject(
    request: Request,
    response: Response,
  ): Promise<void> {
    const { projectId } = request.params as { projectId: string };
    await this.projectService.archiveProject(projectId, request.auth!.userId);
    response.status(StatusCodes.OK).json(successResponse({ archived: true }));
  }

  public async unArchiveProject(
    request: Request,
    response: Response,
  ): Promise<void> {
    const { projectId } = request.params as { projectId: string };

    await this.projectService.unArchiveProject(projectId, request.auth!.userId);

    response.status(StatusCodes.OK).json(successResponse({ archived: false }));
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

  public async updateSection(
    request: Request,
    response: Response,
  ): Promise<void> {
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

  public async toggleSectionChecklistItem(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { projectId, sectionKey, checklistId, itemIndex } = req.params as {
      projectId: string;
      sectionKey: string;
      checklistId: string;
      itemIndex: string;
    };

    const result = await this.projectService.toggleSectionChecklistItem(
      projectId,
      req.auth!.userId,
      sectionKey,
      checklistId,
      Number(itemIndex),
    );

    res.status(StatusCodes.OK).json(successResponse(result));
  }

  public async getAllSpecialties(req: Request, res: Response) {
    const specialties = await this.projectService.getAllSpecialties();
    res.status(StatusCodes.OK).json(successResponse(specialties));
  }

  public async getAllArticleTypes(req: Request, res: Response) {
    const specialties = await this.projectService.getAllArticleTypes();
    res.status(StatusCodes.OK).json(successResponse(specialties));
  }

  public async exportProject(req: Request, res: Response) {
    const { projectId } = req.params as { projectId: string };
    const format = req.query.format;

    const project = await this.projectService.getProject(
      projectId,
      req.auth!.userId,
    );

    if (format === "pdf") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${project.title.replace(/[^a-z0-9-_]/gi, "_")}.pdf`,
      );

      const doc = await this.projectService.exportAsPdf(project);
      doc.pipe(res);
      doc.end();
    }

    // If need in the future we will implement this too
    // else if (format === "word") await this.projectService.exportAsWord(project, res);
  }
}
