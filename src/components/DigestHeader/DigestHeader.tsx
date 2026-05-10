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
    <div className="mb-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">
            {formattedDate}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {activeTopics.map((topic) => (
              <span 
                key={topic.id}
                className="px-2 py-0.5 rounded bg-violet-50 text-violet-700 text-[10px] font-bold border border-violet-100"
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
            px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2
            ${isLoading 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-violet-600 text-white hover:bg-violet-700 shadow-sm active:scale-95'}
          `}
        >
          {isLoading && (
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {isLoading ? 'Updating...' : 'Refresh Digest'}
        </button>
      </div>
      <hr className="border-gray-100" />
    </div>
  );
}
