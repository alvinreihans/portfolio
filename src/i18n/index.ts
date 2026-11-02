import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { detectLanguage, LANGUAGES } from './detect.ts';
import { I18N_OPTIONS } from './resources.ts';
import { readSavedLanguage } from './storage.ts';

const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language];
const initialLanguage = detectLanguage(readSavedLanguage(), browserLanguages);

i18n.on('languageChanged', (language) => {
  document.documentElement.lang = language;
});

void i18n.use(initReactI18next).init({
  ...I18N_OPTIONS,
  lng: initialLanguage,
  supportedLngs: [...LANGUAGES],
});

export default i18n;
