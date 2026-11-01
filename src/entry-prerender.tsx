// Build-time render of one page in one language (specs/08-prerender.md). Built with
// `vite build --ssr` and run by scripts/prerender.mjs; never shipped to the browser.
import { createInstance } from 'i18next';
import { StrictMode } from 'react';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router';

import { StoryView } from './components/ProjectStory.tsx';
import { StoryMarkup } from './components/storyMarkup.ts';
import { loadStory, PROJECTS } from './content/projects.ts';
import { TitleSink } from './hooks/useDocumentTitle.ts';
import type { Language } from './i18n/detect.ts';
import { I18N_OPTIONS } from './i18n/resources.ts';
import { routes } from './routes.tsx';

/** Every prerendered page; 404 is rendered from a path no route matches. */
export const PAGES = ['/', '/cv', ...PROJECTS.map((project) => `/projects/${project.slug}`)];
export const NOT_FOUND_PATH = '/404';

const handler = createStaticHandler(routes);

export async function render(path: string, lang: Language) {
  const i18n = createInstance();
  await i18n.use(initReactI18next).init({ ...I18N_OPTIONS, lng: lang });

  const context = await handler.query(new Request(`https://alvinreihans.web.id${path}`));
  if (context instanceof Response) throw new Error(`prerender: ${path} answered with a redirect`);
  const router = createStaticRouter(handler.dataRoutes, context);

  // The story of a project page, as plain HTML (Q8.2); the browser shows it until the lazy
  // markdown renderer takes over.
  const slug = path.match(/^\/projects\/([^/]+)$/)?.[1];
  const story = slug && PROJECTS.some((p) => p.slug === slug) ? await loadStory(slug, lang) : null;
  // Rendered before the page: React cannot start a second render inside a running one.
  const storyHtml =
    slug && story
      ? renderToStaticMarkup(
          <I18nextProvider i18n={i18n}>
            <StoryView slug={slug} lang={lang} text={story.text} textLang={story.lang} />
          </I18nextProvider>,
        )
      : null;
  const storyMarkup = (storySlug: string, storyLang: Language) =>
    storySlug === slug && storyLang === lang ? storyHtml : null;

  let title = '';
  const html = renderToString(
    <StrictMode>
      <I18nextProvider i18n={i18n}>
        <TitleSink value={(value) => (title = value)}>
          <StoryMarkup value={storyMarkup}>
            {/* No hydration data: the routes have no loaders, and an inline script would need
              its own CSP hash. */}
            <StaticRouterProvider router={router} context={context} hydrate={false} />
          </StoryMarkup>
        </TitleSink>
      </I18nextProvider>
    </StrictMode>,
  );
  return { html, title };
}
