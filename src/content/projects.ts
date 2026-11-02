// Projects from src/content/projects/<slug>/ (specs/06-project-stories.md). Adding a folder
// adds a project: the metadata is bundled, the stories load only when a project page opens.

export type ProjectLang = 'id' | 'en';
type Localized = Record<ProjectLang, string>;

export interface ProjectMeta {
  slug: string;
  order: number;
  tags: string[];
  links: { repo?: string; demo?: string; article?: string };
  title: Localized;
  summary: Localized;
}

const metas = import.meta.glob<ProjectMeta>('./projects/*/meta.json', {
  eager: true,
  import: 'default',
});
const stories = import.meta.glob<string>('./projects/*/*.md', {
  query: '?raw',
  import: 'default',
});
const images = import.meta.glob<string>('./projects/*/images/*', {
  eager: true,
  query: '?url',
  import: 'default',
});

export const PROJECTS: ProjectMeta[] = Object.values(metas).sort((a, b) => a.order - b.order);

export function projectBySlug(slug: string): ProjectMeta | undefined {
  return PROJECTS.find((project) => project.slug === slug);
}

/** The project after this one in `order`; the last one wraps around to the first. */
export function nextProject(slug: string): ProjectMeta {
  const index = PROJECTS.findIndex((project) => project.slug === slug);
  return PROJECTS[(index + 1) % PROJECTS.length];
}

/**
 * The story in the requested language, or the Indonesian one (the source language) when that
 * file does not exist yet. `lang` says which one was loaded.
 */
export async function loadStory(
  slug: string,
  lang: ProjectLang,
): Promise<{ text: string; lang: ProjectLang }> {
  const wanted = stories[`./projects/${slug}/${lang}.md`];
  if (wanted) return { text: await wanted(), lang };
  const fallback = stories[`./projects/${slug}/id.md`];
  if (!fallback) throw new Error(`Project "${slug}" has no id.md`);
  return { text: await fallback(), lang: 'id' };
}

export interface StoryImage {
  url: string;
  /** From the `-<width>x<height>` file name suffix, so the page can reserve the space. */
  width?: number;
  height?: number;
}

const SIZE = /-(\d+)x(\d+)\.\w+$/;

/** Maps a relative image path in a story (`./images/x-1600x1000.avif`) to its bundled file. */
export function storyImage(slug: string, src: string): StoryImage | undefined {
  if (!src.startsWith('./images/')) return undefined;
  const url = images[`./projects/${slug}/${src.slice(2)}`];
  if (!url) return undefined;
  const size = src.match(SIZE);
  return size ? { url, width: Number(size[1]), height: Number(size[2]) } : { url };
}
