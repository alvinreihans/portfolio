import { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { describeFlow, layoutFlow, parseFlow } from '../content/flow.ts';

/** Gap between levels; arrows bend in the middle of it. */
const LEVEL_GAP = 32;
/** Room on the right for arrows that skip a level, and the spacing between them. */
const LANE_GAP = 14;
const HEAD = 5;

interface Box {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

// Architecture diagram from the `flow` syntax as a top-down flowchart (specs/06-project-
// stories.md, Q6.4): each node once, levels from the longest path, and pixel arrows measured
// from the real node boxes. Screen readers get the diagram as one sentence per chain.
export function FlowDiagram({ source }: { source: string }) {
  const { t } = useTranslation('project');
  const flow = parseFlow(source);
  const layout = layoutFlow(flow);
  const byName = new Map(flow.nodes.map((node) => [node.name, node]));
  const skips = layout.edges.filter(
    ([from, to]) => layout.level.get(to)! - layout.level.get(from)! !== 1,
  );

  const boxRef = useRef<HTMLDivElement>(null);
  const [boxes, setBoxes] = useState<Map<string, Box> | null>(null);

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => {
      const origin = el.getBoundingClientRect();
      const next = new Map<string, Box>();
      for (const node of el.querySelectorAll<HTMLElement>('[data-node]')) {
        const r = node.getBoundingClientRect();
        next.set(node.dataset.node!, {
          left: Math.round(r.left - origin.left),
          right: Math.round(r.right - origin.left),
          top: Math.round(r.top - origin.top),
          bottom: Math.round(r.bottom - origin.top),
        });
      }
      setBoxes(next);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [source]);

  // Keyed by edge: two arrows into the same node draw identical heads.
  const paths: { key: string; d: string }[] = [];
  const heads: { key: string; d: string }[] = [];
  if (boxes) {
    const contentRight = Math.max(...[...boxes.values()].map((box) => box.right));
    let lane = 0;
    for (const [from, to] of layout.edges) {
      const a = boxes.get(from);
      const b = boxes.get(to);
      if (!a || !b) continue;
      const key = `${from}\u0000${to}`;
      if (layout.level.get(to)! - layout.level.get(from)! === 1) {
        // Down from the bottom of one node to the top of the next, bending halfway.
        const sx = Math.round((a.left + a.right) / 2);
        const tx = Math.round((b.left + b.right) / 2);
        const mid = Math.round((a.bottom + b.top) / 2);
        paths.push({ key, d: `M${sx} ${a.bottom}V${mid}H${tx}V${b.top - HEAD}` });
        heads.push({
          key,
          d: `M${tx - HEAD} ${b.top - HEAD}h${HEAD * 2 + 1}L${tx + 0.5} ${b.top}z`,
        });
      } else {
        // Skips a level: out of the right side, down a lane past every node, back in.
        const x = contentRight + LANE_GAP * (lane + 1);
        lane++;
        const sy = Math.round((a.top + a.bottom) / 2);
        const ty = Math.round((b.top + b.bottom) / 2);
        paths.push({ key, d: `M${a.right} ${sy}H${x}V${ty}H${b.right + HEAD}` });
        heads.push({
          key,
          d: `M${b.right + HEAD} ${ty - HEAD}v${HEAD * 2 + 1}L${b.right} ${ty + 0.5}z`,
        });
      }
    }
  }

  return (
    <figure className="my-6">
      <figcaption className="sr-only">
        {t('flowLabel')}: {describeFlow(flow, t('flowThen'))}
      </figcaption>
      <div
        ref={boxRef}
        aria-hidden="true"
        className="relative"
        style={{ paddingRight: skips.length ? LANE_GAP * (skips.length + 1) : 0 }}
      >
        <svg
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
          shapeRendering="crispEdges"
        >
          {paths.map(({ key, d }) => (
            <path key={key} d={d} fill="none" strokeWidth={2} className="stroke-muted" />
          ))}
          {heads.map(({ key, d }) => (
            <path key={key} d={d} className="fill-muted" />
          ))}
        </svg>
        <div className="relative flex flex-col items-center" style={{ gap: LEVEL_GAP }}>
          {layout.rows.map((row) => (
            // A level never breaks into two lines (the arrows would cross other nodes); on
            // narrow screens the boxes shrink and their text wraps instead.
            <div key={row.join('|')} className="flex w-full justify-center gap-1.5 sm:gap-4">
              {row.map((name) => {
                const node = byName.get(name)!;
                return (
                  <div
                    key={name}
                    data-node={name}
                    className={`theme-fade min-w-0 rounded-md px-2 py-2 text-center leading-tight [overflow-wrap:break-word] sm:px-3 ${
                      node.highlight ? 'bg-accent text-on-accent' : 'bg-chip text-ink'
                    }`}
                  >
                    <span className="block text-xs font-bold sm:text-sm">{node.name}</span>
                    {node.note && (
                      <span
                        className={`block text-[11px] sm:text-xs ${node.highlight ? 'text-on-accent' : 'text-muted'}`}
                      >
                        {node.note}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </figure>
  );
}
