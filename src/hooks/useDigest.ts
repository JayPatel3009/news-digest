import { useEffect, useCallback } from 'react';
import { useDigestStore } from '../store/digestStore';
import { fetchArticles, RateLimitError, NoResultsError } from '../adapters/NewsAdapter';
import { summarise, GeminiParseError } from '../adapters/GeminiAdapter';
import { Article, Digest, DigestItem } from '../domain';

const SESSION_KEY = 'last_digest';

/**
 * Hook to orchestrate the full digest generation flow:
 * Fetching headlines -> Deduplicating -> AI Summarization -> Persistence.
 */
export function useDigest() {
  const { digest, status, error, setDigest, setStatus, setError, topics, reset } = useDigestStore();

  // Restore from sessionStorage on mount
  useEffect(() => {
    const cached = sessionStorage.getItem(SESSION_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as Digest;
        // Basic validation that it's a Digest
        if (parsed.id && parsed.items) {
          setDigest(parsed);
          setStatus('ready');
        }
      } catch (e: unknown) {
        console.error('Failed to restore digest from session storage', e);
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
  }, [setDigest, setStatus]);

  /**
   * Triggers the generation of a new digest based on active topics.
   */
  const generate = useCallback(async () => {
    const activeTopics = topics.filter((t) => t.isActive);
    if (activeTopics.length === 0) return;

    setError(null);
    setStatus('fetching');

    try {
      // 1. Fetch articles in parallel
      const results = await Promise.all(activeTopics.map((topic) => fetchArticles(topic)));
      const allArticles = results.flat();

      // 2. Deduplicate by URL
      const seenUrls = new Set<string>();
      const dedupedArticles: Article[] = [];
      for (const article of allArticles) {
        if (!seenUrls.has(article.url)) {
          seenUrls.add(article.url);
          dedupedArticles.push(article);
        }
      }

      if (dedupedArticles.length === 0) {
        throw new Error('No unique articles found for the selected topics.');
      }

      // 3. Summarise with Gemini
      setStatus('summarising');
      const activeLabels = activeTopics.map((t) => t.label);
      const summary = await summarise(dedupedArticles, activeLabels);

      // 4. Build Digest Item list (mapping AI results back to Article data)
      const digestItems: DigestItem[] = summary.items.map((item) => {
        const article = dedupedArticles.find((a) => a.id === item.articleId);
        if (!article) {
          // Fallback in case Gemini returns an ID we don't recognize
          throw new Error(`AI returned unknown article ID: ${item.articleId}`);
        }
        return {
          article,
          relevanceScore: item.relevanceScore,
          aiReason: item.aiReason,
        };
      });

      // 5. Finalize Digest
      const newDigest: Digest = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        topicIds: activeTopics.map((t) => t.id),
        executiveSummary: summary.executiveSummary,
        items: digestItems.sort((a, b) => b.relevanceScore - a.relevanceScore),
        status: 'ready',
      };

      setDigest(newDigest);
      setStatus('ready');
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(newDigest));

    } catch (err: unknown) {
      let message = 'An unexpected error occurred while generating your digest.';
      
      if (err instanceof RateLimitError) {
        message = err.message;
      } else if (err instanceof NoResultsError) {
        message = err.message;
      } else if (err instanceof GeminiParseError) {
        message = 'The AI produced a summary we couldn\'t read. Please try again.';
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
      setStatus('error');
    }
  }, [topics, setDigest, setStatus, setError]);

  return {
    digest,
    status,
    error,
    generate,
    reset,
  };
}
