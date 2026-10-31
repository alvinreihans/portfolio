import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { useDocumentTitle } from '../hooks/useDocumentTitle.ts';

export function ProjectPage() {
  const { slug = '' } = useParams();
  const { t } = useTranslation();
  // Placeholder until project content arrives (specs/06-project-stories.md).
  useDocumentTitle(t('title.page', { page: slug }));

  return <h1 className="font-display text-6xl leading-none">{slug}</h1>;
}
