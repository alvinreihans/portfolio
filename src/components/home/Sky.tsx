import { PixelIcon } from '../PixelIcon.tsx';
import { CLOUD, MOON, SUN } from '../pixelIcons.ts';

// Fixed positions (percent of the sky area) so the stars never jump between renders.
const STARS = [
  [8, 12],
  [22, 40],
  [35, 8],
  [48, 62],
  [58, 22],
  [66, 78],
  [74, 48],
  [82, 10],
  [90, 66],
  [96, 30],
  [14, 82],
  [42, 90],
  [62, 4],
  [86, 88],
  [28, 70],
];

// Decorative pixel sky from specs/02-design-system.md: sun and clouds by day,
// moon, stars, and darker clouds by night. Hidden from assistive technology.
export function Sky() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {/* Small sun or moon above the hero on phones, so it never covers the heading. */}
      <div className="absolute -top-14 right-0 sm:hidden">
        <PixelIcon icon={SUN} cell={4} className="text-accent night:hidden" />
        <PixelIcon icon={MOON} cell={4} className="hidden text-mascot-light night:block" />
      </div>

      <div className="absolute inset-y-0 right-0 hidden w-[42%] sm:block">
        {/* Stars first, so the moon and clouds sit in front of them. */}
        {STARS.map(([left, top]) => (
          <span
            key={`${left}-${top}`}
            className="star absolute hidden size-1 bg-mascot-light night:block"
            style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${(left * 37) % 3000}ms` }}
          />
        ))}
        <div className="absolute top-0 right-4">
          <PixelIcon icon={SUN} cell={8} className="text-accent night:hidden" />
          <PixelIcon icon={MOON} cell={7} className="hidden text-mascot-light night:block" />
        </div>
        <PixelIcon icon={CLOUD} className="absolute top-24 right-36" />
        <PixelIcon icon={CLOUD} cell={4} className="absolute top-56 right-2" />
      </div>
    </div>
  );
}
