import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { useDocumentTitle } from '../hooks/useDocumentTitle.ts';
import { useNoIndex } from '../hooks/useNoIndex.ts';

// 404 (specs/04-pages.md, Q4.26): the message and a way home. The beaver in the scene below
// keeps the visitor company, as on every page.
export function NotFoundPage() {
  const { t } = useTranslation('notFound');
  useDocumentTitle(t('common:title.page', { page: t('title') }));
  useNoIndex();

  return (
    <>
      <h1 className="font-display text-6xl leading-none">404</h1>
      <p className="mt-4 text-xl font-semibold">{t('title')}</p>
      <p className="mt-2 text-muted">{t('body')}</p>
      <Link
        to="/"
        className="mt-6 inline-flex min-h-11 items-center rounded-md bg-accent px-5 font-semibold text-on-accent"
      >
        {t('home')}
      </Link>
    </>
  );
}
