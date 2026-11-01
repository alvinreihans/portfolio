// Experience roadmap data and lane layout (specs/04-pages.md, section 3, Q4.14 and Q4.16 to Q4.19).
import data from './experience.json';

export type Lang = 'id' | 'en';
type Localized = Record<Lang, string>;

/** `certification` is a commit's label only; certifications have no lane of their own (Q4.16). */
export type EventType = 'education' | 'work' | 'internship' | 'training' | 'certification';

export interface Branch {
  id: string;
  kind: 'education' | 'work' | 'internship' | 'training' | 'thesis';
  label: Localized;
  /** The branch it forks from and merges back into; `main` when left out. */
  parent?: string;
  ongoing?: boolean;
}

export interface ExperienceEvent {
  /** `YYYY-MM` */
  date: string;
  /** `YYYY-MM`; a single card that spans a period (Q4.14). */
  end?: string;
  /** `main` or a branch id. */
  branch: string;
  type: EventType;
  /** Still going on (the current job); the card ends in "Present" and gets the HEAD marker. */
  current?: boolean;
  org: string;
  title: Localized;
  summary?: Localized;
  /** Results: repositories and publications. */
  links?: ResultLink[];
  /** Certificates earned in this program; `highlight` ones are always shown. */
  certifications?: Certification[];
}

export interface ResultLink {
  kind: 'github' | 'orcid' | 'credential';
  href: string;
  label: string;
}

export interface Certification {
  /** Proper names, shown as issued (not translated). */
  title: string;
  issuer: string;
  /** `YYYY-MM` */
  date: string;
  highlight?: boolean;
  /** Credential page (Credly, Dicoding, Google Cloud Skills Boost, ...). */
  href?: string;
}

export interface Experience {
  branches: Branch[];
  events: ExperienceEvent[];
  /** Certificates that do not belong to a program. */
  otherCertifications?: Certification[];
}

export type Row =
  | { kind: 'event'; event: ExperienceEvent; lane: number; lanes: number[] }
  | { kind: 'merge'; branch: Branch; lane: number; lanes: number[] }
  | { kind: 'init'; lane: 0; lanes: number[] };

export interface Layout {
  /** Newest first, ending with the `init` commit on main. */
  rows: Row[];
  /** Lanes needed at the widest row, main included. */
  laneCount: number;
  /** For each branch, the lane it forks from and merges back into. */
  parentLane: Record<string, number>;
}

export const MAIN = 'main';

/**
 * Places every event in a lane. Lane 0 is main; a branch takes the smallest free lane from its
 * first event until it merges, and the lane is free again afterwards. `lanes` on each row lists
 * the lanes with a line through that row, for drawing the graph.
 */
export function layoutExperience({ branches, events }: Experience): Layout {
  const byId = new Map(branches.map((branch) => [branch.id, branch]));
  const depth = (id: string, seen = new Set<string>()): number => {
    if (id === MAIN) return 0;
    const branch = byId.get(id);
    if (!branch) throw new Error(`Unknown branch "${id}"`);
    if (seen.has(id)) throw new Error(`Branch "${id}" is its own ancestor`);
    seen.add(id);
    return 1 + depth(branch.parent ?? MAIN, seen);
  };

  type Pending = { kind: 'event'; event: ExperienceEvent } | { kind: 'merge'; branch: Branch };
  const items: { row: Pending; date: string; rank: number; order: number }[] = [];

  // A branch merges back when it ends: the latest `end` (or date) among its events.
  const ends = new Map<string, string>();
  events.forEach((event, order) => {
    const d = depth(event.branch);
    if (event.branch !== MAIN) {
      const end = event.end ?? event.date;
      if (end > (ends.get(event.branch) ?? '')) ends.set(event.branch, end);
    }
    items.push({ row: { kind: 'event', event }, date: event.date, rank: 2 * d, order });
  });
  branches.forEach((branch, order) => {
    const end = ends.get(branch.id);
    if (end && !branch.ongoing)
      items.push({
        row: { kind: 'merge', branch },
        date: end,
        rank: 2 * depth(branch.id) - 1,
        order,
      });
  });

  // Newest first. On the same date, shallower branches come first: a branch's merge, then its
  // events, then its child branches' merges and events. So the thesis merges into its parent
  // before graduating, and the parent merges into main after it. File order breaks ties.
  items.sort((a, b) => b.date.localeCompare(a.date) || a.rank - b.rank || a.order - b.order);
  const rows = items.map((item) => item.row);

  // Walk from the oldest row up, so branches open in the order they started.
  const laneOf = new Map<string, number>();
  const parentLane: Record<string, number> = {};
  const placed: Row[] = new Array(rows.length);
  let laneCount = 1;
  for (let i = rows.length - 1; i >= 0; i--) {
    const row = rows[i];
    if (row.kind === 'merge') {
      const lane = laneOf.get(row.branch.id) ?? 0;
      placed[i] = { ...row, lane, lanes: activeLanes(laneOf) };
      laneOf.delete(row.branch.id);
      continue;
    }
    const id = row.event.branch;
    if (id !== MAIN && !laneOf.has(id)) {
      const used = new Set(laneOf.values());
      let lane = 1;
      while (used.has(lane)) lane++;
      laneOf.set(id, lane);
      // A parent that is not open (yet, or any more) falls back to main.
      parentLane[id] = laneOf.get(byId.get(id)?.parent ?? MAIN) ?? 0;
    }
    placed[i] = { ...row, lane: laneOf.get(id) ?? 0, lanes: activeLanes(laneOf) };
    laneCount = Math.max(laneCount, laneOf.size + 1);
  }
  placed.push({ kind: 'init', lane: 0, lanes: [0] });
  return { rows: placed, laneCount, parentLane };
}

function activeLanes(laneOf: Map<string, number>): number[] {
  return [0, ...[...laneOf.values()].sort((a, b) => a - b)];
}

export const EXPERIENCE = data as Experience;

// One formatter per language: creating an Intl.DateTimeFormat is slow, and the roadmap formats
// dozens of dates on every render.
const monthFormats = new Map<Lang, Intl.DateTimeFormat>();

/** "Februari 2026" / "February 2026" (specs/03-i18n.md, "Format tanggal dan angka"). */
export function formatMonth(yearMonth: string, lang: Lang): string {
  const [year, month] = yearMonth.split('-').map(Number);
  let format = monthFormats.get(lang);
  if (!format) {
    format = new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric', timeZone: 'UTC' });
    monthFormats.set(lang, format);
  }
  return format.format(new Date(Date.UTC(year, month - 1, 1)));
}
