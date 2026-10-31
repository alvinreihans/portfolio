import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import {
  EXPERIENCE,
  formatMonth,
  layoutExperience,
  MAIN,
  type Branch,
  type Certification,
  type ExperienceEvent,
  type Lang,
  type ResultLink,
  type Row,
} from '../../content/experience.ts';
import { SOCIAL_LINKS } from '../../content/links.ts';
import { SOCIAL_ICON_PATHS } from '../socialIcons.ts';

const LAYOUT = layoutExperience(EXPERIENCE);
const BRANCHES = new Map(EXPERIENCE.branches.map((branch) => [branch.id, branch]));
const LINKEDIN = SOCIAL_LINKS.find((link) => link.icon === 'linkedin')?.href;
// Every certificate: those listed in program cards, those that are commits of their own (like
// Google ACE), and the other certificates.
const CERTIFICATE_COUNT =
  EXPERIENCE.events.reduce(
    (sum, event) =>
      sum + (event.certifications?.length ?? 0) + (event.type === 'certification' ? 1 : 0),
    0,
  ) + (EXPERIENCE.otherCertifications?.length ?? 0);

/** Extra space above a card for the merge node right above it. */
const MERGE_SPACE = 32;
/** Node centre measured from the top of a card, level with the type label. */
const NODE_OFFSET = 30;

type Kind = 'main' | Branch['kind'];

// Line and node styles per kind; the text labels stay the main way to tell them apart.
// Certifications have no line of their own (Q4.16); they sit inside their program's card.
// `accent` lines are main and the current work; everything else stays neutral.
const LINE: Record<Kind, { width: number; dash?: string; node: number; accent?: boolean }> = {
  main: { width: 4, node: 16, accent: true },
  work: { width: 3, node: 14, accent: true },
  education: { width: 3, node: 14 },
  internship: { width: 3, dash: '3 4', node: 12 },
  training: { width: 3, dash: '8 5', node: 12 },
  thesis: { width: 3, dash: '10 4 3 4', node: 12 },
};

/** Vertical space for the `init` commit under the last card. */
const INIT_SPACE = 44;
/** How far main and open branches (the current job) reach above the newest row, to a tip node. */
const TIP_SPACE = 24;

function rowBranch(row: Row): string {
  if (row.kind === 'init') return MAIN;
  return row.kind === 'merge' ? row.branch.id : row.event.branch;
}

function depthOf(branch: Branch): number {
  const parent = branch.parent ? BRANCHES.get(branch.parent) : undefined;
  return parent ? 1 + depthOf(parent) : 1;
}

// Parents first, so a child's line is drawn on top where they meet.
const BRANCHES_BY_DEPTH = [...EXPERIENCE.branches].sort((a, b) => depthOf(a) - depthOf(b));

function kindOf(branchId: string): Kind {
  return branchId === MAIN ? 'main' : (BRANCHES.get(branchId)?.kind ?? 'training');
}

// The oldest event of each branch carries the branch label chip (specs/04-pages.md).
const FIRST_OF_BRANCH = new Set<number>();
{
  const seen = new Set<string>();
  for (let i = LAYOUT.rows.length - 1; i >= 0; i--) {
    const row = LAYOUT.rows[i];
    if (row.kind === 'event' && row.event.branch !== MAIN && !seen.has(row.event.branch)) {
      seen.add(row.event.branch);
      FIRST_OF_BRANCH.add(i);
    }
  }
}

// Experience roadmap as a vertical commit graph (specs/04-pages.md, section 3 and Q4.19): main
// starts with an init commit; education and work are branches of their own, and internships,
// training, and the thesis fork off their parent branch and merge back when they end. The
// list is the real content; the graph is decoration.
export function Experience() {
  const { t, i18n } = useTranslation('home');
  const lang: Lang = i18n.resolvedLanguage === 'en' ? 'en' : 'id';
  const boxRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const initRef = useRef<HTMLDivElement>(null);
  const [wide, setWide] = useState(() => window.innerWidth >= 640);
  // Measured centre of every row's node, in px from the top of the list.
  const [nodeY, setNodeY] = useState<number[] | null>(null);
  const [height, setHeight] = useState(0);

  const spacing = wide ? 36 : 18;
  const laneX = (lane: number) => 10 + lane * spacing;
  const indent = (row: Row) => laneX(Math.max(...row.lanes)) + (wide ? 30 : 18);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const list = listRef.current;
    const init = initRef.current;
    if (!box || !list || !init) return;
    const measure = () => {
      setWide(list.clientWidth >= 600);
      const ys = LAYOUT.rows.map(() => 0);
      for (const item of list.querySelectorAll<HTMLElement>('[data-row]')) {
        const index = Number(item.dataset.row);
        const merges = Number(item.dataset.merges ?? 0);
        ys[index] = item.offsetTop + merges * MERGE_SPACE + NODE_OFFSET;
        // Merge nodes sit in the space above the card, one slot each.
        for (let k = 1; k <= merges; k++)
          ys[index - k] = item.offsetTop + (merges - k) * MERGE_SPACE + MERGE_SPACE / 2;
      }
      ys[ys.length - 1] = init.offsetTop + INIT_SPACE / 2;
      setNodeY(ys);
      setHeight(box.offsetHeight);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="experience" aria-labelledby="experience-title" className="mt-24">
      <h2 id="experience-title" className="font-display text-5xl leading-none">
        {t('experience.heading')}
      </h2>

      {/* On wide screens the other certificates fill the column beside the graph. */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div ref={boxRef} className="relative" style={{ paddingTop: TIP_SPACE }}>
          {nodeY && (
            <Graph nodeY={nodeY} height={height} laneX={laneX} width={laneX(LAYOUT.laneCount)} />
          )}
          <ol ref={listRef} className="grid gap-3">
            {LAYOUT.rows.map((row, index) => {
              if (row.kind !== 'event') return null;
              let merges = 0;
              while (LAYOUT.rows[index - merges - 1]?.kind === 'merge') merges++;
              return (
                <li
                  key={index}
                  data-row={index}
                  data-merges={merges || undefined}
                  style={{ paddingLeft: indent(row), paddingTop: merges * MERGE_SPACE }}
                >
                  <EventCard
                    event={row.event}
                    lang={lang}
                    branchLabel={
                      FIRST_OF_BRANCH.has(index)
                        ? BRANCHES.get(row.event.branch)?.label[lang]
                        : undefined
                    }
                  />
                </li>
              );
            })}
          </ol>
          {/* The root commit on main: decorative, like the rest of the graph. */}
          <div
            ref={initRef}
            aria-hidden="true"
            className="flex items-center"
            style={{ height: INIT_SPACE, paddingLeft: laneX(0) + 18 }}
          >
            <span className="rounded-md bg-chip px-2 py-0.5 font-mono text-xs text-muted">
              init
            </span>
          </div>
        </div>

        <OtherCertifications lang={lang} />
      </div>
    </section>
  );
}

interface GraphProps {
  nodeY: number[];
  height: number;
  width: number;
  laneX: (lane: number) => number;
}

// Lines first, then nodes on top. Coordinates are whole pixels for crisp pixel edges.
function Graph({ nodeY, height, width, laneX }: GraphProps) {
  const rows = LAYOUT.rows;
  const y = (index: number) => Math.round(nodeY[index]);
  const lines: ReactNode[] = [];
  const nodes: ReactNode[] = [];

  // Main runs from its tip above the newest row down to the init commit.
  const tipY = y(0) - TIP_SPACE;
  lines.push(<Line key="main" kind="main" d={`M${laneX(0)} ${tipY}V${y(rows.length - 1)}`} />);
  nodes.push(
    <rect
      key="tip-main"
      x={laneX(0) - LINE.main.node / 2}
      y={tipY - LINE.main.node / 2}
      width={LINE.main.node}
      height={LINE.main.node}
      className="fill-accent"
    />,
  );

  // Each branch: forks off its parent just below its oldest event, runs up through its events,
  // and turns back into its parent at its merge row (or runs to the top while ongoing).
  for (const branch of BRANCHES_BY_DEPTH) {
    const indices = rows.flatMap((row, i) => (rowBranch(row) === branch.id ? [i] : []));
    if (!indices.length) continue;
    const top = indices[0];
    const oldest = indices[indices.length - 1];
    const x = laneX(rows[oldest].lane);
    const parentX = laneX(LAYOUT.parentLane[branch.id] ?? 0);
    // The init row is always below, so every branch has a row to fork from.
    const forkY = Math.round(y(oldest) + Math.min(24, (y(oldest + 1) - y(oldest)) / 2));
    const merges = rows[top].kind === 'merge';
    // An open branch (the current job) runs up to the same height as main's tip.
    const end = merges ? `V${y(top)}H${parentX}` : `V${tipY}`;
    lines.push(<Line key={branch.id} kind={branch.kind} d={`M${parentX} ${forkY}H${x}${end}`} />);
    if (!merges) {
      const size = LINE[branch.kind].node;
      nodes.push(
        <rect
          key={`tip-${branch.id}`}
          x={x - size / 2}
          y={tipY - size / 2}
          width={size}
          height={size}
          className={LINE[branch.kind].accent ? 'fill-accent' : 'fill-ink'}
        />,
      );
    }
  }

  rows.forEach((row, i) => {
    const cx = laneX(row.lane);
    const cy = y(i);
    if (row.kind === 'init') {
      nodes.push(
        <rect
          key={i}
          x={cx - 6}
          y={cy - 6}
          width={12}
          height={12}
          strokeWidth={3}
          className="fill-bg stroke-accent"
        />,
      );
      return;
    }
    if (row.kind === 'merge') {
      // Hollow node on the parent branch where a branch joins back.
      const px = laneX(LAYOUT.parentLane[row.branch.id] ?? 0);
      nodes.push(
        <rect
          key={i}
          x={px - 5}
          y={cy - 5}
          width={10}
          height={10}
          strokeWidth={3}
          className="fill-bg stroke-accent"
        />,
      );
      return;
    }
    const kind = kindOf(row.event.branch);
    const size = LINE[kind].node;
    nodes.push(
      <rect
        key={i}
        x={cx - size / 2}
        y={cy - size / 2}
        width={size}
        height={size}
        className={LINE[kind].accent ? 'fill-accent' : 'fill-ink'}
      />,
    );
  });

  return (
    <svg
      aria-hidden="true"
      width={width}
      height={height}
      shapeRendering="crispEdges"
      className="pointer-events-none absolute top-0 left-0"
    >
      {lines}
      {nodes}
    </svg>
  );
}

function Line({ kind, d }: { kind: Kind; d: string }) {
  const style = LINE[kind];
  return (
    <path
      d={d}
      fill="none"
      strokeWidth={style.width}
      strokeDasharray={style.dash}
      className={style.accent ? 'stroke-accent' : 'stroke-muted'}
    />
  );
}

interface EventCardProps {
  event: ExperienceEvent;
  lang: Lang;
  /** Shown on a branch's first event, like a branch label on GitHub. */
  branchLabel?: string;
}

function EventCard({ event, lang, branchLabel }: EventCardProps) {
  const { t } = useTranslation('home');
  const end = event.current ? (
    t('experience.present')
  ) : event.end ? (
    <time dateTime={event.end}>{formatMonth(event.end, lang)}</time>
  ) : null;

  return (
    <article className="theme-fade rounded-xl border border-line bg-card p-5 shadow-card">
      <p className="flex flex-wrap items-center gap-2 text-xs font-bold tracking-[0.06em] uppercase">
        <span className="text-accent-text">{t(`experience.type.${event.type}`)}</span>
        {branchLabel && (
          <span className="rounded-md bg-chip px-2 py-0.5 font-mono tracking-normal text-muted normal-case">
            {branchLabel}
          </span>
        )}
        {event.current && (
          <span className="rounded-md bg-accent px-2 py-0.5 font-mono tracking-normal text-on-accent">
            HEAD
          </span>
        )}
      </p>
      <h3 className="mt-2 text-xl leading-snug font-bold">{event.title[lang]}</h3>
      <p className="mt-1 text-muted">
        {event.org}
        {' · '}
        <time dateTime={event.date}>{formatMonth(event.date, lang)}</time>
        {end && <> – {end}</>}
      </p>
      {event.summary && <p className="mt-3 max-w-[68ch] text-muted">{event.summary[lang]}</p>}
      {event.links && <ResultLinks links={event.links} />}
      {event.certifications && (
        <CertificationList certifications={event.certifications} lang={lang} />
      )}
    </article>
  );
}

// Icons for result links: GitHub from Font Awesome Free (see socialIcons.ts); the ORCID "iD"
// and the credential badge are simple drawings, not the brands' own logos.
const LINK_ICONS: Record<ResultLink['kind'], { viewBox: string; path: string }> = {
  github: { viewBox: '0 0 640 640', path: SOCIAL_ICON_PATHS.github },
  orcid: {
    viewBox: '0 0 16 16',
    path: 'M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM5.3 11.8H4.2V5.2h1.1zM4.75 4.5a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4zm7.3 4c0 1.9-1.3 3.3-3.4 3.3H6.6V5.2h2c2.1 0 3.4 1.4 3.4 3.3zm-1.1 0c0-1.4-.9-2.3-2.4-2.3h-.9v4.6h.9c1.5 0 2.4-.9 2.4-2.3z',
  },
  credential: {
    viewBox: '0 0 16 16',
    path: 'M8 0a5.5 5.5 0 1 0 0 11A5.5 5.5 0 0 0 8 0zm0 2.6 1 2.1 2.3.3-1.7 1.6.4 2.3L8 7.8 6 8.9l.4-2.3L4.7 5l2.3-.3zM4 10.4 2.8 16l2.6-1.3L7 16l.5-4.6a6.9 6.9 0 0 1-3.5-1zm8 0a6.9 6.9 0 0 1-3.5 1L9 16l1.6-1.3 2.6 1.3z',
  },
};

// Repositories and publications that came out of this step; open in a new tab.
function ResultLinks({ links }: { links: ResultLink[] }) {
  const { t } = useTranslation();
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${link.label} ${t('externalLink')}`}
            className="theme-fade inline-flex min-h-11 items-center gap-2 rounded-md bg-chip px-3 text-sm font-semibold break-all hover:outline-2 hover:outline-accent"
          >
            <svg
              viewBox={LINK_ICONS[link.kind].viewBox}
              className="size-4 shrink-0"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d={LINK_ICONS[link.kind].path} fillRule="evenodd" />
            </svg>
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

// The title links to the credential page when there is one.
function CertificateItem({ cert, lang }: { cert: Certification; lang: Lang }) {
  const { t } = useTranslation();
  return (
    <li className="flex gap-3">
      <span aria-hidden="true" className="mt-[0.55em] size-2 shrink-0 bg-accent" />
      <span>
        {cert.href ? (
          <a
            href={cert.href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-accent-text decoration-2 underline-offset-4 hover:text-accent-text"
          >
            {cert.title}
            <span className="sr-only"> {t('externalLink')}</span>
          </a>
        ) : (
          cert.title
        )}{' '}
        <span className="text-muted">
          · {cert.issuer} · <time dateTime={cert.date}>{formatMonth(cert.date, lang)}</time>
        </span>
      </span>
    </li>
  );
}

// Three highlights stay visible; the full list opens on demand (Q4.16).
function CertificationList({
  certifications,
  lang,
}: {
  certifications: Certification[];
  lang: Lang;
}) {
  const { t } = useTranslation('home');
  const highlights = certifications.filter((cert) => cert.highlight);
  return (
    <div className="mt-5">
      <h4 className="text-xs font-bold tracking-[0.06em] text-muted uppercase">
        {t('experience.certifications')} · {certifications.length}
      </h4>
      <ul className="mt-2 grid gap-1.5 text-[0.95rem]">
        {highlights.map((cert) => (
          <CertificateItem key={cert.title} cert={cert} lang={lang} />
        ))}
      </ul>
      {certifications.length > highlights.length && (
        <details className="mt-2">
          <summary className="inline-flex min-h-11 cursor-pointer items-center font-semibold text-accent-text">
            {t('experience.showAll', { count: certifications.length })}
          </summary>
          <ul className="mt-1 grid gap-1.5 text-sm">
            {certifications.map((cert) => (
              <CertificateItem key={cert.title} cert={cert} lang={lang} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

// Certificates outside the programs, and the full list on LinkedIn.
function OtherCertifications({ lang }: { lang: Lang }) {
  const { t } = useTranslation('home');
  const others = EXPERIENCE.otherCertifications ?? [];
  if (!others.length) return null;
  return (
    <div className="theme-fade rounded-xl border border-line bg-card p-5 shadow-card lg:sticky lg:top-24">
      <h3 className="text-xs font-bold tracking-[0.06em] text-muted uppercase">
        {t('experience.otherCertifications')}
      </h3>
      <ul className="mt-3 grid gap-1.5 text-[0.95rem]">
        {others.map((cert) => (
          <CertificateItem key={cert.title} cert={cert} lang={lang} />
        ))}
      </ul>
      {LINKEDIN && (
        <a
          href={`${LINKEDIN}/details/certifications/`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-11 items-center rounded-md bg-chip px-3 text-sm font-semibold hover:outline-2 hover:outline-accent"
        >
          {t('experience.allOnLinkedIn', { count: CERTIFICATE_COUNT })}
          <span className="sr-only"> {t('common:externalLink')}</span>
          <span aria-hidden="true">&nbsp;↗</span>
        </a>
      )}
    </div>
  );
}
