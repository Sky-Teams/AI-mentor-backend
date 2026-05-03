import { StatusCodes } from "http-status-codes";
import { AppError } from "../../../shared/errors/app-error";
import type {
  CreateProjectInput,
  ProjectRepository,
  UpdateProjectInput,
  UpdateSectionInput,
} from "../domain/project.repository";
import type { Project, ProjectSection } from "../domain/project";

export class ProjectService {
  public constructor(private readonly projectRepository: ProjectRepository) {}

  public async createProject(input: CreateProjectInput): Promise<Project> {
    return this.projectRepository.createProject(input);
  }

  public async listProjects(ownerId: string): Promise<Project[]> {
    return this.projectRepository.listProjectsByOwner(ownerId);
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
}
