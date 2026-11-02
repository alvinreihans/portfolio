import { useContext, useState, type ReactNode } from 'react';

import type { ProjectLang } from '../content/projects.ts';
import { StoryMarkup } from './storyMarkup.ts';

// Read once from the prerendered page, so the HTML survives React swapping the element.
const captured = new Map<string, string | null>();

function fromPage(slug: string, lang: ProjectLang): string | null {
  const key = `${slug}/${lang}`;
  if (!captured.has(key)) {
    const element = document.querySelector(
      `[data-story-slug="${slug}"][data-story-lang="${lang}"]`,
    );
    captured.set(key, element ? element.innerHTML : null);
  }
  return captured.get(key) ?? null;
}

/**
 * The story as plain HTML from the prerendered page, shown until the markdown renderer has
 * loaded (it stays lazy, so it adds no JavaScript to the first load). The prerender writes the
 * HTML; in the browser it is read back from the page, so both renders match. Pages reached
 * without a prerendered story (navigating inside the site) get the fallback.
 */
export function PrerenderedStory({
  slug,
  lang,
  fallback,
}: {
  slug: string;
  lang: ProjectLang;
  fallback: ReactNode;
}) {
  const render = useContext(StoryMarkup);
  const [html] = useState(() => (render ? render(slug, lang) : fromPage(slug, lang)));
  if (html === null) return fallback;
  return (
    <div
      className="contents"
      data-story-slug={slug}
      data-story-lang={lang}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
