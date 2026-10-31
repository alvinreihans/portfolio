import { describe, expect, it } from 'vitest';

import { resolveTheme, toggleTheme } from './theme.ts';

describe('resolveTheme', () => {
  it('prefers the saved choice over the system', () => {
    expect(resolveTheme('night', false)).toBe('night');
    expect(resolveTheme('day', true)).toBe('day');
  });

  it('follows the system when nothing valid is saved', () => {
    expect(resolveTheme(null, true)).toBe('night');
    expect(resolveTheme(null, false)).toBe('day');
    expect(resolveTheme('dark', true)).toBe('night');
  });

  it('falls back to Day when the system preference is unknown', () => {
    expect(resolveTheme(null, null)).toBe('day');
  });
});

describe('toggleTheme', () => {
  it('saves a choice that differs from the system', () => {
    expect(toggleTheme('day', 'day')).toEqual({ theme: 'night', save: 'night' });
    expect(toggleTheme('night', 'night')).toEqual({ theme: 'day', save: 'day' });
  });

  it('clears the saved choice when the new theme matches the system', () => {
    expect(toggleTheme('night', 'day')).toEqual({ theme: 'day', save: null });
    expect(toggleTheme('day', 'night')).toEqual({ theme: 'night', save: null });
  });
});
