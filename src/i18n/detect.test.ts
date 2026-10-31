import { describe, expect, it } from 'vitest';

import { detectLanguage } from './detect.ts';

describe('detectLanguage', () => {
  it('prefers the saved choice', () => {
    expect(detectLanguage('en', ['id-ID'])).toBe('en');
    expect(detectLanguage('id', ['en-US'])).toBe('id');
  });

  it('ignores a saved value that is not a supported language', () => {
    expect(detectLanguage('fr', ['id-ID'])).toBe('id');
  });

  it('uses the first browser language that is Indonesian or English', () => {
    expect(detectLanguage(null, ['id-ID', 'en-US'])).toBe('id');
    expect(detectLanguage(null, ['en-GB', 'id'])).toBe('en');
    expect(detectLanguage(null, ['fr-FR', 'id-ID'])).toBe('id');
  });

  it('treats the legacy code `in` as Indonesian', () => {
    expect(detectLanguage(null, ['in-ID'])).toBe('id');
  });

  it('falls back to English for any other language', () => {
    expect(detectLanguage(null, ['zh-CN', 'ja-JP'])).toBe('en');
    expect(detectLanguage(null, [])).toBe('en');
  });
});
