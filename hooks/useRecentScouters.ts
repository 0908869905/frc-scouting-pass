import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'recent_scouters';
const MAX_RECENT = 3;

export function useRecentScouters() {
  const [recentScouters, setRecentScouters] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentScouters));
  }, [recentScouters]);

  const addScouter = useCallback((name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    setRecentScouters(prev => {
      // Remove if already exists, then add to front
      const filtered = prev.filter(n => n.toLowerCase() !== trimmedName.toLowerCase());
      const updated = [trimmedName, ...filtered].slice(0, MAX_RECENT);
      return updated;
    });
  }, []);

  return { recentScouters, addScouter };
}
