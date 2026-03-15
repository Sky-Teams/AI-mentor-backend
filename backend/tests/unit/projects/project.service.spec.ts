import { describe, expect, it, jest } from "@jest/globals";
import { AppError } from "../../../src/shared/errors/app-error";
import { ProjectService } from "../../../src/modules/projects/application/project.service";
import type { ProjectRepository } from "../../../src/modules/projects/domain/project.repository";

const buildProjectService = () => {
  const projectRepository: jest.Mocked<ProjectRepository> = {
    createProject: jest.fn(),
    listProjectsByOwner: jest.fn(),
    findProjectByIdForOwner: jest.fn(),
    updateProject: jest.fn(),
    archiveProject: jest.fn(),
    updateSectionContent: jest.fn(),
    findSectionByKey: jest.fn(),
  };

  return {
    projectService: new ProjectService(projectRepository),
    projectRepository,
  };
};

describe("ProjectService", () => {
  it("throws when a project does not exist", async () => {
    const { projectService, projectRepository } = buildProjectService();
    projectRepository.findProjectByIdForOwner.mockResolvedValue(null);

    await expect(projectService.getProject("missing", "user-1")).rejects.toMatchObject({
      message: "Project was not found.",
      statusCode: 404,
      code: "PROJECT_NOT_FOUND",
    } satisfies Partial<AppError>);
  });

  it("blocks section editing for archived projects", async () => {
    const { projectService, projectRepository } = buildProjectService();
    projectRepository.findProjectByIdForOwner.mockResolvedValue({
      id: "project-1",
      ownerId: "user-1",
      manuscriptType: "CASE_REPORT",
      title: "Archived",
      status: "ARCHIVED",
      targetJournal: null,
      metadata: null,
      readinessScore: null,
      lastReviewedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      sections: [],
    });

    await expect(
      projectService.updateSection({
        ownerId: "user-1",
        projectId: "project-1",
        sectionKey: "ABSTRACT",
        content: "Updated content",
      }),
    ).rejects.toMatchObject({
      message: "Archived projects cannot be edited.",
      statusCode: 400,
      code: "PROJECT_ARCHIVED",
    } satisfies Partial<AppError>);
  });
});
