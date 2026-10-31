// Pixel icons from specs/02-design-system.md, drawn on small grids as [x, y, width, height, fill].
// `cell` is the on-screen size of one grid pixel in CSS px.

export type PixelRect = [x: number, y: number, width: number, height: number, fill: string];

export interface PixelIconData {
  width: number;
  height: number;
  cell: number;
  rects: PixelRect[];
}

const INK = 'currentColor';
const WHITE = '#ffffff';

export const SUN: PixelIconData = {
  width: 11,
  height: 11,
  cell: 2,
  rects: [
    [4, 3, 3, 1, INK],
    [3, 4, 5, 3, INK],
    [4, 7, 3, 1, INK],
    [5, 0, 1, 2, INK],
    [5, 9, 1, 2, INK],
    [0, 5, 2, 1, INK],
    [9, 5, 2, 1, INK],
    [1, 1, 1, 1, INK],
    [2, 2, 1, 1, INK],
    [9, 1, 1, 1, INK],
    [8, 2, 1, 1, INK],
    [1, 9, 1, 1, INK],
    [2, 8, 1, 1, INK],
    [9, 9, 1, 1, INK],
    [8, 8, 1, 1, INK],
  ],
};

export const MOON: PixelIconData = {
  width: 11,
  height: 11,
  cell: 2,
  rects: [
    [4, 1, 4, 1, INK],
    [3, 2, 3, 1, INK],
    [2, 3, 3, 1, INK],
    [2, 4, 2, 3, INK],
    [2, 7, 3, 1, INK],
    [3, 8, 3, 1, INK],
    [4, 9, 4, 1, INK],
  ],
};

// A 1px outline in the text color keeps white parts of a flag visible on light backgrounds.
function framed(innerWidth: number, innerHeight: number, inner: PixelRect[]): PixelIconData {
  const width = innerWidth + 2;
  const height = innerHeight + 2;
  return {
    width,
    height,
    cell: 1,
    rects: [
      [0, 0, width, 1, INK],
      [0, height - 1, width, 1, INK],
      [0, 0, 1, height, INK],
      [width - 1, 0, 1, height, INK],
      ...inner,
    ],
  };
}

export const FLAG_ID = framed(25, 14, [
  [1, 1, 25, 7, '#ce1126'],
  [1, 8, 25, 7, WHITE],
]);

// 13 stripes at 1px each, a canton over the top 7 stripes, and stars on alternate rows.
function usFlag(): PixelIconData {
  const red = '#b22234';
  const blue = '#3c3b6e';
  const rects: PixelRect[] = [];
  for (let stripe = 0; stripe < 13; stripe++) {
    rects.push([1, 1 + stripe, 25, 1, stripe % 2 === 0 ? red : WHITE]);
  }
  rects.push([1, 1, 10, 7, blue]);
  for (let row = 1; row < 6; row += 2) {
    for (let col = row % 4 === 1 ? 1 : 2; col < 9; col += 2)
      rects.push([1 + col, 1 + row, 1, 1, WHITE]);
  }
  return framed(25, 13, rects);
}

export const FLAG_US = usFlag();
