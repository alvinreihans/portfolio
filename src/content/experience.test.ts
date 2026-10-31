import { describe, expect, it } from 'vitest';

import {
  EXPERIENCE,
  formatMonth,
  layoutExperience,
  type Experience,
  type ExperienceEvent,
  type Row,
} from './experience.ts';

const event = (date: string, branch: string, extra: Partial<ExperienceEvent> = {}) =>
  ({
    date,
    branch,
    type: branch === 'main' ? 'education' : 'training',
    org: `${branch} ${date}`,
    title: { id: date, en: date },
    ...extra,
  }) as ExperienceEvent;

const branch = (id: string, extra = {}) => ({
  id,
  kind: 'training' as const,
  label: { id, en: id },
  ...extra,
});

const name = (row: Row) =>
  row.kind === 'init'
    ? 'init'
    : row.kind === 'merge'
      ? `merge ${row.branch.id}`
      : `${row.event.branch} ${row.event.date}`;

const describeRows = (data: Experience) =>
  layoutExperience(data).rows.map((row) => `${name(row)} @${row.lane}`);

describe('layoutExperience', () => {
  it('sorts newest first, keeps the file order for equal dates, and ends with init', () => {
    const rows = describeRows({
      branches: [branch('a'), branch('b')],
      events: [event('2020-01', 'main'), event('2022-05', 'b'), event('2022-05', 'a')],
    });
    // Both branches run through the same month, so they need two lanes; `a` sits lower and
    // opens first.
    expect(rows).toEqual([
      'merge a @1',
      'merge b @2',
      'b 2022-05 @2',
      'a 2022-05 @1',
      'main 2020-01 @0',
      'init @0',
    ]);
  });

  it('opens a branch at its first event, merges it above its last, and reuses the lane', () => {
    const rows = describeRows({
      branches: [branch('old'), branch('new')],
      events: [
        event('2024-01', 'new'),
        event('2023-06', 'main'),
        event('2023-01', 'old'),
        event('2022-01', 'old'),
      ],
    });
    expect(rows).toEqual([
      'merge new @1',
      'new 2024-01 @1',
      'main 2023-06 @0',
      'merge old @1',
      'old 2023-01 @1',
      'old 2022-01 @1',
      'init @0',
    ]);
  });

  it('merges a single-card branch at its end date, past newer events on main', () => {
    const layout = layoutExperience({
      branches: [branch('academy')],
      events: [
        event('2026-02', 'main'),
        event('2025-10', 'main'),
        event('2025-05', 'main'),
        event('2025-04', 'academy', { end: '2025-12' }),
      ],
    });
    const rows = layout.rows.map((row) =>
      row.kind === 'event' ? `${row.event.date} lanes ${row.lanes.join(',')}` : row.kind,
    );
    expect(rows).toEqual([
      '2026-02 lanes 0',
      'merge',
      '2025-10 lanes 0,1',
      '2025-05 lanes 0,1',
      '2025-04 lanes 0,1',
      'init',
    ]);
    expect(layout.laneCount).toBe(2);
  });

  it('gives overlapping branches separate lanes', () => {
    const layout = layoutExperience({
      branches: [branch('long'), branch('short')],
      events: [event('2024-01', 'long'), event('2023-06', 'short'), event('2023-01', 'long')],
    });
    expect(layout.rows.map((row) => `${name(row)} @${row.lane}`)).toEqual([
      'merge long @1',
      'long 2024-01 @1',
      'merge short @2',
      'short 2023-06 @2',
      'long 2023-01 @1',
      'init @0',
    ]);
    expect(layout.laneCount).toBe(3);
  });

  it('forks a child branch from its parent and merges it back before the parent moves on', () => {
    const layout = layoutExperience({
      branches: [branch('uni'), branch('thesis', { parent: 'uni' })],
      events: [
        event('2025-10', 'uni'),
        event('2025-05', 'thesis', { end: '2025-10' }),
        event('2021-08', 'uni'),
      ],
    });
    expect(layout.rows.map((row) => `${name(row)} @${row.lane}`)).toEqual([
      'merge uni @1',
      'uni 2025-10 @1',
      'merge thesis @2',
      'thesis 2025-05 @2',
      'uni 2021-08 @1',
      'init @0',
    ]);
    expect(layout.parentLane).toEqual({ uni: 0, thesis: 1 });
  });

  it('does not merge an ongoing branch', () => {
    const rows = describeRows({
      branches: [branch('now', { ongoing: true })],
      events: [event('2024-01', 'now'), event('2023-01', 'main')],
    });
    expect(rows).toEqual(['now 2024-01 @1', 'main 2023-01 @0', 'init @0']);
  });

  it('rejects an event on an unknown branch', () => {
    expect(() => layoutExperience({ branches: [], events: [event('2024-01', 'nope')] })).toThrow(
      'Unknown branch "nope"',
    );
  });
});

describe('the real roadmap', () => {
  const layout = layoutExperience(EXPERIENCE);

  it('has nine events, an init commit on main, and four lanes at most', () => {
    expect(layout.rows.filter((row) => row.kind === 'event')).toHaveLength(9);
    expect(layout.rows.at(-1)?.kind).toBe('init');
    expect(layout.laneCount).toBe(4);
    // Education and work have branches of their own (Q4.19); main holds only init and merges.
    expect(EXPERIENCE.events.filter((e) => e.branch === 'main')).toHaveLength(0);
  });

  it('forks Bangkit, MBKM, and the thesis from the education branch', () => {
    const uni = layout.rows.find((row) => row.kind === 'event' && row.event.branch === 'kuliah');
    for (const id of ['bangkit', 'mbkm', 'thesis']) expect(layout.parentLane[id]).toBe(uni?.lane);
    for (const id of ['kuliah', 'aws-backend', 'harisenin', 'intramedika'])
      expect(layout.parentLane[id]).toBe(0);
  });

  it('keeps the current job open: no merge for work', () => {
    expect(layout.rows.some((row) => name(row) === 'merge intramedika')).toBe(false);
  });

  it('keeps all 43 certificates and three highlights per program', () => {
    const programs = EXPERIENCE.events.filter((e) => e.certifications?.length);
    // A certificate can also be a commit of its own, like Google ACE on the Bangkit branch.
    const commits = EXPERIENCE.events.filter((e) => e.type === 'certification').length;
    const total =
      programs.reduce((sum, e) => sum + (e.certifications?.length ?? 0), 0) +
      commits +
      (EXPERIENCE.otherCertifications?.length ?? 0);
    expect(total).toBe(43);
    for (const e of programs)
      expect(e.certifications?.filter((cert) => cert.highlight)).toHaveLength(3);
  });

  it('keeps PT Intramedika Global Digital to org, role, and period (AC19)', () => {
    const job = EXPERIENCE.events.find((e) => e.org === 'PT Intramedika Global Digital');
    expect(job?.summary).toBeUndefined();
    expect(job?.links).toBeUndefined();
    expect(job?.current).toBe(true);
  });

  it('starts Bangkit with the program, then the Google ACE commit, then merges (Q4.17)', () => {
    const bangkit = layout.rows.flatMap((row) =>
      row.kind === 'merge' && row.branch.id === 'bangkit'
        ? ['merge']
        : row.kind === 'event' && row.event.branch === 'bangkit'
          ? [row.event.type]
          : [],
    );
    expect(bangkit).toEqual(['merge', 'certification', 'training']);
    const ace = EXPERIENCE.events.find((e) => e.type === 'certification');
    expect(ace?.links?.[0].href).toBe(
      'https://www.credly.com/badges/c4cab7ce-a105-497e-a3e3-64cfe42a4f55',
    );
  });

  it('merges the thesis before graduating, and education into main after it (Q4.18)', () => {
    const rows = layout.rows.map(name);
    const from = rows.indexOf('merge aws-backend');
    expect(rows.slice(from, from + 7)).toEqual([
      'merge aws-backend',
      'merge kuliah',
      'kuliah 2025-10',
      'merge thesis',
      'thesis 2025-05',
      'aws-backend 2025-04',
      'merge mbkm',
    ]);
  });
});

describe('formatMonth', () => {
  it('formats in the active language', () => {
    expect(formatMonth('2026-02', 'id')).toBe('Februari 2026');
    expect(formatMonth('2026-02', 'en')).toBe('February 2026');
  });
});
