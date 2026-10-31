import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

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
import { detectLanguage, LANGUAGES } from './detect.ts';
import { readSavedLanguage } from './storage.ts';

// Both languages are bundled so switching never shows empty text (specs/03-i18n.md).
const resources = {
  id: { common: idCommon, home: idHome, cv: idCv, project: idProject, notFound: idNotFound },
  en: { common: enCommon, home: enHome, cv: enCv, project: enProject, notFound: enNotFound },
};

const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language];
const initialLanguage = detectLanguage(readSavedLanguage(), browserLanguages);

i18n.on('languageChanged', (language) => {
  document.documentElement.lang = language;
});

// Synchronous init: resources are bundled, so the first render already has the right language.
void i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  supportedLngs: [...LANGUAGES],
  // Indonesian is the source language, so untranslated keys fall back to it.
  fallbackLng: 'id',
  ns: Object.keys(resources.id),
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  initAsync: false,
});

export default i18n;
