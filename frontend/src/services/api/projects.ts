import { apiClient, unwrap } from "./client";
import type {
  ApiSuccessResponse,
  ArticleType,
  Project,
  ProjectSection,
  SectionContent,
  Specialty,
} from "../../types/api";

export const projectsApi = {
  async list(): Promise<Project[]> {
    const response =
      await apiClient.get<ApiSuccessResponse<Project[]>>("/projects");
    return unwrap(response.data);
  },

  async getArticleTypes(): Promise<ArticleType[]> {
    const response = await apiClient.get<ApiSuccessResponse<ArticleType[]>>(
      "/projects/articleTypes",
    );
    return unwrap(response.data);
  },

  async getSpecialties(): Promise<Specialty[]> {
    const response = await apiClient.get<ApiSuccessResponse<Specialty[]>>(
      "/projects/specialties",
    );
    return unwrap(response.data);
  },

  async create(input: {
    title: string;
    articleTypeId: string;
    specialtyId: string;
    targetJournal?: string;
  }): Promise<Project> {
    const response = await apiClient.post<ApiSuccessResponse<Project>>(
      "/projects",
      input,
    );
    return unwrap(response.data);
  },

  async get(projectId: string): Promise<Project> {
    const response = await apiClient.get<ApiSuccessResponse<Project>>(
      `/projects/${projectId}`,
    );
    return unwrap(response.data);
  },

  async getSection(
    projectId: string,
    sectionKey: string,
  ): Promise<ProjectSection> {
    const response = await apiClient.get<ApiSuccessResponse<ProjectSection>>(
      `/projects/${projectId}/sections/${sectionKey}`,
    );
    return unwrap(response.data);
  },

  async updateSection(
    projectId: string,
    sectionKey: string,
    input: { content: SectionContent; changeSummary?: string },
  ): Promise<{ section: ProjectSection; versionNumber: number }> {
    const response = await apiClient.put<
      ApiSuccessResponse<{ section: ProjectSection; versionNumber: number }>
    >(`/projects/${projectId}/sections/${sectionKey}`, input);
    return unwrap(response.data);
  },

  async uploadMedia(
    projectId: string,
    file: File,
    caption: string,
  ): Promise<{ figure: NonNullable<SectionContent["media"]>[number] }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("caption", caption);

    const response = await apiClient.post<
      ApiSuccessResponse<{
        figure: NonNullable<SectionContent["media"]>[number];
      }>
    >(`/projects/${projectId}/media`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return unwrap(response.data);
  },

  async archive(projectId: string): Promise<{ archived: boolean }> {
    const response = await apiClient.delete<
      ApiSuccessResponse<{ archived: boolean }>
    >(`/projects/${projectId}`);
    return unwrap(response.data);
  },

  async toggleSectionChecklistItem(
    projectId: string,
    sectionKey: string,
    checklistId: string,
    itemIndex: number,
  ): Promise<{ checked: boolean }> {
    const response = await apiClient.patch<
      ApiSuccessResponse<{ checked: boolean }>
    >(
      `/projects/${projectId}/sections/${sectionKey}/checklist/${checklistId}/items/${itemIndex}/toggle`,
    );
    return unwrap(response.data);
  },

  async exportProject(projectId: string): Promise<void> {
    const res = await apiClient.get(`/projects/export/${projectId}`, {
      responseType: "blob", // blob means: dont convert response as a json, return it as a raw binary file data
    });

    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `project-${projectId}.pdf`;
    link.click();

    window.URL.revokeObjectURL(url);
  },
};
