export interface ConversationRequest {
  conversational_context: string;
}

export interface ConversationResponse {
  title: string;
  description: string;
  conversational_context: string;
}