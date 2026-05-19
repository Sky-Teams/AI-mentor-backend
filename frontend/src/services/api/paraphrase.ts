import {
  ApiSuccessResponse,
  LengthStrategy,
  ParaphraseRun,
  ToneType,
} from "../../types/api";
import { apiClient, unwrap } from "./client";

export const paraphraseApi = {
  async triggerParaphrase(input: {
    projectId: string;
    sectionId: string;
    tone?: ToneType;
    lengthStrategy?: LengthStrategy;
    preservedWords?: string[]
  }): Promise<ParaphraseRun> {
    const response = await apiClient.post<ApiSuccessResponse<ParaphraseRun>>(
      `/projects/paraphrase/${input.projectId}`,
      input,
    );

    return unwrap(response.data);
  },

  async getParaphrase(paraphraseRunId: string) {
    const response = await apiClient.get<ApiSuccessResponse<ParaphraseRun>>(
      `/projects/paraphrase/${paraphraseRunId}`,
    );

    return unwrap(response.data);
  },

  async getSectionParaphrase(projectId: string, sectionId: string){
    const response = await apiClient.get<ApiSuccessResponse<ParaphraseRun[]>>(
      `/projects/paraphrase`,{
        params:{
          projectId: projectId,
          sectionId: sectionId
        }
      }
    )

    return unwrap(response.data)
  },

  async deleteParaphrase(paraphraseRunId: string){
    const response = await apiClient.delete<ApiSuccessResponse<ParaphraseRun>>(
      `/projects/paraphrase/${paraphraseRunId}`
    )

    return unwrap(response.data)
  }
};
