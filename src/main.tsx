import '@fontsource/jersey-10/latin.css';
import '@fontsource-variable/manrope/wght.css';
import './styles/index.css';
// Must run before the first render so the initial language is already set.
import './i18n/index.ts';

import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

import { routes } from './routes.tsx';

const router = createBrowserRouter(routes);
const app = (
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

// Built pages arrive prerendered (specs/08-prerender.md): React takes over that HTML. The dev
// server sends an empty root, so it renders from scratch.
const root = document.getElementById('root')!;
if (root.firstChild) hydrateRoot(root, app);
else createRoot(root).render(app);
