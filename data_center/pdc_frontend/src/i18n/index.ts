import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ar from './ar'
import en from './en'

const savedLang = localStorage.getItem('pdc-lang') || 'ar'

i18n
    .use(initReactI18next)
    .init({
        resources: {
            ar: { translation: ar },
            en: { translation: en },
        },
        lng: savedLang,
        fallbackLng: 'ar',
        interpolation: { escapeValue: false },
    })

i18n.on('languageChanged', (lng) => {
    localStorage.setItem('pdc-lang', lng)
    const isAr = lng === 'ar'
    document.documentElement.dir = isAr ? 'rtl' : 'ltr'
    document.documentElement.lang = lng
})

document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr'
document.documentElement.lang = savedLang

export default i18n
