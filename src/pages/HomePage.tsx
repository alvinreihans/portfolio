import { useTranslation } from 'react-i18next';

import { useDocumentTitle } from '../hooks/useDocumentTitle.ts';

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
    </>
  );
}
