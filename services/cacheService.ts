const CACHE_PREFIX = 'storm-notes-app-';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

export const cacheService = {
  set<T>(key: string, data: T): void {
    const entry: CacheEntry<T> = {
      timestamp: Date.now(),
      data,
    };
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    } catch (error) {
      console.error("Failed to write to cache:", error);
    }
  },

  get<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(CACHE_PREFIX + key);
      if (!stored) {
        return null;
      }
      const entry: CacheEntry<T> = JSON.parse(stored);
      if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
        localStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }
      return entry.data;
    } catch (error) {
      console.error("Failed to read from cache:", error);
      return null;
    }
  },
};