import { create } from 'zustand';
import type { Digest, Topic } from '../domain/index';

interface DigestState {
  topics: Topic[];
  digest: Digest | null;
  status: Digest['status'];
  error: string | null;

  setTopics: (topics: Topic[]) => void;
  setDigest: (digest: Digest | null) => void;
  setStatus: (status: Digest['status']) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const DEFAULT_TOPICS: Topic[] = [
  { id: 'tech', label: 'Technology', query: 'technology', isActive: true },
  { id: 'ai', label: 'AI', query: 'artificial intelligence', isActive: true },
  { id: 'finance', label: 'Finance', query: 'business finance economy', isActive: false },
  { id: 'science', label: 'Science', query: 'science discovery research', isActive: false },
  { id: 'health', label: 'Health', query: 'health medicine wellness', isActive: false },
  { id: 'space', label: 'Space', query: 'space exploration astronomy', isActive: false },
  { id: 'environment', label: 'Climate', query: 'climate change environment', isActive: false },
  { id: 'politics', label: 'Politics', query: 'world politics government', isActive: false },
  { id: 'culture', label: 'Culture', query: 'arts culture lifestyle', isActive: false },
  { id: 'design', label: 'Design', query: 'design architecture creativity', isActive: false },
];

/**
 * Zustand store for managing the application's global state including topics,
 * the current digest, and the generation status.
 */
export const useDigestStore = create<DigestState>((set) => ({
  topics: DEFAULT_TOPICS,
  digest: null,
  status: 'idle',
  error: null,

  setTopics: (topics) => set({ topics }),
  setDigest: (digest) => set({ digest }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
  reset: () => set({ digest: null, status: 'idle', error: null }),
}));
