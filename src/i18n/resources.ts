import enCommon from '../locales/en/common.json';
import enCv from '../locales/en/cv.json';
import enHome from '../locales/en/home.json';
import enNotFound from '../locales/en/notFound.json';
import enProject from '../locales/en/project.json';
import idCommon from '../locales/id/common.json';
import idCv from '../locales/id/cv.json';
import idHome from '../locales/id/home.json';
import idNotFound from '../locales/id/notFound.json';
import idProject from '../locales/id/project.json';
import type { InitOptions } from 'i18next';

// Both languages are bundled so switching never shows empty text (specs/03-i18n.md).
export const resources = {
  id: { common: idCommon, home: idHome, cv: idCv, project: idProject, notFound: idNotFound },
  en: { common: enCommon, home: enHome, cv: enCv, project: enProject, notFound: enNotFound },
};

/** Settings shared by the browser and the prerender (specs/08-prerender.md). */
export const I18N_OPTIONS = {
  resources,
  // Indonesian is the source language, so untranslated keys fall back to it.
  fallbackLng: 'id',
  ns: Object.keys(resources.id),
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  // Synchronous: resources are bundled, so the first render already has the right language.
  initAsync: false,
} satisfies InitOptions;
