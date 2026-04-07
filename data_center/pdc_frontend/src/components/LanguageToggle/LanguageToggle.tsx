import { useTranslation } from 'react-i18next'

interface Props {
    size?: number
}

export default function LanguageToggle({ size = 36 }: Props) {
    const { i18n } = useTranslation()
    const isAr = i18n.language === 'ar'

    const toggle = () => {
        i18n.changeLanguage(isAr ? 'en' : 'ar')
    }

    return (
        <button
            onClick={toggle}
            title={isAr ? 'Switch to English' : 'التبديل إلى العربية'}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: size,
                height: size,
                background: 'var(--color-surface-raised)',
                border: '1px solid var(--color-border-strong)',
                borderRadius: 8,
                cursor: 'pointer',
                color: 'var(--color-text-primary)',
                fontSize: 12,
                fontWeight: 700,
                fontFamily: 'var(--font-latin)',
                letterSpacing: 0.5,
                transition: 'all 0.2s',
                flexShrink: 0,
            }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(200,168,75,0.5)'
                e.currentTarget.style.color = 'var(--color-gold)'
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--color-border-strong)'
                e.currentTarget.style.color = 'var(--color-text-primary)'
            }}
        >
            {isAr ? 'EN' : 'ع'}
        </button>
    )
}
