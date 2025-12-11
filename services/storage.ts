
import { ScoutingData, MatchRecord } from '../types';

const STORAGE_KEY = 'scouting_history_v1';

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const getHistory = (): MatchRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
};

export const saveMatchToHistory = (data: ScoutingData, synced: boolean = false): MatchRecord => {
  const history = getHistory();
  
  // Check for duplicates based on Match Number + Team Number + Match Level (simple duplicate check)
  // If exists, update it. If not, add new.
  const existingIndex = history.findIndex(r => 
    r.data.matchNumber === data.matchNumber && 
    r.data.teamNumber === data.teamNumber && 
    r.data.matchLevel === data.matchLevel &&
    r.data.eventCode === data.eventCode
  );

  const newRecord: MatchRecord = {
    id: existingIndex >= 0 ? history[existingIndex].id : generateId(),
    data: { ...data }, // Clone
    timestamp: Date.now(),
    synced
  };

  if (existingIndex >= 0) {
    history[existingIndex] = newRecord;
  } else {
    history.unshift(newRecord); // Add to top
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return newRecord;
};

export const markAsSynced = (id: string) => {
  const history = getHistory();
  const index = history.findIndex(r => r.id === id);
  if (index >= 0) {
    history[index].synced = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }
};

export const deleteMatchRecord = (id: string) => {
  const history = getHistory();
  const newHistory = history.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
};

export const getUnsyncedCount = (): number => {
  return getHistory().filter(r => !r.synced).length;
};
