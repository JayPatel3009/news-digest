import { useDigest } from '../../hooks/useDigest';
import { useTopics } from '../../hooks/useTopics';

/**
 * Header for the generated digest, showing the date, active topics, and refresh action.
 */
export function DigestHeader() {
  const { generate, status } = useDigest();
  const { activeTopics } = useTopics();

  const formattedDate = new Intl.DateTimeFormat('en-NZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const isLoading = status === 'fetching' || status === 'summarising';

  return (
    <div className="mb-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-amber-600 uppercase tracking-[0.2em]">
            {formattedDate}
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {activeTopics.map((topic) => (
              <span 
                key={topic.id}
                className="text-[10px] font-bold text-gray-900 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-sm"
              >
                {topic.label}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={() => generate()}
          disabled={isLoading}
          className={`
            group flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all
            ${isLoading 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-900 hover:text-amber-600'}
          `}
        >
          {isLoading && (
            <div className="w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          )}
          <span>{isLoading ? 'Updating' : 'Refresh Briefing'}</span>
          {!isLoading && <span className="group-hover:translate-x-1 transition-transform">→</span>}
        </button>
      </div>
    </div>
  );
}
