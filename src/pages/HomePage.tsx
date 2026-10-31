import { useTranslation } from 'react-i18next';

import { Hero } from '../components/home/Hero.tsx';
import { TechStack } from '../components/home/TechStack.tsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts';

// Experience, Works, and Contact content arrives in later slices; the ids are what
// the navbar and hero links target.
export function HomePage() {
  const { t } = useTranslation('home');
  useDocumentTitle(t('common:title.home'));

  return (
    <>
      <Hero />
      <TechStack />

      <section id="experience" className="mt-24 min-h-[60vh]">
        <h2 className="font-display text-5xl leading-none">{t('experience.heading')}</h2>
      </section>
      <section id="works" className="mt-24 min-h-[60vh]">
        <h2 className="font-display text-5xl leading-none">{t('works.heading')}</h2>
      </section>
      <section id="contact" className="mt-24 min-h-[40vh]">
        <h2 className="font-display text-5xl leading-none">{t('contact.heading')}</h2>
        <p className="mt-4 max-w-[60ch] text-muted">{t('contact.body')}</p>
      </section>
    </>
  );
}
