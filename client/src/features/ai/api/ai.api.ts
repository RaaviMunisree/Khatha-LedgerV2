import type { ApiResponse } from "../../../lib/api/api.types";
import type {
  AIChatRequest,
  AIChatResponse,
} from "../types/ai.types";
import { apiClient } from "../../../lib/api/client";

export const chatWithAI = async (
  payload: AIChatRequest,
): Promise<ApiResponse<AIChatResponse>> => {
  const res = await apiClient.post<ApiResponse<AIChatResponse>>(
    "/ai/chat",
    payload,
  );
  return res.data;
};
