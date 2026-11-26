import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTopics } from '../../hooks/useTopics';

/**
 * UI for multi-selecting news topics and creating custom topics.
 */
export function TopicSelector() {
  const { topics, toggleTopic, isLastActive, activeTopics, addCustomTopic, removeCustomTopic } = useTopics();
  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      addCustomTopic(inputValue);
      setInputValue('');
      setIsAdding(false);
    }
  };

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
      <div className="flex flex-wrap items-center gap-2">
        {topics.map((topic) => {
          const active = topic.isActive;
          const lastActive = isLastActive(topic.id);

          return (
            <div
              key={topic.id}
              className={`
                inline-flex items-center rounded-full text-xs font-bold transition-all border
                ${
                  active
                    ? 'bg-amber-100 border-amber-200 text-amber-900 shadow-sm'
                    : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
                }
                ${lastActive ? 'opacity-50' : ''}
              `}
            >
              <button
                type="button"
                onClick={() => toggleTopic(topic.id)}
                disabled={lastActive}
                className={`px-4 py-1.5 rounded-full ${lastActive ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {topic.label}
                {active && !topic.isCustom && <span className="ml-1.5 opacity-70">✕</span>}
              </button>
              {topic.isCustom && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCustomTopic(topic.id);
                  }}
                  title="Remove custom topic"
                  aria-label={`Remove custom topic ${topic.label}`}
                  className="pr-3 pl-0.5 text-xs text-amber-700/60 hover:text-red-600 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}

        {isAdding ? (
          <form onSubmit={handleAddSubmit} className="inline-flex items-center gap-1.5">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. Robotics, Crypto"
              autoFocus
              className="px-3 py-1 rounded-full text-xs border border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white text-gray-800"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="px-3 py-1 rounded-full text-xs font-bold bg-gray-900 text-white disabled:opacity-40 hover:bg-amber-600 transition-all cursor-pointer"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setInputValue('');
                setIsAdding(false);
              }}
              className="px-2 py-1 text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border border-dashed border-gray-300 text-gray-400 hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50/50 cursor-pointer"
          >
            + Add Topic
          </button>
        )}
      </div>
    </div>
  );
}
