import { apiClient, unwrap } from "./client";
import type { ApiSuccessResponse, Project, ProjectSection } from "../../types/api";

export const projectsApi = {
  async list(): Promise<Project[]> {
    const response = await apiClient.get<ApiSuccessResponse<Project[]>>("/projects");
    return unwrap(response.data);
  },

  async create(input: {
    title: string;
    targetJournal?: string;
    metadata?: Record<string, string>;
  }): Promise<Project> {
    const response = await apiClient.post<ApiSuccessResponse<Project>>("/projects", input);
    return unwrap(response.data);
  },

  async get(projectId: string): Promise<Project> {
    const response = await apiClient.get<ApiSuccessResponse<Project>>(`/projects/${projectId}`);
    return unwrap(response.data);
  },

  async getSection(projectId: string, sectionKey: string): Promise<ProjectSection> {
    const response = await apiClient.get<ApiSuccessResponse<ProjectSection>>(
      `/projects/${projectId}/sections/${sectionKey}`,
    );
    return unwrap(response.data);
  },

  async updateSection(
    projectId: string,
    sectionKey: string,
    input: { content: string; changeSummary?: string },
  ): Promise<{ section: ProjectSection; versionNumber: number }> {
    const response = await apiClient.put<
      ApiSuccessResponse<{ section: ProjectSection; versionNumber: number }>
    >(`/projects/${projectId}/sections/${sectionKey}`, input);
    return unwrap(response.data);
  },
};
