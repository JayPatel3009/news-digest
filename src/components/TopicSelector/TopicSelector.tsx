import { useTopics } from '../../hooks/useTopics';

/**
 * UI for multi-selecting news topics.
 */
export function TopicSelector() {
  const { topics, toggleTopic, isLastActive, activeTopics } = useTopics();

  return (
    <div className="space-y-4 my-8 pb-8 border-b border-gray-100">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Your Focus
        </h3>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          {activeTopics.length} selected
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => {
          const active = topic.isActive;
          const lastActive = isLastActive(topic.id);

          return (
            <button
              key={topic.id}
              onClick={() => toggleTopic(topic.id)}
              disabled={lastActive}
              className={`
                px-4 py-1.5 rounded-full text-xs font-bold transition-all border
                ${
                  active
                    ? 'bg-amber-100 border-amber-200 text-amber-900 shadow-sm'
                    : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
                }
                ${lastActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {topic.label}
              {active && <span className="ml-1.5 opacity-70">✕</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
