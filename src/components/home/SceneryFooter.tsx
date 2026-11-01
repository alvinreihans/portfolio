import { lazy, Suspense, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { EMAIL } from '../../content/links.ts';
import { useTheme } from '../../theme/store.ts';
import { SocialLinks } from '../SocialLinks.tsx';
import { groundPalette, groundTile, SCENE_SCALE, sceneRows, VISIT } from './scenery.ts';

const Scene = lazy(() => import('./Scene.tsx'));

// Every page ends here (specs/07-scenery.md, Q7.9): the pixel scene, then Contact and the
// footer on the scene's ground texture.
export function SceneryFooter() {
  const { t } = useTranslation('home');
  const theme = useTheme();
  const ground = groundPalette(VISIT.scene, theme);
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

            {/* Mail first, then the profiles (Q4.27). */}
            <SocialLinks
              className="mt-5 -ml-3"
              mail={{ href: mailto, label: t('contact.email') }}
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
