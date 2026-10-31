import { PixelIcon } from '../PixelIcon.tsx';
import { MOON, SUN } from '../pixelIcons.ts';

// Sun by day and moon by night at the hero's right edge. Clouds and stars live in the
// page-wide sky (PageSky, specs/07-scenery.md). Hidden from assistive technology.
export function Sky() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {/* Small sun or moon above the hero on phones, so it never covers the heading. */}
      <div className="absolute -top-14 right-0 sm:hidden">
        <PixelIcon icon={SUN} cell={4} className="text-accent night:hidden" />
        <PixelIcon icon={MOON} cell={4} className="hidden text-mascot-light night:block" />
      </div>

      <div className="absolute top-0 right-4 hidden sm:block">
        <PixelIcon icon={SUN} cell={8} className="text-accent night:hidden" />
        <PixelIcon icon={MOON} cell={7} className="hidden text-mascot-light night:block" />
      </div>
    </div>
  );
}
