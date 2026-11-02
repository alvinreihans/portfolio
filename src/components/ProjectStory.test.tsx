import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { StoryView } from './ProjectStory.tsx';

const render = (text: string) =>
  renderToStaticMarkup(<StoryView slug="money-tracker" lang="id" text={text} textLang="id" />);

describe('StoryView', () => {
  it('does not render raw HTML from the markdown (specs/06-project-stories.md, AC6)', () => {
    const html = render(
      'Halo <script>alert(1)</script> <b>tebal</b>\n\n<img src=x onerror=alert(1)>',
    );
    // Shown as escaped text at most, never as elements.
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<b>');
    expect(html).not.toMatch(/<img[^>]*onerror/);
  });

  it('renders a story without any heading as plain paragraphs (AC10)', () => {
    const html = render('Paragraf pertama.\n\nParagraf kedua.');
    expect(html).toContain('<p>Paragraf pertama.</p>');
    expect(html).toContain('<p>Paragraf kedua.</p>');
    expect(html).not.toMatch(/<h\d/);
  });

  it('loads only the first image at once (AC4)', () => {
    const html = render(
      '![Satu](./images/beranda-desktop-1600x1000.avif)\n\n![Dua](./images/catat-mobile-780x1688.avif)',
    );
    const loading = [...html.matchAll(/loading="(\w+)"/g)].map((m) => m[1]);
    expect(loading).toEqual(['eager', 'lazy']);
    expect(html).toContain('width="1600"');
  });
});
