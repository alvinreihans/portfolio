import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';

import { PixelIcon } from '../PixelIcon.tsx';
import { CLOUD } from '../pixelIcons.ts';
import { useStillMotion } from './motion.ts';

/** Content column width plus gutters (specs/02-design-system.md). */
const CONTENT_WIDTH = 1200;
const MIN_GUTTER = 120;

interface Cloud {
  x: number;
  /** Fraction of the sky height, so the layout survives the page growing taller. */
  y: number;
  cell: number;
  range: number;
  duration: number;
  delay: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  delay: number;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

// Random once per width (specs/07-scenery.md, section 1).
function layout(width: number, height: number): { clouds: Cloud[]; stars: Star[] } {
  const gutter = Math.max(0, (width - CONTENT_WIDTH) / 2);
  const wide = gutter >= MIN_GUTTER;
  const count = wide
    ? Math.max(6, Math.round(height / 260))
    : Math.max(3, Math.round(height / 700));
  const clouds: Cloud[] = [];
  for (let i = 0; i < count; i++) {
    const cell = wide ? [5, 6, 8][Math.floor(Math.random() * 3)] : 4;
    const cloudWidth = CLOUD.width * cell;
    const range = rand(40, 90);
    const left = i % 2 === 0;
    let x: number;
    if (wide) {
      // Keep the whole drift inside the gutter so clouds never cover the content column.
      const room = Math.max(gutter - range - 24, 40);
      // Drift adds `range` on either side, so it is subtracted here once, through `room`. On a
      // narrow gutter the cloud may then sit mostly past the screen edge, which is allowed.
      const leftMax = room - cloudWidth;
      const rightMin = width - room;
      x = left
        ? rand(Math.min(-cloudWidth * 0.45, leftMax), leftMax)
        : rand(rightMin, Math.max(width - cloudWidth * 0.55, rightMin));
    } else {
      x = left
        ? rand(-cloudWidth * 0.5, width * 0.15)
        : rand(width * 0.6, width - cloudWidth * 0.5);
    }
    const y = (60 + (i / count) * (height - 120) + rand(-50, 50)) / height;
    clouds.push({ x, y, cell, range, duration: rand(18, 35), delay: -rand(0, 30) });
  }
  const stars: Star[] = [];
  for (let i = 0; i < Math.round((width * height) / 14000); i++)
    stars.push({
      x: rand(0, width),
      y: Math.random(),
      size: Math.random() < 0.25 ? 6 : 4,
      delay: rand(0, 3),
    });
  return { clouds, stars };
}

// Page-wide sky behind the home page content: drifting clouds, and stars at night.
export function PageSky() {
  const ref = useRef<HTMLDivElement>(null);
  const still = useStillMotion();
  const [sky, setSky] = useState<ReturnType<typeof layout> | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    let lastWidth = 0;
    const observer = new ResizeObserver(() => {
      const width = element.clientWidth;
      if (width === lastWidth) return;
      lastWidth = width;
      setSky(layout(width, element.clientHeight));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-still={still || undefined}
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {sky?.stars.map((star, i) => (
        <span
          key={`s${i}`}
          className="star absolute hidden bg-mascot-light night:block"
          style={{
            left: star.x,
            top: `${star.y * 100}%`,
            width: star.size,
            height: star.size,
            animationDelay: `${star.delay.toFixed(2)}s`,
          }}
        />
      ))}
      {sky?.clouds.map((cloud, i) => (
        <div
          key={`c${i}`}
          className="cloud absolute"
          style={
            {
              left: cloud.x,
              top: `${cloud.y * 100}%`,
              '--range': `${cloud.range.toFixed(0)}px`,
              animationDuration: `${cloud.duration.toFixed(0)}s`,
              animationDelay: `${cloud.delay.toFixed(1)}s`,
            } as CSSProperties
          }
        >
          <PixelIcon icon={CLOUD} cell={cloud.cell} />
        </div>
      ))}
    </div>
  );
}
