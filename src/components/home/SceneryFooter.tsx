import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { EMAIL } from '../../content/links.ts';
import { useTheme } from '../../theme/store.ts';
import { SocialLinks } from '../SocialLinks.tsx';
import { groundPalette, groundTile, SCENE_SCALE, sceneRows, VISIT } from './scenery.ts';

const Scene = lazy(() => import('./Scene.tsx'));

const BUTTON =
  'inline-flex min-h-11 items-center justify-center rounded-md px-5 text-[0.95rem] font-semibold';
const COPIED_MS = 2000;

// Every page ends here (specs/07-scenery.md, Q7.9): the pixel scene, then Contact and the
// footer on the scene's ground texture.
export function SceneryFooter() {
  const { t } = useTranslation('home');
  const theme = useTheme();
  const ground = groundPalette(VISIT.scene, theme);
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      return; // The button keeps its label; "Send email" still works.
    }
    setCopied(true);
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopied(false), COPIED_MS);
  };

  const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(t('common:contact.mailSubject'))}`;

  const groundStyle = {
    backgroundColor: ground.base,
    backgroundImage: `url(${groundTile(VISIT.scene, theme)})`,
    backgroundSize: `${32 * SCENE_SCALE}px ${16 * SCENE_SCALE}px`,
    '--ground-ink': ground.ink,
    '--ground-base': ground.base,
    // Focus rings follow the text colour, which is checked against every texture colour.
    '--focus': ground.ink,
  } as CSSProperties;

  return (
    <>
      {/* Reserves the scene's height before the lazy canvas arrives (no layout shift). */}
      <div style={{ height: sceneRows(VISIT.scene) * SCENE_SCALE }}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </div>

      <footer
        style={groundStyle}
        className="text-(--ground-ink) [image-rendering:pixelated] [&_h2,&_p,&_small]:[text-shadow:0_0_2px_var(--ground-base),0_0_6px_var(--ground-base),0_0_10px_var(--ground-base)]"
      >
        <div className="mx-auto max-w-[1200px] px-6 pt-10 pb-8">
          <section id="contact" aria-labelledby="contact-title">
            <h2 id="contact-title" className="font-display text-5xl leading-none sm:text-6xl">
              {t('contact.heading')}
            </h2>
            <p className="mt-4 max-w-[60ch] font-semibold">{t('contact.body')}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href={mailto} className={`${BUTTON} bg-accent text-on-accent`}>
                {t('contact.email')}
              </a>
              <button
                type="button"
                onClick={copyEmail}
                className={`${BUTTON} theme-fade cursor-pointer bg-nav text-ink`}
              >
                {copied ? t('contact.copied') : t('contact.copy')}
              </button>
            </div>
            <p aria-live="polite" className="sr-only">
              {copied ? t('contact.copied') : ''}
            </p>

            <SocialLinks
              className="mt-4 -ml-3"
              linkClassName="text-(--ground-ink) hover:bg-[color-mix(in_srgb,var(--ground-ink)_15%,transparent)]"
            />
          </section>

          <small className="mt-8 block text-sm font-semibold">
            © {new Date().getFullYear()} alvinreihans
          </small>
        </div>
      </footer>
    </>
  );
}
