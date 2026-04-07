import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '@/store/themeStore'
import { Lightbulb, Calculator, Layers, Droplet, MapPin, Phone, ChevronRight, Sun, Moon } from 'lucide-react'
import ProductSuggestionModal from './ProductSuggestionModal'
import TileCalculatorModal from './TileCalculatorModal'
import ParquetCalculatorModal from './ParquetCalculatorModal'
import GlueCalculatorModal from './GlueCalculatorModal'

/* ─── Service card ─── */
interface ServiceCardProps {
    icon: React.ReactNode
    title: string
    description: string
    actionLabel: string
    onClick: () => void
}

function ServiceCard({ icon, title, description, actionLabel, onClick }: ServiceCardProps) {
    const [hovered, setHovered] = useState(false)
    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: 'var(--color-surface)',
                border: `1.5px solid ${hovered ? 'var(--color-gold)' : 'var(--color-border)'}`,
                borderRadius: 16,
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
                transform: hovered ? 'translateY(-3px)' : 'none',
                boxShadow: hovered ? '0 8px 32px rgba(200,168,75,0.15)' : 'none',
            }}
        >
            {/* Icon */}
            <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: hovered ? 'var(--color-gold-light)' : 'var(--color-surface-raised)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${hovered ? 'rgba(200,168,75,0.4)' : 'var(--color-border)'}`,
                transition: 'all 0.2s', flexShrink: 0,
                color: hovered ? 'var(--color-gold)' : 'var(--color-text-secondary)',
            }}>
                {icon}
            </div>

            {/* Text */}
            <div style={{ flex: 1 }}>
                <h3 style={{
                    fontSize: 18, fontWeight: 700, marginBottom: 8,
                    color: 'var(--color-text-primary)',
                }}>
                    {title}
                </h3>
                <p style={{
                    fontSize: 14, color: 'var(--color-text-secondary)',
                    lineHeight: 1.7, margin: 0,
                }}>
                    {description}
                </p>
            </div>

            {/* Action button */}
            <button
                onClick={onClick}
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                    fontFamily: 'inherit', cursor: 'pointer',
                    background: hovered ? 'linear-gradient(135deg, #C8A84B, #a8832f)' : 'transparent',
                    border: '1.5px solid var(--color-gold)',
                    color: hovered ? '#1a1a1a' : 'var(--color-gold)',
                    transition: 'all 0.2s',
                    alignSelf: 'flex-start',
                }}
            >
                {actionLabel}
                <ChevronRight size={14} />
            </button>
        </div>
    )
}

/* ─── Main page ─── */
export default function ServicesPage() {
    const navigate = useNavigate()
    const { theme, toggleTheme } = useThemeStore()
    const [showSuggestion, setShowSuggestion] = useState(false)
    const [showTileCalc, setShowTileCalc] = useState(false)
    const [showParquetCalc, setShowParquetCalc] = useState(false)
    const [showGlueCalc, setShowGlueCalc] = useState(false)

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
                        onClick={() => navigate('/catalog')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: 'none', border: '1.5px solid var(--color-border-strong)',
                            borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
                            color: 'var(--color-text-secondary)', fontSize: 13,
                            fontFamily: 'inherit', transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-gold)'; e.currentTarget.style.color = 'var(--color-gold)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
                    >
                        <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} />
                        الكتالوج
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
            <main style={{ maxWidth: 920, margin: '0 auto', padding: '48px 24px' }}>
                {/* Title */}
                <div style={{ marginBottom: 40, textAlign: 'center' }}>
                    <h1 style={{
                        fontSize: 32, fontWeight: 800, marginBottom: 10,
                        color: 'var(--color-text-primary)',
                    }}>
                        خدمات أخرى
                    </h1>
                    <p style={{ fontSize: 16, color: 'var(--color-text-secondary)', margin: 0 }}>
                        أدوات وخدمات إضافية لمساعدتك
                    </p>
                    <div style={{
                        width: 48, height: 3, background: 'linear-gradient(90deg, #C8A84B, #a8832f)',
                        borderRadius: 2, margin: '16px auto 0',
                    }} />
                </div>

                {/* Cards grid — 2 columns on desktop */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 24,
                }}>
                    <ServiceCard
                        icon={<Lightbulb size={26} />}
                        title="اقتراح منتج"
                        description="عندك منتج تحبه ومش متوفر عندنا؟ اقترحه علينا ونضيفه للكتالوج"
                        actionLabel="اقترح الآن"
                        onClick={() => setShowSuggestion(true)}
                    />
                    <ServiceCard
                        icon={<Calculator size={26} />}
                        title="حاسبة البلاط والسيراميك"
                        description="احسب كمية البلاط اللي تحتاجها لمشروعك بدقة — يدعم وضع عادي ومتقدم"
                        actionLabel="احسب الآن"
                        onClick={() => setShowTileCalc(true)}
                    />
                    <ServiceCard
                        icon={<Layers size={26} />}
                        title="حاسبة الباركيه والفوم"
                        description="احسب كمية الباركيه والفوم العازل اللي تحتاجها لأرضية مشروعك"
                        actionLabel="احسب الآن"
                        onClick={() => setShowParquetCalc(true)}
                    />
                    <ServiceCard
                        icon={<Droplet size={26} />}
                        title="حاسبة الغراء"
                        description="احسب كمية الغراء اللازمة لتركيب البلاط أو الباركيه بدقة"
                        actionLabel="احسب الآن"
                        onClick={() => setShowGlueCalc(true)}
                    />
                    <ServiceCard
                        icon={<MapPin size={26} />}
                        title="فروعنا"
                        description="اكتشف أقرب فرع لك من بيت الإباء وزرنا للاطلاع على المنتجات على الطبيعة"
                        actionLabel="استكشف الفروع"
                        onClick={() => navigate('/branches')}
                    />
                    <ServiceCard
                        icon={<Phone size={26} />}
                        title="تواصل معنا"
                        description="تواصل مع بيت الإباء عبر القنوات الرسمية، الدعم الفني، أو شبكاتنا الاجتماعية"
                        actionLabel="اتصل بنا"
                        onClick={() => navigate('/contact')}
                    />
                </div>

                {/* Responsive: single column on small screens */}
                <style>{`
                    @media (max-width: 600px) {
                        .services-grid { grid-template-columns: 1fr !important; }
                    }
                `}</style>
            </main>

            {/* Modals */}
            {showSuggestion && <ProductSuggestionModal onClose={() => setShowSuggestion(false)} />}
            {showTileCalc && <TileCalculatorModal onClose={() => setShowTileCalc(false)} />}
            {showParquetCalc && <ParquetCalculatorModal onClose={() => setShowParquetCalc(false)} />}
            {showGlueCalc && <GlueCalculatorModal onClose={() => setShowGlueCalc(false)} />}
        </div>
    )
}
