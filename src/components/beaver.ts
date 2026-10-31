// The beaver mascot sprite (specs/07-scenery.md), drawn after the owner's reference image.
// One source for the scenes, the favicon, and the Open Graph image
// (scripts/generate-brand.mjs imports this file, so it uses erasable TypeScript only).

/** O outline, B fur, L belly, K eyes, T teeth, D tail, G sunglasses. Fixed in both themes. */
export const BEAVER_COLORS: Record<string, string> = {
  O: '#6c3200',
  B: '#e0832e',
  L: '#f7c98b',
  K: '#3b1c02',
  T: '#ffffff',
  D: '#a5541a',
  G: '#101828',
};

export const BEAVER = [
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

export const BEAVER_WIDTH = BEAVER[0].length;
export const BEAVER_HEIGHT = BEAVER.length;

export type Eyes = 'open' | 'closed' | 'wide' | 'shades';

/** Rows 3 and 4 of the sprite for the given eyes; 'wide' adds a pixel above each eye. */
export function eyeRows(eyes: Eyes, look = 0): Record<number, string> {
  const row4 = '....OBBBBBBBBBBBBO..'.split('');
  const row3 = BEAVER[3].split('');
  if (eyes === 'shades') for (let i = 6; i <= 15; i++) row4[i] = 'G';
  else if (eyes === 'closed') row4[7] = row4[8] = row4[13] = row4[14] = 'O';
  else {
    row4[7 + look] = 'K';
    row4[14 + look] = 'K';
    if (eyes === 'wide') {
      row3[7 + look] = 'K';
      row3[14 + look] = 'K';
    }
  }
  return { 3: row3.join(''), 4: row4.join('') };
}

/** The whole sprite with the given eyes. */
export function beaverRows(eyes: Eyes, look = 0): string[] {
  const swap = eyeRows(eyes, look);
  return BEAVER.map((row, j) => swap[j] ?? row);
}

/** The head only (rows 0 to 7), closed off at the chin, for the favicon. */
export function beaverHead(): string[] {
  return [...BEAVER.slice(0, 8), '......OOOOOOOOOO....'];
}

/** Merges runs of one colour on a row into [x, y, width, colour] rects, for SVG output. */
export function spriteRects(rows: string[]): [number, number, number, string][] {
  const rects: [number, number, number, string][] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      let end = x + 1;
      while (end < row.length && row[end] === row[x]) end++;
      const color = BEAVER_COLORS[row[x]];
      if (color) rects.push([x, y, end - x, color]);
      x = end;
    }
  });
  return rects;
}
