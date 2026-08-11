import { StatusCodes } from "http-status-codes";
import { AppError } from "../../../shared/errors/app-error";
import type {
  CreateProjectInput,
  ProjectRepository,
  UpdateProjectInput,
  UpdateSectionInput,
} from "../domain/project.repository";
import type { Project, ProjectSection } from "../domain/project";
import PDFDocument from "pdfkit";
import { getSectionExportText } from "src/shared/utils/project.helper.js";

export class ProjectService {
  public constructor(private readonly projectRepository: ProjectRepository) {}

  public async createProject(input: CreateProjectInput): Promise<Project> {
    return this.projectRepository.createProject(input);
  }

  public async listProjects(
    ownerId: string,
    status: Project["status"],
  ): Promise<Project[]> {
    return this.projectRepository.listProjectsByOwner(ownerId, status);
  }

  public async getProject(
    projectId: string,
    ownerId: string,
  ): Promise<Project> {
    const project = await this.projectRepository.findProjectByIdForOwner(
      projectId,
      ownerId,
    );
    if (!project) {
      throw new AppError(
        "Project was not found.",
        StatusCodes.NOT_FOUND,
        "PROJECT_NOT_FOUND",
      );
    }

    return project;
  }

  public async updateProject(input: UpdateProjectInput): Promise<Project> {
    await this.getProject(input.projectId, input.ownerId);
    return this.projectRepository.updateProject(input);
  }

  public async archiveProject(
    projectId: string,
    ownerId: string,
  ): Promise<void> {
    await this.getProject(projectId, ownerId);
    await this.projectRepository.archiveProject(projectId, ownerId);
  }

  public async updateSection(input: UpdateSectionInput): Promise<{
    section: ProjectSection;
    versionNumber: number;
  }> {
    const project = await this.getProject(input.projectId, input.ownerId);
    if (project.status === "ARCHIVED") {
      throw new AppError(
        "Archived projects cannot be edited.",
        StatusCodes.BAD_REQUEST,
        "PROJECT_ARCHIVED",
      );
    }

    await this.getSection(input.projectId, input.ownerId, input.sectionKey);
    const result = await this.projectRepository.updateSectionContent(input);
    return {
      section: result.section,
      versionNumber: result.version.versionNumber,
    };
  }

  public async getSection(
    projectId: string,
    ownerId: string,
    sectionKey: ProjectSection["key"],
  ): Promise<ProjectSection> {
    const section = await this.projectRepository.findSectionByKey(
      projectId,
      ownerId,
      sectionKey,
    );
    if (!section) {
      throw new AppError(
        "Section was not found.",
        StatusCodes.NOT_FOUND,
        "SECTION_NOT_FOUND",
      );
    }

    return section;
  }

  public async getSectionById(
    sectionId: string,
    projectId: string,
    ownerId: string,
  ): Promise<ProjectSection> {
    const section = await this.projectRepository.findSectionById(
      sectionId,
      projectId,
      ownerId,
    );

    if (!section) {
      throw new AppError(
        "Section not found",
        StatusCodes.NOT_FOUND,
        "SECTION_NOT_FOUND",
      );
    }
    return section;
  }

  public async toggleSectionChecklistItem(
    projectId: string,
    ownerId: string,
    sectionKey: string,
    checklistId: string,
    itemIndex: number,
  ): Promise<{ checked: boolean }> {
    await this.getProject(projectId, ownerId);

    return await this.projectRepository.toggleSectionChecklistItem(
      projectId,
      ownerId,
      sectionKey,
      checklistId,
      itemIndex,
    );
  }

  public async getAllSpecialties() {
    return await this.projectRepository.getAllSpecialties();
  }

  public async getAllArticleTypes() {
    return await this.projectRepository.getAllArticleTypes();
  }

  public exportAsPdf(project: Project): Promise<PDFKit.PDFDocument> {
    const doc = new PDFDocument({
      margin: 72,
      bufferPages: true,
    });

    const allSections = project.sections ?? [];
    const titleSection = allSections.find((sec) => sec.key === "TITLE");
    const rootSections = allSections.filter(
      (sec: any) => !sec.parentSectionId && sec.key !== "TITLE",
    );

    this.writeTitle(doc, titleSection);
    this.writeSections(doc, rootSections, allSections);
    this.writePageNumber(doc);

    return doc;
  }

  private writeTitle(doc: PDFKit.PDFDocument, titleSection?: ProjectSection) {
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
  }
  private writeSections(
    doc: PDFKit.PDFDocument,
    rootSections: any,
    allSections: any,
  ) {
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

      const subsections = allSections.filter(
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
  }
  private writePageNumber(doc: any) {
    const range = doc.bufferedPageRange();

    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);

      const bottomMargin = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;

      doc
        .font("Times-Roman")
        .fontSize(9)
        .fillColor("#666666")
        .text(`${i + 1} / ${range.count}`, 0, doc.page.height - 40, {
          align: "center",
        });

      doc.page.margins.bottom = bottomMargin;
    }
  }

  // public async exportAsWord(project, res: Response): Promise<void> {}
}
