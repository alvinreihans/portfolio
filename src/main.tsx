import '@fontsource/jersey-10/latin.css';
import '@fontsource-variable/manrope/wght.css';
import './styles/index.css';
// Must run before the first render so the initial language is already set.
import './i18n/index.ts';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

import { RootLayout } from './layouts/RootLayout.tsx';
import { CvPage } from './pages/CvPage.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';
import { ProjectPage } from './pages/ProjectPage.tsx';

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'cv', element: <CvPage /> },
      { path: 'projects/:slug', element: <ProjectPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
