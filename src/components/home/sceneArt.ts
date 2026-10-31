// Pixel scenes from specs/07-scenery.md, ported from mockups/g-scenes.html. Everything is
// drawn in scene pixels on a small canvas that CSS scales up. Loaded lazily with the scene.
import type { Theme } from '../../theme/theme.ts';
import { paintGround, sceneRows, type SceneName } from './scenery.ts';

export interface SceneFrame {
  scene: SceneName;
  seed: number;
  theme: Theme;
  /** Width in scene pixels. */
  width: number;
  /** Animation tick; advances every 160ms while the scene animates. */
  frame: number;
  still: boolean;
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

type Palette = Record<string, string>;

const GROUND = 52;

function mulberry(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- beaver mascot (after the owner's reference image) ----------
// O outline, B fur, L belly, K eyes, T teeth, D tail, G sunglasses.
const BEAVER_COLORS: Palette = {
  O: '#6c3200',
  B: '#e0832e',
  L: '#f7c98b',
  K: '#3b1c02',
  T: '#ffffff',
  D: '#a5541a',
  G: '#101828',
};
const BEAVER = [
  '.......OO....OO.....',
  '......OBBOOOOBBO....',
  '.....OBBBBBBBBBBO...',
  '.....OBBBBBBBBBBO...',
  '....OBBKBBBBBBKBBO..',
  '....OBBBBBKKBBBBBO..',
  '....OBBBBBTTBBBBBO..',
  '.....OBBBBBBBBBBO...',
  '....OBBBBBBBBBBBBO..',
  '...OBBBOLLLLLOBBBO..',
  '.OOOBBBLLLLLLLBBBO..',
  'ODDDOBBLLLLLLLBBBO..',
  'ODDDDOBLLLLLLLBBBO..',
  'ODDDDOBBLLLLLBBBBO..',
  '.ODDDOBBBBBBBBBBBO..',
  '..OOOOBBBOOOOBBBOO..',
  '.....OOOO....OOOO...',
];
const BEAVER_WIDTH = BEAVER[0].length;

type Eyes = 'open' | 'closed' | 'shades';

interface BeaverPose {
  eyes: Eyes;
  look?: number;
  flip?: boolean;
  /** Night firelight on the side facing the fire. */
  glowSide?: 'left';
}

// Cars, particles, the light flicker, and the greeting come with the second scenery slice.
class Painter {
  readonly ctx: CanvasRenderingContext2D;
  readonly f: SceneFrame;
  readonly night: boolean;
  readonly rnd: () => number;
  beaver: Box | null = null;

  constructor(ctx: CanvasRenderingContext2D, f: SceneFrame) {
    this.ctx = ctx;
    this.f = f;
    this.night = f.theme === 'night';
    this.rnd = mulberry(f.seed);
  }

  get W() {
    return this.f.width;
  }

  get H() {
    return sceneRows(this.f.scene);
  }

  px(x: number, y: number, w: number, h: number, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.round(x), Math.round(y), w, h);
  }

  dither(x: number, y: number, w: number, h: number, c1: string, c2: string) {
    for (let j = 0; j < h; j++)
      for (let i = 0; i < w; i++) this.px(x + i, y + j, 1, 1, (x + i + y + j) % 2 ? c1 : c2);
  }

  sprite(rows: string[], colors: Palette, x: number, y: number) {
    rows.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        const color = colors[row[i]];
        if (color) this.px(x + i, y + j, 1, 1, color);
      }
    });
  }

  circle(cx: number, cy: number, r: number, color: string, light?: string) {
    for (let y = -r; y <= r; y++)
      for (let x = -r; x <= r; x++)
        if (x * x + y * y <= r * r + r * 0.6)
          this.px(
            cx + x,
            cy + y,
            1,
            1,
            light && x + y < -r * 0.6 && (x + y) % 2 === 0 ? light : color,
          );
  }

  /** Warm light as a sparse dither of solid pixels (the flicker comes with the greeting slice). */
  glow(cx: number, cy: number, r: number, color: string) {
    for (let y = -r; y <= r; y++)
      for (let x = -r; x <= r; x++) {
        const d = x * x + y * y;
        if (d <= r * r && (x + y) % 2 === 0 && (d < (r * r) / 3 || (x * 7 + y * 3) % 4 === 0))
          this.px(cx + x, cy + y, 1, 1, color);
      }
  }

  ground(x0: number, y0: number, w: number, h: number) {
    paintGround(this.ctx, this.f.scene, this.f.theme, x0, y0, w, h);
  }

  /** Idle animation: breathing bob, blinks, and a tail wag. */
  drawBeaver(x: number, y: number, pose: BeaverPose) {
    const { frame, still } = this.f;
    const sleepy = pose.eyes === 'closed';
    const bob = still ? 0 : Math.floor(frame / (sleepy ? 9 : 5)) % 2;
    let eyes = pose.eyes;
    if (eyes === 'open' && !still && frame % 28 < 2) eyes = 'closed';
    const eyeRow = this.eyeRow(eyes, pose.look ?? 0);
    const wag = !still && Math.floor(frame / 3) % 4 === 0;
    const x0 = Math.round(x);
    const y0 = Math.round(y);
    for (let j = 0; j < BEAVER.length; j++) {
      const row = j === 4 ? eyeRow : BEAVER[j];
      for (let i = 0; i < row.length; i++) {
        const key = row[i];
        let color = BEAVER_COLORS[key];
        if (!color) continue;
        let dy = j <= 8 ? bob : 0;
        if (i < 5 && j >= 10) dy = wag ? -1 : 0;
        const col = pose.flip ? row.length - 1 - i : i;
        if (
          pose.glowSide &&
          this.night &&
          (key === 'B' || key === 'L') &&
          col < 8 &&
          (col + j + Math.floor(frame / 2)) % 2 === 0
        )
          color = key === 'B' ? '#f2a65a' : '#ffe2b0';
        this.px(x0 + col, y0 + j + dy, 1, 1, color);
      }
    }
    this.beaver = { x: x0, y: y0, w: BEAVER_WIDTH, h: BEAVER.length };
  }

  eyeRow(eyes: Eyes, look: number): string {
    const row = '....OBBBBBBBBBBBBO..'.split('');
    if (eyes === 'shades') for (let i = 6; i <= 15; i++) row[i] = 'G';
    else if (eyes === 'closed') row[7] = row[8] = row[13] = row[14] = 'O';
    else {
      row[7 + look] = 'K';
      row[14 + look] = 'K';
    }
    return row.join('');
  }

  zz(x: number, y: number) {
    const color = this.night ? '#e8edf7' : '#232629';
    const t = this.f.still ? 0 : Math.floor(this.f.frame / 6) % 3;
    this.sprite(['KKK', '..K', '.K.', 'KKK'], { K: color }, x + t, y - t * 2);
  }

  steam(x: number, y: number) {
    const color = this.night ? '#5a6478' : '#c9cfd6';
    if (this.f.still) {
      this.px(x, y - 2, 1, 1, color);
      return;
    }
    for (let k = 0; k < 3; k++) {
      const t = (this.f.frame + k * 4) % 12;
      this.px(x + (Math.floor(t / 3) % 2), y - 1 - t / 2, 1, 1, color);
    }
  }

  cup(x: number, y: number) {
    this.px(x, y, 3, 3, '#ffffff');
    this.px(x + 3, y + 1, 1, 1, '#ffffff');
    this.px(x, y, 3, 1, '#6c3200');
    this.steam(x + 1, y);
  }

  tree(x: number, base: number, r: number, P: Palette) {
    this.px(x - 1, base - r, 2, r, P.trunk);
    this.circle(x, base - r - r * 0.8, r, P.leaf, P.leafLight);
  }

  pine(x: number, base: number, h: number, P: Palette) {
    this.px(x, base - 3, 1, 3, P.trunk);
    for (let i = 0; i < h; i++) {
      const w = Math.max(1, Math.floor((i / h) * h * 0.45));
      this.px(x - w, base - 3 - h + i, w * 2 + 1, 1, i % 3 === 0 ? P.pineLight : P.pine);
    }
  }

  lamp(x: number, base: number, P: Palette) {
    if (this.night) this.glow(x, base - 18, 5, '#7a6430');
    this.px(x, base - 18, 1, 18, P.metal);
    this.px(x - 1, base - 19, 3, 2, this.night ? '#ffd166' : P.metal);
  }

  grassGround(P: Palette) {
    const { W, H, rnd } = this;
    this.px(0, GROUND, W, 3, P.grass);
    this.ground(0, GROUND + 3, W, H - GROUND - 3);
    for (let x = 0; x < W; x++) {
      if (rnd() < 0.35) this.px(x, GROUND - 1, 1, 1, P.grass);
      if (rnd() < 0.15) this.px(x, GROUND - 2, 1, 1, P.grassDark);
      if (rnd() < 0.25) this.px(x, GROUND + 3, 1, 1, P.grassDark);
    }
  }
}

const CASTLE = [
  '..R.....R...',
  '..Y.....Y...',
  '.YYY...YYY..',
  '.YyY...YyY..',
  '.YYYYYYYYY..',
  '.YYyYYYyYY..',
  'YYYYYYYYYYY.',
  'YYYYyYYYYYYY',
];
const BUCKET = ['.KKK.', 'B...B', 'BBBBB', 'BbBBB', '.BBB.'];

const SCENE_ART: Record<SceneName, (p: Painter, P: Palette) => void> = {
  park(p, P) {
    const { W, rnd, f } = p;
    for (let x = 0; x < W; x++) {
      const h1 = 14 + Math.sin(x / 23 + f.seed) * 5 + Math.sin(x / 9) * 1.5;
      p.px(x, GROUND - h1, 1, h1, P.hillFar);
      const h2 = 7 + Math.sin(x / 15 + f.seed * 2) * 3;
      p.px(x, GROUND - h2, 1, h2, P.hillNear);
    }
    p.grassGround(P);
    for (let t = 6; t < W; t += 26 + Math.floor(rnd() * 22))
      p.tree(t, GROUND, 5 + Math.floor(rnd() * 3), P);
    for (let b = 18; b < W; b += 40 + Math.floor(rnd() * 30))
      p.circle(b, GROUND - 2, 3, P.leaf, P.leafLight);
    const bx = Math.floor(W * 0.55);
    for (let l = 30; l < W; l += 70) if (Math.abs(l - bx - 10) > 14) p.lamp(l, GROUND, P);
    // bench
    p.px(bx, GROUND - 6, 20, 1, P.wood);
    p.px(bx, GROUND - 9, 20, 1, P.wood);
    p.px(bx + 1, GROUND - 5, 1, 5, P.woodDark);
    p.px(bx + 18, GROUND - 5, 1, 5, P.woodDark);
    if (p.night) {
      p.drawBeaver(bx + 1, GROUND - 23, { eyes: 'closed' });
      p.zz(bx + 16, GROUND - 29);
    } else {
      p.drawBeaver(bx + 1, GROUND - 23, { eyes: 'open' });
      p.cup(bx + 14, GROUND - 13);
    }
  },

  beach(p, P) {
    const { W, H, rnd, f } = p;
    const sea = GROUND - 10;
    p.px(0, sea, W, 10, P.sea);
    const phase = f.still ? 0 : Math.floor(f.frame / 4);
    for (let x = 0; x < W; x++) {
      if ((x + phase) % 9 === 0) p.px(x, sea + 2 + (x % 3), 2, 1, P.wave);
      if ((x * 7 + phase) % 23 === 0) p.px(x, sea + 6, 3, 1, P.wave);
    }
    if (p.night)
      for (let m = 0; m < 6; m++)
        p.px(Math.floor(W * 0.8) - m, sea + 1 + m * 1.5, 3 + m, 1, '#f5e6dc');
    p.px(0, GROUND, W, 7, P.sand);
    p.dither(0, GROUND, W, 1, P.sand, P.wave);
    for (let s = 0; s < W; s += 3)
      if (rnd() < 0.3) p.px(s, GROUND + 2 + Math.floor(rnd() * 4), 1, 1, P.sandDark);
    // dry sand on top, then the deeper sand texture that continues into the contact area
    p.dither(0, GROUND + 7, W, 2, P.sand, P.groundBase);
    p.ground(0, GROUND + 9, W, H - GROUND - 9);
    [0.08, 0.2, 0.86].forEach((at, i) => {
      const p0 = Math.floor(W * at);
      const h = 22 + i * 3;
      for (let y = 0; y < h; y++)
        p.px(p0 + Math.floor(Math.sin(y / 7) * 2), GROUND - y, 2, 1, y % 3 ? P.trunk : P.trunkDark);
      const tx = p0 + Math.floor(Math.sin(h / 7) * 2) + 1;
      const ty = GROUND - h;
      const fronds = [
        [-1, 0.7, 0.09, 10],
        [1, 0.7, 0.09, 10],
        [-1, 1.1, 0.12, 7],
        [1, 1.1, 0.12, 7],
        [-1, 0.2, 0.08, 8],
        [1, 0.2, 0.08, 8],
      ];
      for (const [dir, rise, droop, length] of fronds)
        for (let k = 1; k <= length; k++) {
          const fx = tx + dir * k;
          const fy = ty - rise * k + droop * k * k;
          p.px(fx, fy, 1, 1, P.leaf);
          if (k % 2 === 0 && k < length) p.px(fx, fy + 1, 1, 1, P.leafLight);
        }
      p.px(tx - 1, ty, 3, 2, P.trunkDark);
    });
    // umbrella
    const ux = Math.floor(W * 0.45);
    p.px(ux, GROUND - 16, 1, 16, '#e8edf7');
    for (let w = -9; w <= 9; w++) {
      const hh = Math.round(Math.sqrt(81 - w * w) * 0.5);
      p.px(
        ux + w,
        GROUND - 16 - hh,
        1,
        hh + 1,
        Math.floor((w + 9) / 3) % 2 ? '#ffffff' : '#ff5e24',
      );
    }
    // sandcastle with a bucket; the beaver pats the sand by day
    const cx = ux + 26;
    p.sprite(CASTLE, { Y: P.castle, y: P.castleDark, R: '#ff5e24' }, cx, GROUND - 6);
    p.sprite(BUCKET, { K: '#8b93a1', B: '#3fa9f5', b: '#bfe6ff' }, cx + 14, GROUND - 3);
    if (p.night) {
      p.drawBeaver(ux + 4, GROUND - 15, { eyes: 'closed' });
      p.zz(ux + 20, GROUND - 21);
    } else {
      p.drawBeaver(ux + 4, GROUND - 15, { eyes: 'shades' });
      const pat = f.still ? 0 : Math.floor(f.frame / 2) % 2;
      p.px(ux + 22, GROUND - 6 - pat * 2, 3, 2, BEAVER_COLORS.B);
      p.px(ux + 22, GROUND - 7 - pat * 2, 3, 1, BEAVER_COLORS.O);
    }
  },

  city(p, P) {
    const { W, H, rnd, f } = p;
    let x = 0;
    while (x < W) {
      const bw = 8 + Math.floor(rnd() * 12);
      const bh = 14 + Math.floor(rnd() * 30);
      p.px(x, GROUND - 4 - bh, bw, bh, rnd() < 0.5 ? P.far : P.far2);
      for (let wy = GROUND - bh; wy < GROUND - 6; wy += 3)
        for (let wx = x + 2; wx < x + bw - 1; wx += 3) {
          let lit = p.night && rnd() < 0.45;
          // a few windows switch on and off at night
          if (lit && !f.still && (wx * 13 + wy * 7 + Math.floor(f.frame / 25)) % 37 === 0)
            lit = false;
          p.px(wx, wy, 1, 1, lit ? '#ffd166' : P.window);
        }
      if (rnd() < 0.2) p.px(x + Math.floor(bw / 2), GROUND - 4 - bh - 4, 1, 4, P.far2);
      x += bw + Math.floor(rnd() * 2);
    }
    // upper sidewalk, a two-lane road, then a lower sidewalk that continues into the contact area
    p.px(0, GROUND - 4, W, 4, P.sidewalk);
    p.px(0, GROUND - 1, W, 1, P.curb);
    p.px(0, GROUND, W, 22, P.road);
    for (let d = 2; d < W; d += 12) p.px(d, GROUND + 10, 6, 1, P.dash);
    p.px(0, GROUND + 22, W, 1, P.curb);
    p.ground(0, GROUND + 23, W, H - GROUND - 23);
    // cafe
    const cx = Math.floor(W * 0.5);
    for (let l = 12; l < W; l += 48) if (l < cx - 42 || l > cx + 38) p.lamp(l, GROUND - 4, P);
    p.px(cx, GROUND - 26, 34, 22, '#f5e6dc');
    for (let a = 0; a < 34; a += 2) p.px(cx + a, GROUND - 22, 2, 3, a % 4 ? '#ffffff' : '#ff5e24');
    p.px(cx + 3, GROUND - 17, 12, 9, p.night ? '#ffd166' : '#7cc6f2');
    p.px(cx + 24, GROUND - 17, 6, 13, '#6c3200');
    p.px(cx + 6, GROUND - 25, 22, 2, '#6c3200');
    if (p.night) p.dither(cx + 2, GROUND - 4, 14, 3, P.sidewalk, '#7a6430');
    // the beaver looks left, ahead, then right toward the street, cup on the table
    const look = f.still ? 0 : [0, -1, 0, 1][Math.floor(f.frame / 20) % 4];
    p.drawBeaver(cx - 34, GROUND - 21, { eyes: 'open', look, flip: true });
    p.px(cx - 13, GROUND - 11, 10, 1, '#5c6066');
    p.px(cx - 8, GROUND - 10, 1, 6, '#5c6066');
    p.px(cx - 10, GROUND - 5, 5, 1, '#5c6066');
    p.cup(cx - 11, GROUND - 14);
  },

  mountain(p, P) {
    const { W, rnd, f } = p;
    const range = (peaks: { x: number; h: number }[], color: string, snow?: string) => {
      for (const peak of peaks)
        for (let x = peak.x - peak.h * 1.6; x <= peak.x + peak.h * 1.6; x++) {
          const height = peak.h - Math.abs(x - peak.x) / 1.6;
          if (height <= 0) continue;
          p.px(x, GROUND - height, 1, height, color);
          if (snow && height > peak.h - 5 - ((x * 3) % 3))
            p.px(x, GROUND - height, 1, Math.max(1, height - (peak.h - 5)), snow);
        }
    };
    const far: { x: number; h: number }[] = [];
    const near: { x: number; h: number }[] = [];
    for (let x = -10; x < W + 20; x += 34 + Math.floor(rnd() * 20))
      far.push({ x, h: 22 + Math.floor(rnd() * 12) });
    for (let x = 10; x < W + 20; x += 28 + Math.floor(rnd() * 18))
      near.push({ x, h: 12 + Math.floor(rnd() * 8) });
    range(far, P.far, P.snow);
    range(near, P.near);
    p.grassGround(P);
    for (let x = 4; x < W; x += 9 + Math.floor(rnd() * 14))
      if (Math.abs(x - W * 0.55 - 10) > 34) p.pine(x, GROUND, 8 + Math.floor(rnd() * 6), P);
    // tent
    const tx = Math.floor(W * 0.55);
    for (let r = 0; r < 12; r++)
      p.px(tx - r, GROUND - 12 + r, r * 2 + 1, 1, r % 4 === 0 ? '#c2410c' : '#ff5e24');
    p.px(tx - 2, GROUND - 6, 5, 6, '#101828');
    // campfire
    const fx = tx + 22;
    if (p.night) p.glow(fx, GROUND - 4, 10, '#6a3a12');
    p.px(fx - 3, GROUND - 1, 7, 1, '#6c3200');
    p.px(fx - 2, GROUND - 2, 5, 1, '#3b1c02');
    const flick = f.still ? 0 : f.frame % 3;
    const flames: [number, number, number, string][] = [
      [0, -3, 3, '#ff5e24'],
      [0, -5, 1, '#ffd166'],
      [-1, -4, 1, '#ff5e24'],
      [1, -6 + flick, 1, '#ffd166'],
      [-1, -7 + flick, 1, '#ff5e24'],
    ];
    for (const [dx, dy, w, color] of flames)
      p.px(fx + dx - Math.floor(w / 2), GROUND + dy, w, 2, color);
    // roasting a marshmallow over the fire; firelight on the side facing it at night
    p.drawBeaver(fx + 5, GROUND - 17, { eyes: 'open', flip: true, glowSide: 'left' });
    const dip = f.still ? 0 : Math.floor(f.frame / 8) % 2;
    p.px(fx + 1, GROUND - 10 + dip, 7, 1, '#8a4a12');
    p.px(fx - 1, GROUND - 11 + dip, 2, 2, '#ffffff');
  },
};

const PALETTES: Record<SceneName, Record<Theme, Palette>> = {
  park: {
    day: {
      hillFar: '#b9e1a8',
      hillNear: '#94cf7d',
      grass: '#6abf4b',
      grassDark: '#3f8f3a',
      leaf: '#3f8f3a',
      leafLight: '#7fd05f',
      trunk: '#6c3200',
      wood: '#8a4a12',
      woodDark: '#6c3200',
      metal: '#5c6066',
    },
    night: {
      hillFar: '#1a2b3e',
      hillNear: '#20392f',
      grass: '#2d5a3a',
      grassDark: '#1e3f2b',
      leaf: '#1e3f2b',
      leafLight: '#2d5a3a',
      trunk: '#3b1c02',
      wood: '#5a3010',
      woodDark: '#3b1c02',
      metal: '#a3afcb',
    },
  },
  beach: {
    day: {
      sea: '#3fa9f5',
      wave: '#bfe6ff',
      sand: '#f2d38a',
      sandDark: '#d9b566',
      groundBase: '#f2d38a',
      trunk: '#8a4a12',
      trunkDark: '#6c3200',
      leaf: '#3f8f3a',
      leafLight: '#6abf4b',
      castle: '#e6c06a',
      castleDark: '#c9a24f',
    },
    night: {
      sea: '#1e3a6e',
      wave: '#3c5a92',
      sand: '#7d6c48',
      sandDark: '#5e5034',
      groundBase: '#3a3222',
      trunk: '#4a2a10',
      trunkDark: '#3b1c02',
      leaf: '#1e3f2b',
      leafLight: '#2d5a3a',
      castle: '#6e5f40',
      castleDark: '#564a32',
    },
  },
  city: {
    day: {
      far: '#b7cbe8',
      far2: '#a3bbdf',
      window: '#dce8f7',
      sidewalk: '#c9cfd6',
      curb: '#8b93a1',
      road: '#4a4f57',
      dash: '#e8edf7',
      metal: '#5c6066',
    },
    night: {
      far: '#18244a',
      far2: '#1f2d58',
      window: '#26335a',
      sidewalk: '#3a4258',
      curb: '#2a3044',
      road: '#1a1d26',
      dash: '#a3afcb',
      metal: '#a3afcb',
    },
  },
  mountain: {
    day: {
      far: '#9fb7d8',
      near: '#7795c4',
      snow: '#ffffff',
      grass: '#6abf4b',
      grassDark: '#3f8f3a',
      pine: '#2f7a44',
      pineLight: '#3f8f3a',
      trunk: '#6c3200',
    },
    night: {
      far: '#1c2a55',
      near: '#243669',
      snow: '#a3afcb',
      grass: '#2d5a3a',
      grassDark: '#1e3f2b',
      pine: '#16342a',
      pineLight: '#1e3f2b',
      trunk: '#3b1c02',
    },
  },
};

/** Draws one frame and returns where the beaver is, in scene pixels. */
export function drawScene(ctx: CanvasRenderingContext2D, frame: SceneFrame): Box | null {
  const painter = new Painter(ctx, frame);
  ctx.clearRect(0, 0, frame.width, sceneRows(frame.scene));
  SCENE_ART[frame.scene](painter, PALETTES[frame.scene][frame.theme]);
  return painter.beaver;
}
