import { create } from 'zustand';
import { Digest, Topic } from '../domain';

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
  { id: 'technology', label: 'Technology', query: 'technology', isActive: true },
  { id: 'ai', label: 'AI', query: 'artificial intelligence', isActive: true },
  { id: 'climate', label: 'Climate', query: 'climate change', isActive: false },
  { id: 'business', label: 'Business', query: 'business economy', isActive: false },
  { id: 'science', label: 'Science', query: 'science discovery', isActive: false },
  { id: 'design', label: 'Design', query: 'design technology', isActive: false },
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
