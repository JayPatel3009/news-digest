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
    : 'animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both';

  return (
    <div 
      className={`p-5 bg-white border border-gray-100 rounded-xl shadow-sm mb-4 transition-all hover:shadow-md hover:border-violet-200 ${animationClasses}`}
      style={{ animationDelay: isFromCache ? '0ms' : `${delay}ms` }}
    >
      <div className="space-y-3">
        <a 
          href={article.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block group"
        >
          <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-violet-600 transition-colors">
            {article.title}
          </h3>
        </a>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="font-semibold text-gray-500">{article.sourceName}</span>
          <span>·</span>
          <span>{relativeTime(article.publishedAt)}</span>
        </div>

        <p className="text-sm text-gray-600 italic leading-snug">
          "{aiReason}"
        </p>

        <div className="pt-1">
          <ScoreBar score={relevanceScore} />
        </div>
      </div>
    </div>
  );
}
