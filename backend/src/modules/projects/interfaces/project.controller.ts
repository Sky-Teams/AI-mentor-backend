import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { successResponse } from "../../../shared/http/api-response";
import type { ProjectService } from "../application/project.service";
import { Project } from "src/modules/projects/domain/project.js";
import { removeUploadedFile } from "src/shared/utils/uploadImage.js";

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

  // Upload image for a project, need projectId, the sectionKey is choosed 'FIGURES AND TABLES'  by default
  public async uploadMedia(req: Request, res: Response): Promise<void> {
    const { projectId } = req.params as { projectId: string };
    const file = req.file;
    const caption = String(req.body.caption ?? "").trim();

    if (!file) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: { code: "IMAGE_REQUIRED", message: "An image is required." },
      });
      return;
    }

    if (!caption) {
      await removeUploadedFile(file.path);
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: {
          code: "CAPTION_REQUIRED",
          message: "A caption is required.",
        },
      });
      return;
    }

    try {
      const section = await this.projectService.getSection(
        projectId,
        req.auth!.userId,
        "FIGURES AND TABLES",
      );

      const media = section.content.media ?? [];
      const figure = {
        id: file.filename.slice(0, file.filename.lastIndexOf(".")),
        label: `Fig. ${media.length + 1}`,
        caption,
        src: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
        createdAt: new Date().toISOString(),
      };

      const result = await this.projectService.updateSection({
        projectId,
        ownerId: req.auth!.userId,
        sectionKey: "FIGURES AND TABLES",
        content: { ...section.content, media: [...media, figure] },
        changeSummary: "Uploaded figure",
      });

      res.status(StatusCodes.CREATED).json(
        successResponse({
          figure,
          section: result.section,
        }),
      );
    } catch (error) {
      await removeUploadedFile(file.path);
      throw error;
    }
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
}
