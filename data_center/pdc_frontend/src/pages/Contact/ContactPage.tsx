import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Phone, ChevronRight, Sun, Moon } from 'lucide-react'
import { useThemeStore } from '@/store/themeStore'
import { CONTACT_CHANNELS, SOCIAL_CHANNELS } from './data/contactInfo'
import ContactChannelCard from './components/ContactChannelCard'
import SocialMediaIcons from './components/SocialMediaIcons'

export default function ContactPage() {
    const navigate = useNavigate()
    const { theme, toggleTheme } = useThemeStore()

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-bg)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-arabic, "29LT Bukra", "Tajawal", sans-serif)',
            direction: 'rtl',
        }}>
            {/* ── Header ── */}
            <header style={{
                background: 'var(--color-surface)',
                borderBottom: '1px solid var(--color-border)',
                padding: '0 24px',
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky', top: 0, zIndex: 100,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                        onClick={() => navigate('/catalog/services')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: 'none', border: '1.5px solid var(--color-border-strong)',
                            borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
                            color: 'var(--color-text-secondary)', fontSize: 13,
                            fontFamily: 'inherit', transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'var(--color-gold)'
                            e.currentTarget.style.color = 'var(--color-gold)'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'var(--color-border-strong)'
                            e.currentTarget.style.color = 'var(--color-text-secondary)'
                        }}
                    >
                        <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} />
                        رجوع للخدمات
                    </button>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
                        بيت الإباء
                    </span>
                </div>

                <button
                    onClick={toggleTheme}
                    title={theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--color-text-secondary)', padding: 6,
                        borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
            </header>

            {/* ── Content ── */}
            <main style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px 80px' }}>

                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ textAlign: 'center', marginBottom: 56 }}
                >
                    <div style={{
                        width: 76, height: 76, borderRadius: 20,
                        background: 'var(--color-gold-light)',
                        border: '1.5px solid rgba(200,168,75,0.35)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 22px',
                        color: 'var(--color-gold)',
                    }}>
                        <Phone size={36} />
                    </div>
                    <h1 style={{
                        fontSize: 34, fontWeight: 800, marginBottom: 12,
                        color: 'var(--color-text-primary)',
                    }}>
                        تواصل معنا
                    </h1>
                    <p style={{
                        fontSize: 16, color: 'var(--color-text-secondary)',
                        lineHeight: 1.8, maxWidth: 520, margin: '0 auto',
                    }}>
                        نحن هنا لخدمتك. اختر القناة المناسبة لك للتواصل المباشر مع فريقنا
                    </p>
                    <div style={{
                        width: 48, height: 3,
                        background: 'linear-gradient(90deg, #C8A84B, #a8832f)',
                        borderRadius: 2, margin: '22px auto 0',
                    }} />
                </motion.div>

                {/* Direct Contact Channels */}
                <section style={{ marginBottom: 64 }}>
                    <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 }}
                        style={{
                            fontSize: 22, fontWeight: 700, textAlign: 'center',
                            marginBottom: 28, color: 'var(--color-text-primary)',
                        }}
                    >
                        قنوات التواصل المباشر
                    </motion.h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 24,
                    }} className="contact-channels-grid">
                        {CONTACT_CHANNELS.map((channel, index) => (
                            <ContactChannelCard key={channel.id} channel={channel} index={index} />
                        ))}
                    </div>
                </section>

                {/* Social Media */}
                <section>
                    <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        style={{
                            fontSize: 22, fontWeight: 700, textAlign: 'center',
                            marginBottom: 12, color: 'var(--color-text-primary)',
                        }}
                    >
                        تابعنا على وسائل التواصل
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.35 }}
                        style={{
                            textAlign: 'center', fontSize: 14,
                            color: 'var(--color-text-secondary)',
                            marginBottom: 32, lineHeight: 1.7,
                        }}
                    >
                        تابع آخر العروض والمنتجات الجديدة على حساباتنا الرسمية
                    </motion.p>

                    <SocialMediaIcons channels={SOCIAL_CHANNELS} />
                </section>
            </main>

            <style>{`
                @media (max-width: 680px) {
                    .contact-channels-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    )
}
