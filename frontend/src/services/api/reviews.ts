import { apiClient, unwrap } from "./client";
import type {
  ApiSuccessResponse,
  IssueStatus,
  ReadinessSnapshot,
  ReviewIssue,
  ReviewRun,
} from "../../types/api";

export const reviewsApi = {
  async triggerReview(projectId: string, sectionKey: string): Promise<ReviewRun> {
    const response = await apiClient.post<ApiSuccessResponse<ReviewRun>>(
      `/projects/${projectId}/reviews`,
      { sectionKey },
    );
    return unwrap(response.data);
  },

  async listProjectReviews(projectId: string): Promise<ReviewRun[]> {
    const response = await apiClient.get<ApiSuccessResponse<ReviewRun[]>>(
      `/projects/${projectId}/reviews`,
    );
    return unwrap(response.data);
  },

  async getReviewRun(reviewRunId: string): Promise<ReviewRun> {
    const response = await apiClient.get<ApiSuccessResponse<ReviewRun>>(
      `/reviews/${reviewRunId}`,
    );
    return unwrap(response.data);
  },

  async listIssues(projectId: string): Promise<ReviewIssue[]> {
    const response = await apiClient.get<ApiSuccessResponse<ReviewIssue[]>>(
      `/projects/${projectId}/issues`,
    );
    return unwrap(response.data);
  },

  async updateIssue(issueId: string, status: IssueStatus): Promise<ReviewIssue> {
    const response = await apiClient.patch<ApiSuccessResponse<ReviewIssue>>(
      `/issues/${issueId}`,
      { status },
    );
    return unwrap(response.data);
  },

  async getReadiness(projectId: string): Promise<ReadinessSnapshot> {
    const response = await apiClient.get<ApiSuccessResponse<ReadinessSnapshot>>(
      `/projects/${projectId}/readiness`,
    );
    return unwrap(response.data);
  },
};
