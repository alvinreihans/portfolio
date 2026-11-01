import { useEffect } from 'react';

// Keeps a page out of search results while it is open (specs/05-deployment.md): the SPA answers
// unknown paths with 200, so the 404 page says "noindex" itself.
export function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.append(meta);
    return () => meta.remove();
  }, []);
}
