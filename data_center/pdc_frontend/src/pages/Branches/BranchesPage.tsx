import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Phone, Navigation, ChevronRight, Sun, Moon, Building2 } from 'lucide-react'
import { useThemeStore } from '@/store/themeStore'
import { BRANCHES, REGIONS, SUPPORT_PHONE, type RegionFilter, type Branch } from './data/branches'

/* ─── Branch Card ─── */
function BranchCard({ branch, index }: { branch: Branch; index: number }) {
    const [hovered, setHovered] = useState(false)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: 'var(--color-surface)',
                border: `1.5px solid ${hovered ? 'var(--color-gold)' : 'var(--color-border)'}`,
                borderRadius: 16,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
                transform: hovered ? 'translateY(-3px)' : 'none',
                boxShadow: hovered ? '0 8px 32px rgba(200,168,75,0.12)' : 'none',
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                    width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                    background: hovered ? 'var(--color-gold-light)' : 'var(--color-surface-raised)',
                    border: `1px solid ${hovered ? 'rgba(200,168,75,0.4)' : 'var(--color-border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: hovered ? 'var(--color-gold)' : 'var(--color-text-secondary)',
                    transition: 'all 0.2s',
                }}>
                    <MapPin size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                        fontSize: 16, fontWeight: 700, margin: '0 0 4px',
                        color: 'var(--color-text-primary)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                        {branch.name}
                    </h3>
                    <span style={{
                        fontSize: 12, color: 'var(--color-text-muted)',
                        background: 'var(--color-surface-raised)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 20, padding: '2px 10px',
                        display: 'inline-block',
                    }}>
                        {branch.region}
                    </span>
                </div>
            </div>

            {/* Address */}
            <p style={{
                fontSize: 13, color: 'var(--color-text-secondary)',
                lineHeight: 1.7, margin: 0,
                display: 'flex', alignItems: 'flex-start', gap: 6,
            }}>
                <Building2 size={14} style={{ flexShrink: 0, marginTop: 3, color: 'var(--color-text-muted)' }} />
                {branch.address}
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
                <a
                    href={branch.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                        background: hovered
                            ? 'linear-gradient(135deg, #C8A84B, #a8832f)'
                            : 'transparent',
                        border: '1.5px solid var(--color-gold)',
                        color: hovered ? '#1a1a1a' : 'var(--color-gold)',
                        textDecoration: 'none', transition: 'all 0.2s',
                        fontFamily: 'inherit',
                    }}
                >
                    <Navigation size={14} />
                    الاتجاهات
                </a>
                <a
                    href={`tel:${SUPPORT_PHONE}`}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                        background: 'var(--color-surface-raised)',
                        border: '1.5px solid var(--color-border)',
                        color: 'var(--color-text-secondary)',
                        textDecoration: 'none', transition: 'all 0.2s',
                        fontFamily: 'inherit',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--color-gold)'
                        e.currentTarget.style.color = 'var(--color-gold)'
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--color-border)'
                        e.currentTarget.style.color = 'var(--color-text-secondary)'
                    }}
                >
                    <Phone size={14} />
                    اتصل
                </a>
            </div>
        </motion.div>
    )
}

/* ─── Main Page ─── */
export default function BranchesPage() {
    const navigate = useNavigate()
    const { theme, toggleTheme } = useThemeStore()
    const [selectedRegion, setSelectedRegion] = useState<RegionFilter>('الكل')

    const filteredBranches = useMemo(() => {
        if (selectedRegion === 'الكل') return BRANCHES
        return BRANCHES.filter(b => b.region === selectedRegion)
    }, [selectedRegion])

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

            {/* ── Page content ── */}
            <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>

                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ marginBottom: 40, textAlign: 'center' }}
                >
                    <div style={{
                        width: 72, height: 72, borderRadius: 18,
                        background: 'var(--color-gold-light)',
                        border: '1.5px solid rgba(200,168,75,0.35)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px',
                        color: 'var(--color-gold)',
                    }}>
                        <MapPin size={34} />
                    </div>
                    <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 10, color: 'var(--color-text-primary)' }}>
                        فروعنا
                    </h1>
                    <p style={{ fontSize: 16, color: 'var(--color-text-secondary)', margin: '0 0 8px' }}>
                        {BRANCHES.length} فرع في جميع أنحاء المملكة العربية السعودية
                    </p>
                    <a
                        href={`tel:${SUPPORT_PHONE}`}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            fontSize: 14, color: 'var(--color-gold)',
                            textDecoration: 'none', fontWeight: 600,
                            direction: 'ltr',
                        }}
                    >
                        <Phone size={15} />
                        {SUPPORT_PHONE} :الدعم الفني
                    </a>
                    <div style={{
                        width: 48, height: 3,
                        background: 'linear-gradient(90deg, #C8A84B, #a8832f)',
                        borderRadius: 2, margin: '20px auto 0',
                    }} />
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.3 }}
                    style={{
                        display: 'flex', flexWrap: 'wrap', gap: 10,
                        justifyContent: 'center', marginBottom: 12,
                    }}
                >
                    {REGIONS.map(region => {
                        const active = selectedRegion === region
                        const count = region === 'الكل'
                            ? BRANCHES.length
                            : BRANCHES.filter(b => b.region === region).length
                        return (
                            <button
                                key={region}
                                onClick={() => setSelectedRegion(region)}
                                style={{
                                    padding: '8px 18px', borderRadius: 30, fontSize: 13, fontWeight: 600,
                                    fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.2s',
                                    background: active
                                        ? 'linear-gradient(135deg, #C8A84B, #a8832f)'
                                        : 'var(--color-surface-raised)',
                                    border: `1.5px solid ${active ? 'transparent' : 'var(--color-border)'}`,
                                    color: active ? '#1a1a1a' : 'var(--color-text-secondary)',
                                    boxShadow: active ? '0 4px 14px rgba(200,168,75,0.3)' : 'none',
                                }}
                            >
                                {region} <span style={{ opacity: 0.7 }}>({count})</span>
                            </button>
                        )
                    })}
                </motion.div>

                {/* Counter */}
                <p style={{
                    textAlign: 'center', fontSize: 13,
                    color: 'var(--color-text-muted)', marginBottom: 32,
                }}>
                    يعرض {filteredBranches.length} فرع
                    {selectedRegion !== 'الكل' ? ` في ${selectedRegion}` : ' من كل المناطق'}
                </p>

                {/* Grid */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedRegion}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 24,
                        }}
                        className="branches-grid"
                    >
                        {filteredBranches.map((branch, index) => (
                            <BranchCard key={branch.id} branch={branch} index={index} />
                        ))}
                    </motion.div>
                </AnimatePresence>
            </main>

            <style>{`
                @media (max-width: 900px) {
                    .branches-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (max-width: 560px) {
                    .branches-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    )
}
