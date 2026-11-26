import { create } from 'zustand';
import type { Article, Digest, Topic } from '../domain/index';

const CUSTOM_TOPICS_STORAGE_KEY = 'custom_topics';
const BOOKMARKS_STORAGE_KEY = 'saved_articles';

/**
 * Loads custom topics from localStorage if available.
 * 
 * @returns An array of custom Topic objects.
 */
function loadCustomTopics(): Topic[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }
  try {
    const raw = localStorage.getItem(CUSTOM_TOPICS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed
        .filter(
          (t): t is Topic =>
            typeof t === 'object' &&
            t !== null &&
            typeof (t as { id?: unknown }).id === 'string' &&
            typeof (t as { label?: unknown }).label === 'string' &&
            typeof (t as { query?: unknown }).query === 'string' &&
            typeof (t as { isActive?: unknown }).isActive === 'boolean'
        )
        .map((t) => ({ ...t, isCustom: true }));
    }
  } catch {
    // If malformed, ignore and start fresh
  }
  return [];
}

/**
 * Persists custom topics to localStorage.
 * 
 * @param topics - All topics in the store.
 */
function saveCustomTopics(topics: Topic[]): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    const customOnly = topics.filter((t) => t.isCustom);
    localStorage.setItem(CUSTOM_TOPICS_STORAGE_KEY, JSON.stringify(customOnly));
  } catch {
    // Storage quota or restriction error, fail gracefully
  }
}

/**
 * Loads saved articles from localStorage.
 * 
 * @returns Array of saved Article objects.
 */
function loadBookmarks(): Article[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (a): a is Article =>
          typeof a === 'object' &&
          a !== null &&
          typeof (a as { id?: unknown }).id === 'string' &&
          typeof (a as { title?: unknown }).title === 'string' &&
          typeof (a as { url?: unknown }).url === 'string'
      );
    }
  } catch {
    // Ignore storage parse errors
  }
  return [];
}

/**
 * Persists saved articles to localStorage.
 * 
 * @param bookmarks - The updated array of bookmarked articles.
 */
function saveBookmarks(bookmarks: Article[]): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
  } catch {
    // Fail gracefully
  }
}

interface DigestState {
  topics: Topic[];
  digest: Digest | null;
  status: Digest['status'];
  error: string | null;
  bookmarks: Article[];
  showBookmarksOnly: boolean;

  setTopics: (topics: Topic[]) => void;
  addCustomTopic: (label: string) => boolean;
  removeCustomTopic: (id: string) => void;
  toggleBookmark: (article: Article) => void;
  setShowBookmarksOnly: (show: boolean) => void;
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
 * custom user-defined topics, bookmarks, current digest, and generation status.
 */
export const useDigestStore = create<DigestState>((set, get) => ({
  topics: [...DEFAULT_TOPICS, ...loadCustomTopics()],
  digest: null,
  status: 'idle',
  error: null,
  bookmarks: loadBookmarks(),
  showBookmarksOnly: false,

  setTopics: (topics) => {
    saveCustomTopics(topics);
    set({ topics });
  },

  addCustomTopic: (label: string): boolean => {
    const trimmed = label.trim();
    if (!trimmed) return false;

    const currentTopics = get().topics;
    const exists = currentTopics.some(
      (t) => t.label.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) return false;

    const newTopic: Topic = {
      id: `custom-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      label: trimmed,
      query: trimmed.toLowerCase(),
      isActive: true,
      isCustom: true,
    };

    const nextTopics = [...currentTopics, newTopic];
    saveCustomTopics(nextTopics);
    set({ topics: nextTopics });
    return true;
  },

  removeCustomTopic: (id: string): void => {
    const currentTopics = get().topics;
    const activeCount = currentTopics.filter((t) => t.isActive).length;
    const target = currentTopics.find((t) => t.id === id);

    let nextTopics = currentTopics.filter((t) => t.id !== id);
    if (target?.isActive && activeCount <= 1) {
      nextTopics = nextTopics.map((t, idx) => (idx === 0 ? { ...t, isActive: true } : t));
    }

    saveCustomTopics(nextTopics);
    set({ topics: nextTopics });
  },

  toggleBookmark: (article: Article): void => {
    const current = get().bookmarks;
    const exists = current.some((a) => a.id === article.id);
    const next = exists
      ? current.filter((a) => a.id !== article.id)
      : [...current, article];
    saveBookmarks(next);
    set({ bookmarks: next });
  },

  setShowBookmarksOnly: (show: boolean) => set({ showBookmarksOnly: show }),
  setDigest: (digest) => set({ digest }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
  reset: () => set({ digest: null, status: 'idle', error: null, showBookmarksOnly: false }),
}));
