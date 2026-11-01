import { lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';

import { ClientLazy } from '../components/ClientLazy.tsx';
import { ProjectLinks } from '../components/home/Works.tsx';
import { PrerenderedStory } from '../components/PrerenderedStory.tsx';
import { nextProject, projectBySlug, type ProjectLang } from '../content/projects.ts';
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts';
import { NotFoundPage } from './NotFoundPage.tsx';

// The markdown renderer loads only when a project page opens.
const ProjectStory = lazy(() => import('../components/ProjectStory.tsx'));

// /projects/:slug (specs/04-pages.md, "Detail project"; specs/06-project-stories.md): a fact
// box from meta.json, the story, and a link to the next project. Unknown slugs show the 404.
export function ProjectPage() {
  const { slug = '' } = useParams();
  const project = projectBySlug(slug);
  return project ? <ProjectDetail slug={project.slug} /> : <NotFoundPage />;
}

function ProjectDetail({ slug }: { slug: string }) {
  const { t, i18n } = useTranslation('project');
  const lang: ProjectLang = i18n.resolvedLanguage === 'en' ? 'en' : 'id';
  const project = projectBySlug(slug)!;
  const next = nextProject(slug);
  useDocumentTitle(t('common:title.page', { page: project.title[lang] }));

  return (
    <>
      <Link
        to="/#works"
        className="flex min-h-11 w-fit items-center font-semibold text-accent-text"
      >
        ← {t('back')}
      </Link>

      {/* Fact box: the quick version for readers in a hurry (Q6.1). */}
      <section className="theme-fade mt-4 rounded-2xl border border-line bg-card p-6 shadow-card sm:p-8">
        <h1 className="font-display text-[clamp(2.75rem,7vw,4rem)] leading-[0.95]">
          {project.title[lang]}
        </h1>
        <p className="mt-3 max-w-[65ch] text-lg text-muted">{project.summary[lang]}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <li key={tag} className="rounded-md bg-chip px-2 py-0.5 text-xs text-muted">
              {tag}
            </li>
          ))}
        </ul>
        <ProjectLinks project={project} />
      </section>

      {/* The loading line reserves a screen so the scene below does not jump when the story
          arrives (specs/06-project-stories.md, AC4). */}
      <ClientLazy
        fallback={
          <PrerenderedStory
            slug={slug}
            lang={lang}
            fallback={<p className="mt-8 min-h-dvh text-muted">{t('loading')}</p>}
          />
        }
      >
        <ProjectStory slug={slug} lang={lang} />
      </ClientLazy>

      <nav aria-label={t('next')} className="mt-12">
        <Link
          to={`/projects/${next.slug}`}
          className="theme-fade group flex flex-col rounded-xl border border-line bg-card p-5 shadow-card hover:bg-card-band sm:w-fit sm:min-w-80"
        >
          <span className="text-xs font-bold tracking-[0.06em] text-muted uppercase">
            {t('next')}
          </span>
          <span className="mt-1 text-xl font-bold group-hover:text-accent-text">
            {next.title[lang]} <span aria-hidden="true">→</span>
          </span>
        </Link>
      </nav>
    </>
  );
}
