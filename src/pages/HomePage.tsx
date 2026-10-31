import { useTranslation } from 'react-i18next';

import { Experience } from '../components/home/Experience.tsx';
import { Hero } from '../components/home/Hero.tsx';
import { TechStack } from '../components/home/TechStack.tsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts';

// Works content arrives in a later slice; the ids are what the navbar and
// hero links target. Contact sits in the scenery footer (RootLayout, specs/07-scenery.md).
export function HomePage() {
  const { t } = useTranslation('home');
  useDocumentTitle(t('common:title.home'));

  return (
    <>
      <Hero />
      <TechStack />

      <Experience />
      <section id="works" className="mt-24 min-h-[60vh]">
        <h2 className="font-display text-5xl leading-none">{t('works.heading')}</h2>
      </section>
    </>
  );
}
