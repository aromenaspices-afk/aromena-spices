import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ar from './locales/ar.json'
import en from './locales/en.json'

// اللغة: نحترم اختيار المستخدم المحفوظ، وإلّا نكشف لغة المتصفّح
// (عربيّة → عربيّ، غير ذلك → إنجليزيّ)
function detectLang() {
  try {
    const saved = localStorage.getItem('aromena_lang')
    if (saved === 'ar' || saved === 'en') return saved
    const langs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || '']
    return langs.some(l => String(l).toLowerCase().startsWith('ar')) ? 'ar' : 'en'
  } catch {
    return 'ar'
  }
}

const savedLang = detectLang()

// ضبط الاتجاه مبكّراً (قبل أوّل رسم) لتفادي وميض الاتجاه
try {
  document.documentElement.lang = savedLang
  document.body.dir = savedLang === 'ar' ? 'rtl' : 'ltr'
  document.body.className = savedLang === 'ar' ? '' : 'ltr'
} catch { /* body قد لا يكون جاهزاً */ }

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      en: { translation: en },
    },
    lng: savedLang,
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n