import { describe, expect, it } from 'vitest';

import { CV_DOCUMENTS, cvLinks } from './cv.ts';

describe('cvLinks', () => {
  it('builds the preview and PDF links from the document ID', () => {
    expect(cvLinks('id')).toEqual({
      preview: `https://docs.google.com/document/d/${CV_DOCUMENTS.id}/preview`,
      pdf: `https://docs.google.com/document/d/${CV_DOCUMENTS.id}/export?format=pdf`,
      text: `https://docs.google.com/document/d/${CV_DOCUMENTS.id}/export?format=txt`,
    });
  });

  it('uses a different public document per language', () => {
    expect(CV_DOCUMENTS.id).not.toBe(CV_DOCUMENTS.en);
    expect(cvLinks('en').preview).toContain(CV_DOCUMENTS.en);
  });
});
