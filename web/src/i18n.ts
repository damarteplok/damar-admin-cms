import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import id from './locales/id.json'

// Initialize i18n. Only attach the browser language detector when running in
// the browser to avoid server-side issues (no localStorage / navigator there).
const initOptions: any = {
  resources: { en: { translation: en }, id: { translation: id } },
  fallbackLng: 'en',
  debug: false,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
}

if (typeof window === 'undefined') {
  // Server-side: initialize i18n without browser-only detectors
  i18n.use(initReactI18next).init(initOptions)
} else {
  // Client-side: dynamically import the browser language detector to avoid
  // using `require` (not available in ESM/browser) and to keep the module
  // from being evaluated during SSR.
  import('i18next-browser-languagedetector')
    .then((mod) => {
      const LanguageDetector = (mod && (mod as any).default) || (mod as any)

      // attach detector and enable localStorage caching
      i18n.use(new LanguageDetector())
      initOptions.detection = {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      }

      return i18n.use(initReactI18next).init(initOptions)
    })
    .catch(() => {
      // If loading the detector fails for any reason, fall back to basic init
      i18n.use(initReactI18next).init(initOptions)
    })
}

export default i18n
