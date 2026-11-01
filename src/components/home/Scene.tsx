import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../../theme/store.ts';
import { useStillMotion, watchFrameRate } from './motion.ts';
import { drawScene, SceneState, type Box } from './sceneArt.ts';
import { SCENE_SCALE, VISIT, sceneRows } from './scenery.ts';

const TICK_MS = 160;
const TYPE_MS = 45;
const HIDE_AFTER_TYPED_MS = 2200;
const HIDE_STILL_MS = 2600;

interface Bubble {
  line: string;
  shown: number;
}

// The pixel scene above the contact area (specs/07-scenery.md, section 2), with a greeting
// button over the beaver. Loaded lazily; SceneryFooter already reserves its height.
export default function Scene() {
  const { t } = useTranslation('home');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state] = useState(() => new SceneState(VISIT.scene, VISIT.seed));
  const theme = useTheme();
  const still = useStillMotion();
  const redraw = useRef(() => {});
  // The beaver's place in CSS px, for the greeting button and the bubble.
  const [beaver, setBeaver] = useState<Box | null>(null);
  const [bubble, setBubble] = useState<Bubble | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  // How far the bubble moves sideways to stay on screen; its tail moves back by the same amount.
  const [bubbleShift, setBubbleShift] = useState(0);
  const timers = useRef<number[]>([]);

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
      const box = drawScene(ctx, { ...VISIT, theme, width, frame, still }, state);
      const scale = canvas.getBoundingClientRect().width / width;
      const next = box && {
        x: box.x * scale,
        y: box.y * scale,
        w: box.w * scale,
        h: box.h * scale,
      };
      setBeaver((prev) =>
        prev && next && prev.x === next.x && prev.y === next.y && prev.w === next.w ? prev : next,
      );
    };
    redraw.current = draw;

    // Draws only while the scene is on screen and the tab is visible.
    const sync = () => {
      const run = !still && onScreen && !document.hidden;
      if (run && timer === undefined) {
        watchFrameRate();
        timer = window.setInterval(() => {
          frame++;
          state.tick(frame, theme === 'night');
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
  }, [theme, still, state]);

  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const greet = () => {
    const lines = Object.values(
      t(`scene.lines.${VISIT.scene}.${theme}`, { returnObjects: true }) as Record<string, string>,
    );
    const line = lines[Math.floor(Math.random() * lines.length)];
    // Greeting again starts a new line; earlier typing and hiding timers stop.
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    state.startle(still);
    redraw.current();

    if (still) {
      setBubble({ line, shown: line.length });
      later(() => setBubble(null), HIDE_STILL_MS + line.length * 40);
      return;
    }
    setBubble({ line, shown: 0 });
    for (let n = 1; n <= line.length; n++) later(() => setBubble({ line, shown: n }), n * TYPE_MS);
    later(() => setBubble(null), line.length * TYPE_MS + HIDE_AFTER_TYPED_MS);
  };

  const typing = bubble !== null && bubble.shown < bubble.line.length;
  const bubbleLine = bubble?.line;

  // The full line reserves the bubble's width from the first frame, so measure once per line.
  useLayoutEffect(() => {
    const el = bubbleRef.current;
    const canvas = canvasRef.current;
    if (!el || !canvas || !beaver) return;
    const half = el.offsetWidth / 2;
    const center = beaver.x + beaver.w / 2;
    const margin = 8;
    const width = canvas.getBoundingClientRect().width;
    const left = Math.min(Math.max(center, half + margin), width - half - margin);
    setBubbleShift(left - center);
  }, [bubbleLine, beaver]);

  return (
    // Clipped sideways: on narrow screens the beaver (and its greeting button) can sit partly
    // past the canvas edge, which must not widen the page. Upwards stays open for the bubble.
    <div className="relative overflow-x-clip">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="block w-full [image-rendering:pixelated]"
        style={{ height: sceneRows(VISIT.scene) * SCENE_SCALE }}
      />
      {beaver && (
        <>
          <button
            type="button"
            aria-label={t('scene.greet')}
            onClick={greet}
            className="absolute cursor-pointer rounded-md"
            style={{ left: beaver.x, top: beaver.y, width: beaver.w, height: beaver.h }}
          />
          {bubble && (
            <div
              aria-hidden="true"
              ref={bubbleRef}
              className="pixel-bubble"
              style={
                {
                  left: beaver.x + beaver.w / 2 + bubbleShift,
                  top: beaver.y - 3 * SCENE_SCALE,
                  '--tail-shift': `${-bubbleShift}px`,
                } as CSSProperties
              }
            >
              {/* The invisible full line reserves the final width, so the bubble does not
                  grow while it types. */}
              <span className="grid">
                <span className="invisible col-start-1 row-start-1">{bubble.line}</span>
                <span className="col-start-1 row-start-1">
                  {bubble.line.slice(0, bubble.shown)}
                  {typing && <span className="pixel-caret">_</span>}
                </span>
              </span>
            </div>
          )}
        </>
      )}
      {/* Screen readers hear the whole line once instead of letter by letter. */}
      <p aria-live="polite" className="sr-only">
        {bubble?.line ?? ''}
      </p>
    </div>
  );
}
