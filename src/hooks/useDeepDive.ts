import { useState, useCallback } from 'react';
import type { Article } from '../domain/index';
import { askDeepDive, type DeepDiveQuestionType } from '../adapters/GeminiAdapter';

export interface DeepDiveHookState {
  activeQuestion: DeepDiveQuestionType | null;
  answers: Partial<Record<DeepDiveQuestionType, string>>;
  isLoading: boolean;
  error: string | null;
  ask: (article: Article, questionType: DeepDiveQuestionType) => Promise<void>;
  close: () => void;
}

/**
 * Hook for managing interactive AI deep dives on individual news articles.
 * 
 * Handles querying Gemini, loading states, error handling, and in-memory caching.
 */
export function useDeepDive(): DeepDiveHookState {
  const [activeQuestion, setActiveQuestion] = useState<DeepDiveQuestionType | null>(null);
  const [answers, setAnswers] = useState<Partial<Record<DeepDiveQuestionType, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = useCallback(() => {
    setActiveQuestion(null);
    setError(null);
  }, []);

  const ask = useCallback(
    async (article: Article, questionType: DeepDiveQuestionType) => {
      // Toggle close if clicking active tab that is already loaded
      if (activeQuestion === questionType && answers[questionType]) {
        setActiveQuestion(null);
        return;
      }

      setActiveQuestion(questionType);
      setError(null);

      // Return cached answer if already fetched
      if (answers[questionType]) {
        return;
      }

      setIsLoading(true);
      try {
        const result = await askDeepDive(article, questionType);
        setAnswers((prev) => ({ ...prev, [questionType]: result }));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to generate answer.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [activeQuestion, answers]
  );

  return {
    activeQuestion,
    answers,
    isLoading,
    error,
    ask,
    close,
  };
}
