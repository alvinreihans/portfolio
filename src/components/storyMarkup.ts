import { createContext } from 'react';

import type { ProjectLang } from '../content/projects.ts';

/** Set while a page is prerendered: the story as HTML (specs/08-prerender.md, Q8.2). */
export const StoryMarkup = createContext<
  ((slug: string, lang: ProjectLang) => string | null) | null
>(null);
