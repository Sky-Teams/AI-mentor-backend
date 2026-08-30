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
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import {
  getSectionExportLines,
  readMediaBuffer,
  renderFigureMedia,
  renderFormattedText,
  renderReferenceText,
  renderWordFigureMedia,
  type ExportMediaItem,
} from "src/shared/utils/project.helper.js";

type PdfDocument = InstanceType<typeof PDFDocument>;

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

  public async unArchiveProject(
    projectId: string,
    ownerId: string,
  ): Promise<void> {
    await this.getProject(projectId, ownerId);

    await this.projectRepository.unArchiveProject(projectId, ownerId);
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

  public async exportAsPdf(project: Project): Promise<PdfDocument> {
    const doc = new PDFDocument({
      margin: 72,
      bufferPages: true,
    });

    const allSections = project.sections ?? [];
    const mediaItems = allSections.flatMap(
      (section) => section.content?.media ?? [],
    );
    const titleSection = allSections.find((sec) => sec.key === "TITLE");
    const rootSections = allSections
      .filter((sec) => !sec.parentSectionId && sec.key !== "TITLE")
      .sort((a, b) => a.sectionOrder - b.sectionOrder);

    this.writeTitle(doc, titleSection);
    this.writeSections(doc, rootSections, allSections, mediaItems);
    this.writePageNumber(doc);

    return doc;
  }

  public async exportAsWord(project: Project): Promise<Buffer> {
    const allSections = project.sections ?? [];
    const mediaItems = allSections.flatMap(
      (section) => section.content?.media ?? [],
    );
    const titleSection = allSections.find((sec) => sec.key === "TITLE");
    const rootSections = allSections
      .filter((sec) => !sec.parentSectionId && sec.key !== "TITLE")
      .sort((a, b) => a.sectionOrder - b.sectionOrder);

    const childrenByParent = new Map<string, ProjectSection[]>();
    for (const section of allSections) {
      if (!section.parentSectionId) continue;

      const items = childrenByParent.get(section.parentSectionId) ?? [];
      items.push(section);
      childrenByParent.set(section.parentSectionId, items);
    }

    const paragraphs: Paragraph[] = [];

    this.writeWordTitle(paragraphs, titleSection);
    this.writeWordSections(
      paragraphs,
      rootSections,
      childrenByParent,
      mediaItems,
    );

    const doc = new Document({
      sections: [{ children: paragraphs }],
    });

    return await Packer.toBuffer(doc);
  }

  private writeTitle(doc: PdfDocument, titleSection?: ProjectSection) {
    const titleText = titleSection
      ? getSectionExportLines(titleSection).join(" ").trim()
      : "";

    if (!titleText) {
      return;
    }

    doc.font("Times-Bold").fontSize(20).text(titleText, {
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

  private writeSectionBody(
    doc: PdfDocument,
    section: ProjectSection,
    mediaItems: ExportMediaItem[],
  ) {
    const lines = getSectionExportLines(section, { mediaItems });
    const referenceOnly =
      !section.content?.text?.trim() &&
      (section.content?.references?.items?.length ?? 0) > 0;

    for (const line of lines) {
      doc.x = doc.page.margins.left;
      const exportLine = line;

      if (referenceOnly) {
        renderReferenceText(doc, exportLine);
        doc.moveDown(0.35);
        continue;
      }

      renderFormattedText(doc, exportLine);
    }

    if (section.key === "FIGURES AND TABLES") {
      renderFigureMedia(doc, section.content?.media ?? []);
    }
  }

  private writeSections(
    doc: PdfDocument,
    rootSections: ProjectSection[],
    allSections: ProjectSection[],
    mediaItems: ExportMediaItem[],
  ) {
    let sectionNumber = 0;

    for (const section of rootSections) {
      sectionNumber++;

      doc.x = doc.page.margins.left;
      doc
        .font("Times-Bold")
        .fontSize(14)
        .fillColor("#000000")
        .text(`${sectionNumber}. ${section.title}`, { align: "left" });

      doc.moveDown(0.3);

      doc.font("Times-Roman").fontSize(11);
      this.writeSectionBody(doc, section, mediaItems);

      doc.moveDown(0.8);

      const subsections = allSections
        .filter((sec) => sec.parentSectionId === section.id)
        .sort((a, b) => a.sectionOrder - b.sectionOrder);

      let subNumber = 0;
      for (const sub of subsections) {
        subNumber++;
        doc.x = doc.page.margins.left;
        doc
          .font("Times-Bold")
          .fontSize(12)
          .text(`${sectionNumber}.${subNumber} ${sub.title}`);
        doc.moveDown(0.2);
        doc.font("Times-Roman").fontSize(11);
        this.writeSectionBody(doc, sub, mediaItems);
        doc.moveDown(0.8);
      }
    }
  }

  private writePageNumber(doc: PdfDocument) {
    const range = doc.bufferedPageRange();

    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);

      const bottomMargin = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;

      doc
        .font("Times-Roman")
        .fontSize(9)
        .fillColor("#666666")
        .text(
          `${i + 1} / ${range.count}`,
          doc.page.margins.left,
          doc.page.height - 40,
          {
            width:
              doc.page.width - doc.page.margins.left - doc.page.margins.right,
            align: "center",
          },
        );

      doc.page.margins.bottom = bottomMargin;
    }
  }

  private writeWordTitle(
    paragraphs: Paragraph[],
    titleSection?: ProjectSection,
  ): void {
    const titleText = titleSection
      ? getSectionExportLines(titleSection).join(" ").trim()
      : "";

    if (!titleText) return;

    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [new TextRun({ text: titleText, bold: true, size: 32 })],
      }),
    );
  }

  private writeWordSectionBody(
    paragraphs: Paragraph[],
    section: ProjectSection,
    mediaItems: ExportMediaItem[],
  ): void {
    const lines = getSectionExportLines(section, { mediaItems });
    const referenceOnly =
      !section.content?.text?.trim() &&
      (section.content?.references?.items?.length ?? 0) > 0;

    for (const line of lines) {
      const cleanLine = line
        .replace(/<\/?(i|em)>/gi, "")
        .replace(/<br\s*\/?>/gi, " ")
        .trim();

      if (!cleanLine) continue;

      paragraphs.push(
        new Paragraph({
          spacing: { after: referenceOnly ? 80 : 120 },
          children: [new TextRun({ text: cleanLine })],
        }),
      );
    }

    if (section.key === "FIGURES AND TABLES") {
      renderWordFigureMedia(paragraphs, section.content?.media ?? []);
    }
  }

  private writeWordSections(
    paragraphs: Paragraph[],
    rootSections: ProjectSection[],
    childrenByParent: Map<string, ProjectSection[]>,
    mediaItems: ExportMediaItem[],
  ): void {
    let sectionNumber = 0;

    for (const section of rootSections) {
      sectionNumber++;
      paragraphs.push(
        new Paragraph({
          text: `${sectionNumber}. ${section.title}`,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 100 },
        }),
      );

      this.writeWordSectionBody(paragraphs, section, mediaItems);

      const subsections = (childrenByParent.get(section.id) ?? []).sort(
        (a, b) => a.sectionOrder - b.sectionOrder,
      );

      let subNumber = 0;
      for (const sub of subsections) {
        subNumber++;
        paragraphs.push(
          new Paragraph({
            text: `${sectionNumber}.${subNumber} ${sub.title}`,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 80 },
          }),
        );
        this.writeWordSectionBody(paragraphs, sub, mediaItems);
      }
    }
  }
}
