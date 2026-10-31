import type { PixelIconData } from './pixelIcons.ts';

interface PixelIconProps {
  icon: PixelIconData;
  /** On-screen size of one grid pixel in CSS px; defaults to the icon's own size. */
  cell?: number;
  className?: string;
}

export function PixelIcon({ icon, cell = icon.cell, className }: PixelIconProps) {
  return (
    <svg
      width={icon.width * cell}
      height={icon.height * cell}
      viewBox={`0 0 ${icon.width} ${icon.height}`}
      shapeRendering="crispEdges"
      className={className}
      aria-hidden="true"
    >
      {icon.rects.map(([x, y, width, height, fill], index) => (
        // `style` (not the fill attribute) so CSS variables such as var(--card) resolve.
        <rect key={index} x={x} y={y} width={width} height={height} style={{ fill }} />
      ))}
    </svg>
  );
}
