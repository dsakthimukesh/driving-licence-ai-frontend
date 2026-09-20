/**
 * Source chunk reference schema returned by RAG backend.
 */
export interface SourceReference {
  document_chunk_id: string;
  page_number: number | null;
  chunk_index: number;
  similarity_score: number;
  content: string;
}

/**
 * Request payload schema for POST /api/v1/documents/{document_id}/ask.
 */
export interface AskQuestionRequest {
  question: string;
  top_k?: number;
}

/**
 * Response payload schema for POST /api/v1/documents/{document_id}/ask.
 */
export interface AskQuestionResponse {
  document_id: string;
  question: string;
  answer: string;
  sources: SourceReference[];
}

/**
 * Local chat message history item.
 */
export interface ChatMessage {
  id: string;
  question: string;
  answer: string;
  sources: SourceReference[];
  timestamp: string;
}
