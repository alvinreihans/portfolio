import { useEffect, useRef } from 'react';

import { useTheme } from '../../theme/store.ts';
import { useStillMotion, watchFrameRate } from './motion.ts';
import { drawScene } from './sceneArt.ts';
import { SCENE_SCALE, VISIT, sceneRows } from './scenery.ts';

const TICK_MS = 160;

// The pixel scene above the contact area (specs/07-scenery.md, section 2). Loaded lazily;
// the wrapper in SceneryFooter already reserves its height.
export default function Scene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();
  const still = useStillMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let frame = 0;
    let timer: number | undefined;
    let onScreen = false;

    const draw = () => {
      const width = Math.ceil(document.documentElement.clientWidth / SCENE_SCALE);
      if (canvas.width !== width) canvas.width = width;
      canvas.height = sceneRows(VISIT.scene);
      drawScene(ctx, { ...VISIT, theme, width, frame, still });
    };

    // Draws only while the scene is on screen and the tab is visible.
    const sync = () => {
      const run = !still && onScreen && !document.hidden;
      if (run && timer === undefined) {
        watchFrameRate();
        timer = window.setInterval(() => {
          frame++;
          draw();
        }, TICK_MS);
      } else if (!run && timer !== undefined) {
        window.clearInterval(timer);
        timer = undefined;
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    observer.observe(canvas);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('resize', draw);
    draw();

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('resize', draw);
      window.clearInterval(timer);
    };
  }, [theme, still]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="block w-full [image-rendering:pixelated]"
      style={{ height: sceneRows(VISIT.scene) * SCENE_SCALE }}
    />
  );
}
