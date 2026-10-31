// Experience roadmap data and lane layout (specs/04-pages.md, section 3 and Q4.14).
import data from './experience.json';

export type Lang = 'id' | 'en';
type Localized = Record<Lang, string>;

export type EventType = 'education' | 'work' | 'internship' | 'training' | 'certification';

export interface Branch {
  id: string;
  kind: 'internship' | 'training' | 'certification';
  label: Localized;
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
}

export interface Experience {
  branches: Branch[];
  events: ExperienceEvent[];
}

export type Row =
  | { kind: 'event'; event: ExperienceEvent; lane: number; lanes: number[] }
  | { kind: 'merge'; branch: Branch; lane: number; lanes: number[] };

export interface Layout {
  /** Newest first. Merge rows sit right above a branch's newest event. */
  rows: Row[];
  /** Lanes needed at the widest row, main included. */
  laneCount: number;
}

export const MAIN = 'main';

/**
 * Places every event in a lane. Lane 0 is main; a branch takes the smallest free lane right
 * of main from its first event until it merges, and the lane is free again afterwards.
 * `lanes` on each row lists the lanes with a line through that row, for drawing the graph.
 */
export function layoutExperience({ branches, events }: Experience): Layout {
  const byId = new Map(branches.map((branch) => [branch.id, branch]));
  // Newest first; Array.prototype.sort is stable, so equal dates keep the file's order.
  const sorted = [...events].sort((a, b) => b.date.localeCompare(a.date));

  const rows: ({ kind: 'event'; event: ExperienceEvent } | { kind: 'merge'; branch: Branch })[] =
    [];
  const seen = new Set<string>();
  for (const event of sorted) {
    const branch = byId.get(event.branch);
    if (event.branch !== MAIN && !branch) throw new Error(`Unknown branch "${event.branch}"`);
    // The first time a branch shows up (its newest event), it merges right above it.
    if (branch && !seen.has(branch.id) && !branch.ongoing) rows.push({ kind: 'merge', branch });
    seen.add(event.branch);
    rows.push({ kind: 'event', event });
  }

  // Walk from the oldest row up, so branches open in the order they started.
  const laneOf = new Map<string, number>();
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
    }
    placed[i] = { ...row, lane: laneOf.get(id) ?? 0, lanes: activeLanes(laneOf) };
    laneCount = Math.max(laneCount, laneOf.size + 1);
  }
  return { rows: placed, laneCount };
}

function activeLanes(laneOf: Map<string, number>): number[] {
  return [0, ...[...laneOf.values()].sort((a, b) => a - b)];
}

export const EXPERIENCE = data as Experience;

/** "Februari 2026" / "February 2026" (specs/03-i18n.md, "Format tanggal dan angka"). */
export function formatMonth(yearMonth: string, lang: Lang): string {
  const [year, month] = yearMonth.split('-').map(Number);
  return new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  );
}
