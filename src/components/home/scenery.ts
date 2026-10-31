// Scene choice and ground textures from specs/07-scenery.md. This part is small and loaded
// up front: the contact area needs the ground texture before the scene drawing code arrives.
import type { Theme } from '../../theme/theme.ts';

export const SCENES = ['park', 'beach', 'city', 'mountain'] as const;
export type SceneName = (typeof SCENES)[number];

/** On-screen size of one scene pixel in CSS px. */
export const SCENE_SCALE = 4;

/** Scene height in scene pixels; the city needs room for a two-lane road and a lower sidewalk. */
export function sceneRows(scene: SceneName): number {
  return scene === 'city' ? 88 : 64;
}

function isScene(value: string | null): value is SceneName {
  return SCENES.includes(value as SceneName);
}

/**
 * One scene and seed per page visit (Q7.2). `?scene=` and `?seed=` pin them, so tests and
 * reviews can look at a specific scene.
 */
function pick(): { scene: SceneName; seed: number } {
  const params = new URLSearchParams(window.location.search);
  const scene = params.get('scene');
  const seed = Number.parseInt(params.get('seed') ?? '', 10);
  return {
    scene: isScene(scene) ? scene : SCENES[Math.floor(Math.random() * SCENES.length)],
    seed: Number.isFinite(seed) ? seed : Math.floor(Math.random() * 1e9),
  };
}

export const VISIT = pick();

type GroundKind = 'soil' | 'sand' | 'paving';

export interface GroundPalette {
  base: string;
  /** Text on this texture; checked against every colour in it (specs/07-scenery.md). */
  ink: string;
  [color: string]: string;
}

const GROUNDS: Record<GroundKind, Record<Theme, GroundPalette>> = {
  soil: {
    day: { base: '#6c3200', a: '#7a3c08', b: '#5e2c00', ink: '#f5e6dc' },
    night: { base: '#1d0e03', a: '#2a1606', b: '#3b1c02', stone: '#3a4258', ink: '#f5e6dc' },
  },
  sand: {
    day: { base: '#f2d38a', a: '#e6c47a', b: '#d9b566', shell: '#ffffff', ink: '#2b1600' },
    night: { base: '#3a3222', a: '#453b28', b: '#30291c', shell: '#5e5034', ink: '#f5e6dc' },
  },
  paving: {
    day: { base: '#c9cfd6', line: '#b0b8c2', light: '#d6dbe1', ink: '#0f1a33' },
    night: { base: '#242a3a', line: '#1e2331', light: '#2c3346', ink: '#f5e6dc' },
  },
};

const SCENE_GROUND: Record<SceneName, GroundKind> = {
  park: 'soil',
  mountain: 'soil',
  beach: 'sand',
  city: 'paving',
};

export function groundPalette(scene: SceneName, theme: Theme): GroundPalette {
  return GROUNDS[SCENE_GROUND[scene]][theme];
}

function hash(x: number, y: number): number {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Colour of one ground pixel; the same function paints the scene and the contact tile. */
export function groundColor(scene: SceneName, theme: Theme, x: number, y: number): string {
  const kind = SCENE_GROUND[scene];
  const g = groundPalette(scene, theme);
  if (kind === 'paving') {
    const row = Math.floor(y / 4);
    const bx = (x + (row % 2) * 4) % 8;
    if (y % 4 === 3 || bx === 7) return g.line;
    return y % 4 === 0 && bx === 0 ? g.light : g.base;
  }
  const r = hash(x, y);
  if (kind === 'sand') return r < 0.006 ? g.shell : r < 0.06 ? g.a : r < 0.1 ? g.b : g.base;
  return g.stone && r < 0.008 ? g.stone : r < 0.07 ? g.a : r < 0.11 ? g.b : g.base;
}

export function paintGround(
  ctx: CanvasRenderingContext2D,
  scene: SceneName,
  theme: Theme,
  x0: number,
  y0: number,
  width: number,
  height: number,
) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      ctx.fillStyle = groundColor(scene, theme, x0 + x, y0 + y);
      ctx.fillRect(x0 + x, y0 + y, 1, 1);
    }
  }
}

const tiles = new Map<string, string>();

/** A 32x16 repeating tile of the ground texture, as a data URL for a CSS background. */
export function groundTile(scene: SceneName, theme: Theme): string {
  const key = `${scene}-${theme}`;
  let url = tiles.get(key);
  if (!url) {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (ctx) paintGround(ctx, scene, theme, 0, 0, 32, 16);
    url = canvas.toDataURL();
    tiles.set(key, url);
  }
  return url;
}
