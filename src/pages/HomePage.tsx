import { useTranslation } from 'react-i18next';

import { Experience } from '../components/home/Experience.tsx';
import { Hero } from '../components/home/Hero.tsx';
import { TechStack } from '../components/home/TechStack.tsx';
import { Works } from '../components/home/Works.tsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts';

// Home page sections in order (specs/04-pages.md, Q4.1); their ids are what the navbar and
// hero links target. Contact sits in the scenery footer (RootLayout, specs/07-scenery.md).
export function HomePage() {
  const { t } = useTranslation('home');
  useDocumentTitle(t('common:title.home'));

  return (
    <>
      <Hero />
      <TechStack />

      <Experience />
      <Works />
    </>
  );
}
