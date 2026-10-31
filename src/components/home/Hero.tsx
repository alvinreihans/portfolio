import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { SocialLinks } from '../SocialLinks.tsx';
import { setHeroActionsVisible } from './heroActions.ts';
import { Sky } from './Sky.tsx';

const BUTTON =
  'inline-flex min-h-11 items-center justify-center rounded-md px-5 text-[0.95rem] font-semibold';

export function Hero() {
  const { t } = useTranslation('home');
  const actionsRef = useRef<HTMLElement>(null);

  // The navbar shows its links only after this row scrolls away (specs/04-pages.md, Q4.13).
  useEffect(() => {
    const element = actionsRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) =>
      setHeroActionsVisible(entry.isIntersecting),
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      setHeroActionsVisible(null);
    };
  }, []);

  return (
    <section aria-labelledby="hero-title" className="relative pb-8 sm:pt-8">
      <Sky />
      <div className="relative max-w-[640px]">
        <h1
          id="hero-title"
          className="font-display text-[clamp(3rem,9vw,6rem)] leading-[0.85] tracking-[-0.02em]"
        >
          {t('hero.titleLine1')}{' '}
          <span className="block text-accent-display">{t('hero.titleLine2')}</span>
        </h1>
        <p className="mt-6 max-w-[560px] text-lg text-muted">{t('hero.lead')}</p>

        <nav
          ref={actionsRef}
          aria-label={t('hero.actions')}
          className="mt-8 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3"
        >
          <Link to="/cv" className={`${BUTTON} bg-accent text-on-accent`}>
            {t('hero.cv')}
          </Link>
          <Link to="/#experience" className={`${BUTTON} theme-fade bg-card hover:bg-chip`}>
            {t('common:nav.experience')}
          </Link>
          <Link to="/#works" className={`${BUTTON} theme-fade bg-card hover:bg-chip`}>
            {t('common:nav.projects')}
          </Link>
          <Link to="/#contact" className={`${BUTTON} theme-fade bg-card hover:bg-chip`}>
            {t('common:nav.contact')}
          </Link>
        </nav>

        <SocialLinks className="mt-6 -ml-3" />
      </div>
    </section>
  );
}
