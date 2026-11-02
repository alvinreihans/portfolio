import { useSyncExternalStore } from 'react';

import { isTheme, systemTheme, toggleTheme, type Theme } from './theme.ts';

const KEY = 'theme';
// Absent while pages are prerendered in Node (specs/08-prerender.md); the colours come from
// data-theme, which the script in index.html sets before the first paint either way.
const browser = typeof window !== 'undefined';
const root = browser ? document.documentElement : null;
const darkQuery = browser ? window.matchMedia('(prefers-color-scheme: dark)') : null;
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
  if (root) root.dataset.theme = theme;
  listeners.forEach((notify) => notify());
}

// The inline script in index.html already set data-theme before paint.
function current(): Theme {
  return isTheme(root?.dataset.theme) ? root.dataset.theme : 'day';
}

darkQuery?.addEventListener('change', (event) => {
  if (!isTheme(readSaved())) apply(systemTheme(event.matches));
});

export function toggle() {
  const next = toggleTheme(current(), systemTheme(darkQuery?.matches ?? false));
  writeSaved(next.save);
  apply(next.theme);
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => listeners.delete(notify);
}

export function useTheme(): Theme {
  // Prerendered HTML is Day; React adopts it as Day, then switches to the real theme.
  return useSyncExternalStore(subscribe, current, () => 'day');
}
