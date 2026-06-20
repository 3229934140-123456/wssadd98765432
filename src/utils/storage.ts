const STORAGE_PREFIX = 'novel-workbench-';
const STORAGE_VERSION = 'v2';
const VERSION_KEY = `${STORAGE_PREFIX}version`;

function checkStorageVersion(): void {
  try {
    const currentVersion = localStorage.getItem(VERSION_KEY);
    if (currentVersion !== STORAGE_VERSION) {
      const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
      keys.forEach(k => localStorage.removeItem(k));
      localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    }
  } catch (e) {
    console.warn('Failed to check storage version:', e);
  }
}

checkStorageVersion();

export function getStorageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

export function saveToStorage<T>(key: string, data: T): void {
  try {
    const storageKey = getStorageKey(key);
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const storageKey = getStorageKey(key);
    const data = localStorage.getItem(storageKey);
    if (data) {
      return JSON.parse(data) as T;
    }
    return defaultValue;
  } catch (e) {
    console.warn('Failed to load from localStorage:', e);
    return defaultValue;
  }
}

export function clearStorage(key: string): void {
  try {
    const storageKey = getStorageKey(key);
    localStorage.removeItem(storageKey);
  } catch (e) {
    console.warn('Failed to clear from localStorage:', e);
  }
}

export const STORAGE_KEYS = {
  WORKS: 'works',
  DAILY_STATUSES: 'dailyStatuses',
  MESSAGES: 'messages',
  FOLLOWUP_HISTORIES: 'followupHistories',
} as const;
