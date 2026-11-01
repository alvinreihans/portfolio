import { useEffect, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { loadStory, storyImage, type ProjectLang } from '../content/projects.ts';
import { FlowDiagram } from './FlowDiagram.tsx';

/** Phone and tablet screenshots are at most this wide; desktop ones are 1600px. */
const NARROW_MAX = 800;

interface ProjectStoryProps {
  slug: string;
  lang: ProjectLang;
}

// A project's story in markdown (specs/06-project-stories.md). Loaded lazily with
// react-markdown, which never renders raw HTML. `flow` code blocks become diagrams and
// relative images point at the bundled files.
export default function ProjectStory({ slug, lang }: ProjectStoryProps) {
  const { t } = useTranslation('project');
  const [story, setStory] = useState<{ key: string; text: string; lang: ProjectLang } | null>(null);
  const key = `${slug}/${lang}`;

  useEffect(() => {
    let active = true;
    loadStory(slug, lang).then((loaded) => {
      if (active) setStory({ key, ...loaded });
      // Fetch the other language too, so a switch swaps the text while it is faded out.
      void loadStory(slug, lang === 'id' ? 'en' : 'id');
    });
    return () => {
      active = false;
    };
  }, [slug, lang, key]);

  // Only the first load shows the loading text; after a language switch the previous story
  // stays until the new one arrives, so the page does not collapse (specs/03-i18n.md, Q3.8).
  if (!story) return <p className="mt-8 min-h-dvh text-muted">{t('loading')}</p>;

  const external = t('common:externalLink');
  const components: Components = {
    // A `flow` block arrives as <pre><code class="language-flow">; drop the <pre> around it.
    pre: ({ children }) => {
      const child = children as ReactElement<{ className?: string }>;
      if (child?.props?.className?.includes('language-flow')) return <>{children}</>;
      return <pre>{children}</pre>;
    },
    code: ({ className, children }) =>
      className?.includes('language-flow') ? (
        <FlowDiagram source={String(children).trimEnd()} />
      ) : (
        <code className={className}>{children}</code>
      ),
    img: ({ src, alt }) => {
      const image = typeof src === 'string' ? storyImage(slug, src) : undefined;
      const narrow = image?.width !== undefined && image.width <= NARROW_MAX;
      return (
        <img
          src={image?.url ?? (typeof src === 'string' ? src : undefined)}
          alt={alt ?? ''}
          width={image?.width}
          height={image?.height}
          loading="lazy"
          decoding="async"
          // Phone and tablet screenshots stay narrow instead of filling a whole screen.
          className={narrow ? 'narrow' : undefined}
        />
      );
    },
    a: ({ href, children }) =>
      href?.startsWith('http') ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
          <span className="sr-only"> {external}</span>
        </a>
      ) : (
        <a href={href}>{children}</a>
      ),
  };

  return (
    <>
      {story.lang !== lang && (
        <p className="mt-8 rounded-lg bg-chip px-4 py-3 text-sm text-muted">{t('noEnglish')}</p>
      )}
      <div className="story mt-8 max-w-[70ch]" lang={story.lang}>
        <Markdown remarkPlugins={[remarkGfm]} components={components}>
          {story.text}
        </Markdown>
      </div>
    </>
  );
}
