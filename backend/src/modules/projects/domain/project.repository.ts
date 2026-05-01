import type { Project, ProjectSection, SectionVersion } from "./project";

export interface CreateProjectInput {
  ownerId: string;
  title: string;
  targetJournal?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateProjectInput {
  projectId: string;
  ownerId: string;
  title?: string;
  targetJournal?: string | null;
  status?: Project["status"];
  metadata?: Record<string, unknown>;
}

export interface UpdateSectionInput {
  projectId: string;
  ownerId: string;
  sectionKey: ProjectSection["key"];
  content: string;
  changeSummary?: string;
}

export interface ProjectRepository {
  createProject(input: CreateProjectInput): Promise<Project>;
  listProjectsByOwner(ownerId: string): Promise<Project[]>;
  findProjectByIdForOwner(
    projectId: string,
    ownerId: string,
  ): Promise<Project | null>;
  updateProject(input: UpdateProjectInput): Promise<Project>;
  archiveProject(projectId: string, ownerId: string): Promise<void>;
  updateSectionContent(input: UpdateSectionInput): Promise<{
    section: ProjectSection;
    version: SectionVersion;
  }>;
  findSectionByKey(
    projectId: string,
    ownerId: string,
    sectionKey: ProjectSection["key"],
  ): Promise<ProjectSection | null>;
  findSectionById(
    sectionId: string,
    ownerId: string,
    projectId: string,
  ): Promise<ProjectSection | null>;
}
