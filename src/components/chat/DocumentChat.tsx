import React, { useState, useRef } from 'react';
import type { ChatMessage } from '../../types/chat';
import { askQuestionApi } from '../../services/chat-service';
import { Button } from '../ui/Button';
import { ErrorAlert } from '../common/ErrorAlert';
import {
  MessageSquare,
  Send,
  Sparkles,
  Trash2,
  HelpCircle,
} from 'lucide-react';

interface DocumentChatProps {
  documentId: string;
  isCompleted: boolean;
}

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

export const DocumentChat: React.FC<DocumentChatProps> = ({
  documentId,
  isCompleted,
}) => {
  // Input State
  const [questionText, setQuestionText] = useState<string>('');

  // Conversation history state
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Status & Error State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Suggested example questions
  const exampleQuestions = [
    'What is the driving licence number?',
    'What is the full name of the licence holder?',
    'What is the date of birth and blood group?',
    'What is the expiry date of this licence?',
    'What vehicle categories are authorized?',
  ];

  /**
   * Submits a question to backend RAG API.
   */
  const handleSendQuestion = async (queryToSubmit?: string) => {
    const question = (queryToSubmit || questionText).trim();
    if (!question || isLoading || !isCompleted) return;

    setError(null);
    setIsLoading(true);
    setQuestionText('');

    try {
      const response = await askQuestionApi(documentId, question);

      const newMessage: ChatMessage = {
        id: generateMessageId(),
        question: response.question || question,
        answer: response.answer || 'No response answer provided by server.',
        sources: response.sources || [],
        timestamp: new Date().toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setMessages((prev) => [...prev, newMessage]);
    } catch (err: any) {
      setError(
        err.message ||
          'Failed to answer question. Please verify document status and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Quick question pill click handler.
   */
  const handleExampleClick = (q: string) => {
    setQuestionText(q);
    handleSendQuestion(q);
  };

  /**
   * Clears local conversation history.
   */
  const handleClearHistory = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
      {/* Component Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              AI Document Assistant
              <Sparkles className="h-4 w-4 text-blue-500" />
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ask natural language questions grounded in document content
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearHistory}
            className="text-slate-500 hover:text-rose-600"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Clear Chat
          </Button>
        )}
      </div>

      {!isCompleted ? (
        /* Disabled banner if document is not completed */
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center space-y-2">
          <HelpCircle className="h-8 w-8 text-amber-500 mx-auto" />
          <h4 className="text-sm font-semibold text-amber-900">
            Document Processing Required
          </h4>
          <p className="text-xs text-amber-700 max-w-md mx-auto">
            AI question answering will be enabled as soon as document OCR text extraction completes.
          </p>
        </div>
      ) : (
        <>
          {/* Example Questions Pills */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-blue-500" />
              Suggested Questions
            </p>
            <div className="flex flex-wrap gap-2">
              {exampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleClick(q)}
                  disabled={isLoading}
                  className="text-xs bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-full py-1.5 px-3 transition-colors text-left font-medium disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <ErrorAlert
              title="Q&A Error"
              message={error}
              onDismiss={() => setError(null)}
            />
          )}

          {/* Conversation History List */}
          <div ref={chatContainerRef} className="space-y-6 pt-2">
            {messages.length === 0 && !isLoading && (
              <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/50">
                <MessageSquare className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">No questions asked yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Type a question below or select one of the suggested questions above.
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className="space-y-4">
                {/* User Question Bubble */}
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white rounded-2xl rounded-tr-xs px-4 py-3 max-w-lg shadow-xs">
                    <p className="text-sm font-medium leading-relaxed">{msg.question}</p>
                    <span className="text-[10px] text-blue-200 block text-right mt-1 font-mono">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>

                {/* AI Answer Card */}
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-xs p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">AI Response</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {msg.timestamp}
                      </span>
                    </div>
                    {/* Only the AI Answer is displayed */}
                    <p className="text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line">
                      {msg.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Active Question Submission Loading Indicator */}
            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4 animate-spin" />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-xs p-4 flex items-center space-x-3">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                  <span className="text-xs font-medium text-slate-600">
                    Generating answer...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Question Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuestion();
            }}
            className="pt-4 border-t border-slate-100 flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask any question about this driving licence..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              disabled={isLoading || !isCompleted}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:bg-slate-100"
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!questionText.trim() || isLoading || !isCompleted}
              isLoading={isLoading}
            >
              <Send className="h-4 w-4 mr-1.5" />
              Ask AI
            </Button>
          </form>
        </>
      )}
    </div>
  );
};
