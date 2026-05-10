import { useTopics } from '../../hooks/useTopics';

/**
 * UI for multi-selecting news topics.
 */
export function TopicSelector() {
  const { topics, toggleTopic, isLastActive, activeTopics } = useTopics();

  return (
    <div className="space-y-3 my-6">
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
                px-4 py-1.5 rounded-full text-sm font-medium transition-all border
                ${
                  active
                    ? 'bg-violet-100 border-violet-400 text-violet-800'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }
                ${lastActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {topic.label}
              {active && <span className="ml-1.5 text-[10px] opacity-70">✕</span>}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 italic">
        {activeTopics.length} topic{activeTopics.length === 1 ? '' : 's'} selected (minimum 1)
      </p>
    </div>
  );
}
