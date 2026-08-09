import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { successResponse } from "../../../shared/http/api-response";
import type { ProjectService } from "../application/project.service";
import type {
  Project,
  ProjectSection,
} from "src/modules/projects/domain/project.js";
import PDFDocument from "pdfkit";

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

    if (format === "pdf") await this.exportAsPdf(project, res);

    // If need in the future we will implement this too
    // else if (format === "word") await this.exportAsWord(project, res);
  }

  private async exportAsPdf(project: Project, res: Response): Promise<void> {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${project.title.replace(/[^a-z0-9-_]/gi, "_")}.pdf`,
    );

    const doc = new PDFDocument({
      margin: 72,
      bufferPages: true,
    });
    doc.pipe(res);

    const sections = project.sections ?? [];
    const titleSection = sections.find((sec) => sec.key === "TITLE");
    const rootSections = sections.filter(
      (sec: any) => !sec.parentSectionId && sec.key !== "TITLE",
    );

    // title
    doc
      .font("Times-Bold")
      .fontSize(20)
      .text(titleSection ? getSectionExportText(titleSection) : "", {
        align: "center",
      });

    doc.moveDown(0.5);

    // line under the title
    doc
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .lineWidth(1)
      .strokeColor("#333333")
      .stroke();

    doc.moveDown(1.5);

    // Sections
    let sectionNumber = 0;

    for (const section of rootSections) {
      sectionNumber++;

      doc
        .font("Times-Bold")
        .fontSize(14)
        .fillColor("#000000")
        .text(`${sectionNumber}. ${section.title}`, { align: "left" });

      doc.moveDown(0.3);

      doc.font("Times-Roman").fontSize(11).text(getSectionExportText(section), {
        align: "justify",
        lineGap: 3,
      });

      doc.moveDown(0.8);

      const subsections = sections.filter(
        (sec: any) => sec.parentSectionId === section.id,
      );

      let subNumber = 0;
      for (const sub of subsections) {
        subNumber++;

        doc
          .font("Times-Bold")
          .fontSize(12)
          .text(`${sectionNumber}.${subNumber} ${sub.title}`, {
            align: "left",
          });

        doc.moveDown(0.2);

        doc.font("Times-Roman").fontSize(11).text(getSectionExportText(sub), {
          align: "justify",
          lineGap: 3,
        });

        doc.moveDown(0.8);
      }
    }

    // Page numbers
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc
        .font("Times-Roman")
        .fontSize(9)
        .fillColor("#666666")
        .text(
          `${i + 1} / ${range.count}`,
          0,
          doc.page.height - doc.page.margins.bottom + 20,
          { align: "center" },
        );
    }

    doc.end();
  }

  // private async exportAsWord(project, res: Response): Promise<void> {}
}
