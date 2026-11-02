import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { cvLinks, type CvLang } from '../content/cv.ts';
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts';

const BUTTON =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 text-[0.95rem] font-semibold';

// /cv (specs/04-pages.md, "Halaman CV"): a live preview of the public Google Docs CV in the
// active language, with a PDF download and an "open in new tab" link to the same document.
export function CvPage() {
  const { t, i18n } = useTranslation('cv');
  useDocumentTitle(t('common:title.page', { page: 'CV' }));
  const lang: CvLang = i18n.resolvedLanguage === 'en' ? 'en' : 'id';
  const links = cvLinks(lang);
  const external = t('common:externalLink');

  return (
    <>
      <Link to="/" className="flex min-h-11 w-fit items-center font-semibold text-accent-text">
        ← {t('back')}
      </Link>
      <p className="mt-4 flex w-fit items-center gap-2 rounded-md bg-chip px-2.5 py-1 text-xs font-bold tracking-[0.06em] text-muted uppercase">
        <span aria-hidden="true" className="size-2 bg-accent" />
        {t('badge')}
      </p>
      <h1 className="mt-4 font-display text-[clamp(3rem,8vw,4.5rem)] leading-[0.9]">
        <span className="text-accent-display">CV</span> Alvin Reihansyah Makarim
      </h1>
      <p className="mt-4 max-w-[60ch] text-muted">{t('intro')}</p>

      <div className="mt-6 grid gap-3 sm:flex">
        <a
          href={links.pdf}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${t('download')} ${external}`}
          className={`${BUTTON} bg-accent text-on-accent`}
        >
          <svg
            viewBox="0 0 16 16"
            className="size-4"
            shapeRendering="crispEdges"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M7 1h2v8h2l-3 3-3-3h2zM2 13h12v2H2z" />
          </svg>
          {t('download')}
        </a>
        <a
          href={links.preview}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${t('openNewTab')} ${external}`}
          className={`${BUTTON} theme-fade bg-card hover:bg-chip`}
        >
          {t('openNewTab')}
          <span aria-hidden="true">↗</span>
        </a>
      </div>

      <div className="theme-fade mt-6 rounded-xl border border-line bg-card p-2 shadow-card sm:p-3">
        {/* Keyed by language, so switching language loads the other document and shows the
            loading text again until it arrives. */}
        <CvFrame key={lang} src={links.preview} title={t('frameTitle')} loading={t('loading')} />
      </div>
      <p className="mt-3 text-sm text-muted">{t('hint')}</p>
    </>
  );
}

function CvFrame({ src, title, loading }: { src: string; title: string; loading: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative h-[70vh] overflow-hidden rounded-lg bg-card-band sm:h-[min(80vh,1100px)]">
      {!loaded && (
        <p className="absolute inset-0 grid place-items-center text-sm text-muted">{loading}</p>
      )}
      <iframe
        src={src}
        title={title}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className="relative block size-full border-0 bg-white"
        style={{ opacity: loaded ? 1 : 0 }}
      />
    </div>
  );
}
