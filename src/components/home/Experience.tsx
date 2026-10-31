import { useTranslation } from 'react-i18next';

import {
  EXPERIENCE,
  formatMonth,
  layoutExperience,
  type ExperienceEvent,
  type Lang,
} from '../../content/experience.ts';

const LAYOUT = layoutExperience(EXPERIENCE);

// Experience roadmap, stage 1 (specs/04-pages.md, section 3 and Q4.15): an ordered list of
// events, newest first, each with a text label for its type and its dates in <time>. The
// branch graph is drawn beside these cards in stage 2.
export function Experience() {
  const { t, i18n } = useTranslation('home');
  const lang: Lang = i18n.resolvedLanguage === 'en' ? 'en' : 'id';

  return (
    <section id="experience" aria-labelledby="experience-title" className="mt-24">
      <h2 id="experience-title" className="font-display text-5xl leading-none">
        {t('experience.heading')}
      </h2>
      <ol className="mt-8 grid max-w-[760px] gap-3">
        {LAYOUT.rows.map((row, index) =>
          row.kind === 'event' ? (
            <li key={index}>
              <EventCard event={row.event} lang={lang} />
            </li>
          ) : null,
        )}
      </ol>
    </section>
  );
}

function EventCard({ event, lang }: { event: ExperienceEvent; lang: Lang }) {
  const { t } = useTranslation('home');
  const end = event.current ? (
    t('experience.present')
  ) : event.end ? (
    <time dateTime={event.end}>{formatMonth(event.end, lang)}</time>
  ) : null;

  return (
    <article className="theme-fade rounded-xl border border-line bg-card p-5">
      <p className="text-xs font-bold tracking-[0.06em] text-accent-text uppercase">
        {t(`experience.type.${event.type}`)}
      </p>
      <h3 className="mt-2 text-lg leading-snug font-bold">{event.title[lang]}</h3>
      <p className="mt-1 text-[0.95rem] text-muted">
        {event.org}
        {' · '}
        <time dateTime={event.date}>{formatMonth(event.date, lang)}</time>
        {end && <> – {end}</>}
      </p>
      {event.summary && <p className="mt-3 text-[0.95rem] text-muted">{event.summary[lang]}</p>}
    </article>
  );
}
