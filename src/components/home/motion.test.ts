import { describe, expect, it, vi } from 'vitest';

// motion.ts reads matchMedia when it loads; the rules under test do not depend on it.
vi.stubGlobal('window', {
  matchMedia: () => ({ matches: false, addEventListener: () => {} }),
});

const { prefersStill } = await import('./motion.ts');

describe('prefersStill', () => {
  it('animates when nothing asks for stillness', () => {
    expect(prefersStill({ reducedMotion: false })).toBe(false);
    expect(
      prefersStill({
        reducedMotion: false,
        saveData: false,
        effectiveType: '4g',
        deviceMemory: 8,
        hardwareConcurrency: 8,
      }),
    ).toBe(false);
  });

  it('stays still for reduced motion', () => {
    expect(prefersStill({ reducedMotion: true })).toBe(true);
  });

  it('stays still when saving data or on a 2G connection', () => {
    expect(prefersStill({ reducedMotion: false, saveData: true })).toBe(true);
    expect(prefersStill({ reducedMotion: false, effectiveType: '2g' })).toBe(true);
    expect(prefersStill({ reducedMotion: false, effectiveType: 'slow-2g' })).toBe(true);
    expect(prefersStill({ reducedMotion: false, effectiveType: '3g' })).toBe(false);
  });

  it('stays still on devices with 2 GB of memory or 2 cores or fewer', () => {
    expect(prefersStill({ reducedMotion: false, deviceMemory: 2 })).toBe(true);
    expect(prefersStill({ reducedMotion: false, deviceMemory: 4 })).toBe(false);
    expect(prefersStill({ reducedMotion: false, hardwareConcurrency: 2 })).toBe(true);
    expect(prefersStill({ reducedMotion: false, hardwareConcurrency: 4 })).toBe(false);
  });
});
