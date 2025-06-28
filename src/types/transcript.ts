export interface AudioMessage {
  audio: number[];
  conversationId: string;
}

export interface ConversationTranscript {
  id?: string;
  conversation_id: string;
  transcript_data: string;
  created_at?: string;
}