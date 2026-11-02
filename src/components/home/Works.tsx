import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { PROJECTS, type ProjectLang, type ProjectMeta } from '../../content/projects.ts';
// Works (specs/04-pages.md, section 4 and Q4.30; specs/06-project-stories.md): every project
// as the same card, Money Tracker first. Everything comes from meta.json.
export function Works() {
  const { t, i18n } = useTranslation('home');
  const lang: ProjectLang = i18n.resolvedLanguage === 'en' ? 'en' : 'id';

  return (
    <section id="works" aria-labelledby="works-title" className="mt-24">
      <h2 id="works-title" className="font-display text-5xl leading-none">
        {t('works.heading')}
      </h2>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {PROJECTS.map((project) => (
          <li
            key={project.slug}
            className="theme-fade relative flex flex-col rounded-xl border border-line bg-card p-5 shadow-card transition-colors focus-within:bg-card-band hover:bg-card-band"
          >
            <h3 className="text-xl font-bold">
              {/* One main link per card; its area covers the whole card. */}
              <Link
                to={`/projects/${project.slug}`}
                className="after:absolute after:inset-0 after:rounded-xl hover:text-accent-text"
              >
                {project.title[lang]}
              </Link>
            </h3>
            <p className="mt-2 text-[0.95rem] text-muted">{project.summary[lang]}</p>
            <Tags tags={project.tags} />
            <ProjectLinks project={project} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <li key={tag} className="rounded-md bg-chip px-2 py-0.5 text-xs text-muted">
          {tag}
        </li>
      ))}
    </ul>
  );
}

/** Repo, demo, and publication links, above the card's main link (no link inside a link). */
export function ProjectLinks({ project }: { project: ProjectMeta }) {
  const { t, i18n } = useTranslation('project');
  // Several cards have a "View repo" link; the project name tells them apart for screen readers.
  const title = project.title[i18n.resolvedLanguage === 'en' ? 'en' : 'id'];
  const external = t('common:externalLink');
  const links = [
    ['demo', project.links.demo, t('viewDemo')],
    ['repo', project.links.repo, t('viewRepo')],
    ['article', project.links.article, t('viewArticle')],
  ].filter((entry): entry is [string, string, string] => Boolean(entry[1]));
  const className =
    'relative z-10 inline-flex min-h-11 items-center gap-1 font-semibold text-accent-text underline decoration-2 underline-offset-4';

  return (
    <div className="mt-auto flex flex-wrap gap-x-5 pt-3">
      {links.map(([key, href, label]) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${label}: ${title} ${external}`}
          className={className}
        >
          {label} <span aria-hidden="true">↗</span>
        </a>
      ))}
    </div>
  );
}
