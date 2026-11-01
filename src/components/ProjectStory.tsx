import { useEffect, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { loadStory, storyImage, type ProjectLang } from '../content/projects.ts';
import { FlowDiagram } from './FlowDiagram.tsx';
import { PrerenderedStory } from './PrerenderedStory.tsx';

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

  // Only the first load shows the loading text (or the prerendered story, which looks the same
  // as this one); after a language switch the previous story stays until the new one arrives,
  // so the page does not collapse (specs/03-i18n.md, Q3.8).
  if (!story)
    return (
      <PrerenderedStory
        slug={slug}
        lang={lang}
        fallback={<p className="mt-8 min-h-dvh text-muted">{t('loading')}</p>}
      />
    );

  return <StoryView slug={slug} lang={lang} text={story.text} textLang={story.lang} />;
}

/** The rendered story; also used to prerender it (specs/08-prerender.md, Q8.2). */
export function StoryView({
  slug,
  lang,
  text,
  textLang,
}: {
  slug: string;
  lang: ProjectLang;
  text: string;
  /** The language of `text`; differs from `lang` when the English story is missing. */
  textLang: ProjectLang;
}) {
  const { t } = useTranslation('project');
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
      {textLang !== lang && (
        <p className="mt-8 rounded-lg bg-chip px-4 py-3 text-sm text-muted">{t('noEnglish')}</p>
      )}
      <div className="story mt-8 max-w-[70ch]" lang={textLang}>
        <Markdown remarkPlugins={[remarkGfm]} components={components}>
          {text}
        </Markdown>
      </div>
    </>
  );
}
