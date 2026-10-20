import type { DigestItem } from '../../domain/index';
import { relativeTime } from '../../utils/relativeTime';
import { sanitizeUrl } from '../../utils/sanitizeUrl';
import { ScoreBar } from '../ScoreBar/ScoreBar';
import { useDeepDive } from '../../hooks/useDeepDive';
import { useDigestStore } from '../../store/digestStore';

interface ArticleCardProps {
  item: DigestItem;
  index: number;
  isFromCache?: boolean;
}

/**
 * Renders an individual article within the digest with AI analysis,
 * relevance score, bookmarking, and on-demand interactive deep dives.
 */
export function ArticleCard({ item, index, isFromCache }: ArticleCardProps) {
  const { article, relevanceScore, aiReason } = item;
  const safeUrl = sanitizeUrl(article.url);
  const { activeQuestion, answers, isLoading, error, ask, close } = useDeepDive();
  const { bookmarks, toggleBookmark } = useDigestStore();
  const isBookmarked = bookmarks.some((b) => b.id === article.id);
  
  // Staggered entrance animation delay
  const delay = Math.min(index * 75, 450);

  const animationClasses = isFromCache 
    ? '' 
    : 'animate-fade-in opacity-0';

  // Normalize score for display (handles 0-1, 1-10, and 0-100)
  const displayScore = relevanceScore > 10 ? relevanceScore : (relevanceScore > 1 ? relevanceScore * 10 : relevanceScore * 100);

  return (
    <div 
      className={`group py-8 border-b border-gray-100 last:border-0 transition-all ${animationClasses}`}
      style={{ animationDelay: isFromCache ? '0ms' : `${delay}ms` }}
    >
      <div className="grid grid-cols-1 md:grid-cols-[1fr_120px] gap-6 items-start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest px-2 py-0.5 bg-amber-50 rounded-sm">
                Score {Math.round(displayScore)}%
              </span>
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                {article.sourceName} • {relativeTime(article.publishedAt)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => toggleBookmark(article)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
                isBookmarked
                  ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
            >
              <span>{isBookmarked ? '★' : '☆'}</span>
              <span>{isBookmarked ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          {safeUrl ? (
            <a 
              href={safeUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <h3 className="text-xl md:text-2xl font-serif font-bold text-gray-900 leading-tight group-hover:text-amber-700 transition-colors">
                {article.title}
              </h3>
            </a>
          ) : (
            <h3 className="text-xl md:text-2xl font-serif font-bold text-gray-900 leading-tight">
              {article.title}
            </h3>
          )}

          <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-2xl">
            {article.description}
          </p>

          <div className="pl-4 border-l-2 border-gray-100 py-1">
            <p className="text-xs md:text-sm text-gray-500 font-medium italic leading-snug">
              AI Insight: {aiReason}
            </p>
          </div>

          {/* Interactive AI Deep Dives */}
          <div className="pt-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-1">
                Deep Dive:
              </span>
              <button
                type="button"
                onClick={() => ask(article, 'eli5')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer ${
                  activeQuestion === 'eli5'
                    ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-xs'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
                aria-label="Explain simply"
              >
                💡 Explain simply
              </button>
              <button
                type="button"
                onClick={() => ask(article, 'counter')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer ${
                  activeQuestion === 'counter'
                    ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-xs'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
                aria-label="Counter arguments"
              >
                ⚖️ Counter-arguments
              </button>
              <button
                type="button"
                onClick={() => ask(article, 'impact')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer ${
                  activeQuestion === 'impact'
                    ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-xs'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
                aria-label="Strategic impact"
              >
                📈 Strategic impact
              </button>
            </div>

            {/* Deep Dive Answer Panel */}
            {activeQuestion && (
              <div className="mt-3 p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-md relative text-xs leading-relaxed animate-fade-in">
                <button
                  type="button"
                  onClick={close}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xs px-1 cursor-pointer"
                  aria-label="Close deep dive"
                >
                  ✕
                </button>
                {isLoading ? (
                  <div className="flex items-center gap-2 text-amber-800 py-1">
                    <div className="w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                    <span className="italic">Gemini is analyzing this perspective...</span>
                  </div>
                ) : error ? (
                  <p className="text-red-700 py-1">{error}</p>
                ) : (
                  <p className="text-gray-800 pr-5 py-0.5">
                    {answers[activeQuestion]}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="hidden md:block pt-2">
          <ScoreBar score={relevanceScore} />
          <p className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter text-right">
            Relevance
          </p>
        </div>
      </div>
    </div>
  );
}
