import type { PixelIconData } from './pixelIcons.ts';

export function PixelIcon({ icon }: { icon: PixelIconData }) {
  return (
    <svg
      width={icon.width * icon.cell}
      height={icon.height * icon.cell}
      viewBox={`0 0 ${icon.width} ${icon.height}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {icon.rects.map(([x, y, width, height, fill], index) => (
        <rect key={index} x={x} y={y} width={width} height={height} fill={fill} />
      ))}
    </svg>
  );
}
