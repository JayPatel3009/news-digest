import { useDigestStore } from '../store/digestStore';
import { Topic } from '../domain';

/**
 * Hook for managing topic selection logic.
 * Includes a guard to ensure at least one topic is always active.
 */
export function useTopics() {
  const { topics, setTopics } = useDigestStore();

  const activeTopics = topics.filter((t) => t.isActive);

  /**
   * Toggles the active state of a topic by ID.
   * Will not deactivate a topic if it is the last active one.
   */
  const toggleTopic = (id: string) => {
    const topic = topics.find((t) => t.id === id);
    if (!topic) return;

    // Guard: Prevent deselecting the last active topic
    if (topic.isActive && activeTopics.length === 1) {
      return;
    }

    const nextTopics = topics.map((t) =>
      t.id === id ? { ...t, isActive: !t.isActive } : t
    );

    setTopics(nextTopics);
  };

  /**
   * Checks if a topic is the last one active.
   * Useful for UI components to disable the toggle button/chip.
   */
  const isLastActive = (id: string): boolean => {
    const topic = topics.find((t) => t.id === id);
    return !!(topic?.isActive && activeTopics.length === 1);
  };

  return {
    topics,
    activeTopics,
    toggleTopic,
    isLastActive,
  };
}
