import { useTranslation } from 'react-i18next';

import { useDocumentTitle } from '../hooks/useDocumentTitle.ts';

export function CvPage() {
  const { t } = useTranslation('cv');
  useDocumentTitle(t('common:title.page', { page: 'CV' }));

  return (
    <>
      <h1 className="font-display text-6xl leading-none">
        <span className="text-accent-display">CV</span> Alvin Reihansyah Makarim
      </h1>
      <p className="mt-6 max-w-[60ch] text-muted">{t('intro')}</p>
    </>
  );
}
