import { api } from './api';
import type { AskQuestionRequest, AskQuestionResponse } from '../types/chat';

/**
 * Sends a natural language question about a document to the backend RAG Q&A endpoint (`POST /api/v1/documents/{document_id}/ask`).
 */
export async function askQuestionApi(
  documentId: string,
  question: string,
  topK: number = 5
): Promise<AskQuestionResponse> {
  const payload: AskQuestionRequest = {
    question: question.trim(),
    top_k: topK,
  };

  return api.post<AskQuestionResponse>(
    `/api/v1/documents/${documentId}/ask`,
    payload,
    { requiresAuth: true }
  );
}
