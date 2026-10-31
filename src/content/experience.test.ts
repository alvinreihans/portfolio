import { describe, expect, it } from 'vitest';

import {
  EXPERIENCE,
  formatMonth,
  layoutExperience,
  type Experience,
  type ExperienceEvent,
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

const describeRows = (data: Experience) =>
  layoutExperience(data).rows.map((row) =>
    row.kind === 'merge'
      ? `merge ${row.branch.id} @${row.lane}`
      : `${row.event.branch} ${row.event.date} @${row.lane}`,
  );

describe('layoutExperience', () => {
  it('sorts newest first and keeps the file order for equal dates', () => {
    const rows = describeRows({
      branches: [branch('a'), branch('b')],
      events: [event('2020-01', 'main'), event('2022-05', 'b'), event('2022-05', 'a')],
    });
    // `a` merges before `b` opens, so both reuse lane 1.
    expect(rows).toEqual([
      'merge b @1',
      'b 2022-05 @1',
      'merge a @1',
      'a 2022-05 @1',
      'main 2020-01 @0',
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
    ]);
  });

  it('gives overlapping branches separate lanes', () => {
    const layout = layoutExperience({
      branches: [branch('long'), branch('short')],
      events: [event('2024-01', 'long'), event('2023-06', 'short'), event('2023-01', 'long')],
    });
    const lanes = layout.rows.map(
      (row) => (row.kind === 'merge' ? row.branch.id : row.event.branch) + row.lane,
    );
    expect(lanes).toEqual(['long1', 'long1', 'short2', 'short2', 'long1']);
    expect(layout.laneCount).toBe(3);
  });

  it('does not merge an ongoing branch', () => {
    const rows = describeRows({
      branches: [branch('now', { ongoing: true })],
      events: [event('2024-01', 'now'), event('2023-01', 'main')],
    });
    expect(rows).toEqual(['now 2024-01 @1', 'main 2023-01 @0']);
  });

  it('lists the lanes with a line through each row', () => {
    const { rows } = layoutExperience({
      branches: [branch('a')],
      events: [
        event('2024-01', 'main'),
        event('2023-06', 'a'),
        event('2023-01', 'a'),
        event('2022-01', 'main'),
      ],
    });
    expect(rows.map((row) => row.lanes)).toEqual([[0], [0, 1], [0, 1], [0, 1], [0]]);
  });

  it('rejects an event on an unknown branch', () => {
    expect(() => layoutExperience({ branches: [], events: [event('2024-01', 'nope')] })).toThrow(
      'Unknown branch "nope"',
    );
  });

  it('lays out the real roadmap in at most three lanes with 14 events', () => {
    const layout = layoutExperience(EXPERIENCE);
    expect(layout.rows.filter((row) => row.kind === 'event')).toHaveLength(14);
    expect(layout.laneCount).toBe(3);
    const mainTypes = EXPERIENCE.events.filter((e) => e.branch === 'main').map((e) => e.type);
    expect(new Set(mainTypes)).toEqual(new Set(['education', 'work']));
    for (const e of EXPERIENCE.events.filter((e) => e.branch !== 'main'))
      expect(['internship', 'training', 'certification']).toContain(e.type);
  });

  it('keeps PT Intramedika Global Digital to org, role, and period (AC19)', () => {
    const job = EXPERIENCE.events.find((e) => e.org === 'PT Intramedika Global Digital');
    expect(job?.summary).toBeUndefined();
    expect(job?.current).toBe(true);
  });
});

describe('formatMonth', () => {
  it('formats in the active language', () => {
    expect(formatMonth('2026-02', 'id')).toBe('Februari 2026');
    expect(formatMonth('2026-02', 'en')).toBe('February 2026');
  });
});
