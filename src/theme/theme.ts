// Theme rules from specs/02-design-system.md ("Perilaku tema", Q2.5).
// Keep in sync with the inline script in index.html, which applies the same rules before paint.

export type Theme = 'day' | 'night';

export function isTheme(value: unknown): value is Theme {
  return value === 'day' || value === 'night';
}

export function systemTheme(prefersDark: boolean): Theme {
  return prefersDark ? 'night' : 'day';
}

/** Saved choice first, then the system preference, then Day. */
export function resolveTheme(saved: string | null, prefersDark: boolean | null): Theme {
  if (isTheme(saved)) return saved;
  if (prefersDark === null) return 'day';
  return systemTheme(prefersDark);
}

/**
 * Toggling flips the theme. Picking the theme that matches the system clears the
 * saved choice, so the site goes back to following the system (`save: null`).
 */
export function toggleTheme(current: Theme, system: Theme): { theme: Theme; save: Theme | null } {
  const theme: Theme = current === 'day' ? 'night' : 'day';
  return { theme, save: theme === system ? null : theme };
}
