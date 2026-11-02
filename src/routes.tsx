import type { RouteObject } from 'react-router';

import { RootLayout } from './layouts/RootLayout.tsx';
import { CvPage } from './pages/CvPage.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';
import { ProjectPage } from './pages/ProjectPage.tsx';

// Shared by the browser (main.tsx) and the prerender (entry-prerender.tsx).
export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'cv', element: <CvPage /> },
      { path: 'projects/:slug', element: <ProjectPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
