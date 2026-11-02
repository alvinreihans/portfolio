import { describe, expect, it } from 'vitest';

import { compareLocales, flatten } from './i18n-compare.mjs';

describe('flatten', () => {
  it('prefixes keys with the namespace and skips _review', () => {
    const flat = flatten('home', { _review: ['hero.title'], hero: { title: 'Halo' } });
    expect(flat).toEqual({ 'home:hero.title': 'Halo' });
  });
});

describe('compareLocales', () => {
  it('passes when both languages have the same keys and placeholders', () => {
    expect(compareLocales({ 'a:x': 'Sejak {{date}}' }, { 'a:x': 'Since {{date}}' })).toEqual([]);
  });

  it('reports keys that exist in one language only', () => {
    expect(compareLocales({ 'a:x': 'Halo' }, {})).toEqual(['a:x: missing in en']);
    expect(compareLocales({}, { 'a:x': 'Hello' })).toEqual(['a:x: missing in id']);
  });

  it('reports empty values and mismatched placeholders', () => {
    expect(compareLocales({ 'a:x': '' }, { 'a:x': 'Hello' })).toEqual(['a:x: empty in id']);
    expect(compareLocales({ 'a:x': '{{a}}' }, { 'a:x': '{{b}}' })).toEqual([
      'a:x: placeholders differ between id and en',
    ]);
  });

  it('allows the documented one-sided key', () => {
    expect(compareLocales({}, { 'project:noEnglish': 'Not in English yet.' })).toEqual([]);
  });
});
