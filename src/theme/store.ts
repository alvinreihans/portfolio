import { useSyncExternalStore } from 'react';

import { isTheme, systemTheme, toggleTheme, type Theme } from './theme.ts';

const KEY = 'theme';
const root = document.documentElement;
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
const listeners = new Set<() => void>();

// Storage can throw in private mode or when blocked; the site keeps following the system.
function readSaved(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function writeSaved(theme: Theme | null) {
  try {
    if (theme) localStorage.setItem(KEY, theme);
    else localStorage.removeItem(KEY);
  } catch {
    // Not saved; the theme still applies for this visit.
  }
}

function apply(theme: Theme) {
  root.dataset.theme = theme;
  listeners.forEach((notify) => notify());
}

// The inline script in index.html already set data-theme before paint.
function current(): Theme {
  return isTheme(root.dataset.theme) ? root.dataset.theme : 'day';
}

darkQuery.addEventListener('change', (event) => {
  if (!isTheme(readSaved())) apply(systemTheme(event.matches));
});

export function toggle() {
  const next = toggleTheme(current(), systemTheme(darkQuery.matches));
  writeSaved(next.save);
  apply(next.theme);
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => listeners.delete(notify);
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, current);
}
