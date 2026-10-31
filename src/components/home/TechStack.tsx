import { useTranslation } from 'react-i18next';

import { STACK } from '../../content/stack.ts';

export function TechStack() {
  const { t } = useTranslation('home');

  return (
    <section aria-labelledby="stack-title" className="mt-16">
      <h2 id="stack-title" className="font-display text-5xl leading-none">
        {t('stack.heading')}
      </h2>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STACK.map(({ group, items }) => (
          <li
            key={group}
            className="theme-fade rounded-xl border border-line bg-card p-5 shadow-card"
          >
            <h3 className="text-xs font-bold tracking-[0.06em] text-accent-text uppercase">
              {t(`stack.groups.${group}`)}
            </h3>
            <p className="mt-2 text-[0.95rem] text-muted">
              {items
                .map((item) => (typeof item === 'string' ? item : t(`stack.items.${item.key}`)))
                .join(' · ')}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
