// The public CV documents (specs/03-i18n.md, "CV"; specs/04-pages.md, "CV publik"). Only the
// Google Docs IDs live here; access is decided by each document's sharing setting. These are
// public copies, separate from the owner's working CV. scripts/check-cv.mjs imports this file,
// so it uses erasable TypeScript only.

export type CvLang = 'id' | 'en';

export const CV_DOCUMENTS: Record<CvLang, string> = {
  id: '1WnJymGpjutjUKlnVl9w1E_Y7MDjsQ8JQfSHttE6Ca-Y',
  en: '1V7qxwsIh7djmKD1w4_gjjlobAD08ns2i_wT6rD7-y7A',
};

const base = (id: string) => `https://docs.google.com/document/d/${id}`;

/** Preview (for the iframe and "Open in new tab") and PDF download for one language. */
export function cvLinks(lang: CvLang): { preview: string; pdf: string; text: string } {
  const id = CV_DOCUMENTS[lang];
  return {
    preview: `${base(id)}/preview`,
    pdf: `${base(id)}/export?format=pdf`,
    text: `${base(id)}/export?format=txt`,
  };
}
