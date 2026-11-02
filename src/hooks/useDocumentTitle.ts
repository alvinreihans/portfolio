import { createContext, useContext, useEffect } from 'react';

/** Set while a page is prerendered, so its HTML gets the page's own title. */
export const TitleSink = createContext<((title: string) => void) | null>(null);

export function useDocumentTitle(title: string) {
  // Prerendering only (specs/08-prerender.md): effects do not run there.
  useContext(TitleSink)?.(title);

  useEffect(() => {
    document.title = title;
  }, [title]);
}
