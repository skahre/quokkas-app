import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const KEY = "recent-searches:v1";
const MAX = 8;

const dedupe = (list: string[]) => {
  const seen = new Set<string>();
  return list.filter((q) => {
    const k = q.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

export default function useRecentSearches() {
  const [recents, setRecents] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(KEY);
        const parsed = saved ? JSON.parse(saved) : [];
        if (Array.isArray(parsed)) {
          const strings = parsed.filter(
            (x): x is string => typeof x === "string",
          );
          setRecents((prev) => dedupe([...prev, ...strings]).slice(0, MAX));
        }
      } catch (e) {
        console.warn("Could not load recent searches", e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(KEY, JSON.stringify(recents)).catch(() => {});
  }, [recents, loaded]);

  const add = useCallback((query: string) => {
    const q = query.trim();
    if (!q) return;
    setRecents((prev) => dedupe([q, ...prev]).slice(0, MAX));
  }, []);

  const remove = useCallback(
    (query: string) => setRecents((prev) => prev.filter((q) => q !== query)),
    [],
  );

  const clear = useCallback(() => setRecents([]), []);

  return { recents, add, remove, clear };
}
