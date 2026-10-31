import { useTranslation } from 'react-i18next';

import { useDocumentTitle } from '../hooks/useDocumentTitle.ts';

// Section content arrives in later slices; the ids are what the navbar links target.
export function HomePage() {
  const { t } = useTranslation('home');
  useDocumentTitle(t('common:title.home'));

  return (
    <>
      <h1 className="font-display text-6xl leading-none">
        {t('hero.titleLine1')}{' '}
        <span className="block text-accent-display">{t('hero.titleLine2')}</span>
      </h1>
      <p className="mt-6 max-w-[560px] text-muted">{t('hero.lead')}</p>

      <section id="experience" className="mt-24 min-h-[60vh] scroll-mt-24">
        <h2 className="font-display text-5xl leading-none">{t('experience.heading')}</h2>
      </section>
      <section id="works" className="mt-24 min-h-[60vh] scroll-mt-24">
        <h2 className="font-display text-5xl leading-none">{t('works.heading')}</h2>
      </section>
      <section id="contact" className="mt-24 min-h-[40vh] scroll-mt-24">
        <h2 className="font-display text-5xl leading-none">{t('contact.heading')}</h2>
        <p className="mt-4 max-w-[60ch] text-muted">{t('contact.body')}</p>
      </section>
    </>
  );
}
