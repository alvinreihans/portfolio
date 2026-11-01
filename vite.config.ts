/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

/** The two font files every page shows above the fold (Manrope body, Jersey 10 headings). */
const ABOVE_THE_FOLD_FONTS = [
  /^manrope-latin-wght-normal-.+\.woff2$/,
  /^jersey-10-latin-400-normal-.+\.woff2$/,
];

// Preloads the main fonts (specs/02-design-system.md). In an SPA the browser only finds them
// after it reads the CSS, so they used to arrive after the first render: the text swapped
// font and the page shifted. Fails the build if a font package renames its files.
function preloadFonts(): Plugin {
  return {
    name: 'preload-fonts',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        const files = Object.keys(ctx.bundle ?? {}).filter((file) =>
          ABOVE_THE_FOLD_FONTS.some((pattern) => pattern.test(file.split('/').pop()!)),
        );
        if (files.length !== ABOVE_THE_FOLD_FONTS.length) {
          throw new Error(
            `preload-fonts: expected ${ABOVE_THE_FOLD_FONTS.length} fonts, found ${files.join(', ')}`,
          );
        }
        return files.map((file) => ({
          tag: 'link',
          attrs: {
            rel: 'preload',
            href: `/${file}`,
            as: 'font',
            type: 'font/woff2',
            crossorigin: '',
          },
          injectTo: 'head' as const,
        }));
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), preloadFonts()],
  test: {
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.mjs'],
  },
});
