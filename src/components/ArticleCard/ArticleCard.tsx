import type { DigestItem } from '../../domain';
import { relativeTime } from '../../utils/relativeTime';
import { ScoreBar } from '../ScoreBar/ScoreBar';

interface ArticleCardProps {
  item: DigestItem;
  index: number;
  isFromCache?: boolean;
}

/**
 * Renders an individual article within the digest with AI analysis.
 */
export function ArticleCard({ item, index, isFromCache }: ArticleCardProps) {
  const { article, relevanceScore, aiReason } = item;
  
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
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest px-2 py-0.5 bg-amber-50 rounded-sm">
              Score {Math.round(displayScore)}%
            </span>
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
              {article.sourceName} • {relativeTime(article.publishedAt)}
            </span>
          </div>

          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block"
          >
            <h3 className="text-xl md:text-2xl font-serif font-bold text-gray-900 leading-tight group-hover:text-amber-700 transition-colors">
              {article.title}
            </h3>
          </a>

          <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-2xl">
            {article.description}
          </p>

          <div className="pl-4 border-l-2 border-gray-100 py-1">
            <p className="text-xs md:text-sm text-gray-500 font-medium italic leading-snug">
              AI Insight: {aiReason}
            </p>
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
