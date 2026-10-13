export type ChatRole = "USER" | "ASSISTANT";

export interface ChatMessage {
  role: ChatRole;
  content: string;
  timestamp?: string;
}

export interface AIChatRequest {
  message: string;
  shopId?: string;
  history?: ChatMessage[];
}

export interface AIChatResponse {
  reply: string;
  sources?: string[];
}
