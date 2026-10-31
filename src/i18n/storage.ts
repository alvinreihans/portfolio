import type { Language } from './detect.ts';

const KEY = 'lang';

// Storage can throw in private mode or when blocked; the site must keep working (AC10).
export function readSavedLanguage(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function saveLanguage(language: Language): void {
  try {
    localStorage.setItem(KEY, language);
  } catch {
    // Not saved; the choice still applies for this visit.
  }
}
