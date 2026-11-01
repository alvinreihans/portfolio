import '@fontsource/jersey-10/latin.css';
import '@fontsource-variable/manrope/wght.css';
import './styles/index.css';

// Prerendered pages already show their text (specs/08-prerender.md). The app (React, the
// router, the pages) is loaded after the browser has painted it once; loading it right away
// ran all of React first and kept the page blank until it had finished. The dev server sends
// an empty page, so there it loads at once.
const prerendered = document.getElementById('root')!.firstChild !== null;
const start = () => void import('./app.tsx');
if (prerendered) requestAnimationFrame(() => setTimeout(start));
else start();
