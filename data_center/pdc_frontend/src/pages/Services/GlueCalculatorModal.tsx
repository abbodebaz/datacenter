import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

/* ─── Constants ─── */
const GLUE_CONSUMPTION_TABLE: Record<string, Record<string, number>> = {
    ceramic:      { small: 3.0, medium: 4.0, large: 5.0, xlarge: 6.0 },
    porcelain:    { small: 3.5, medium: 4.5, large: 5.5, xlarge: 6.5 },
    marble:       { small: 4.0, medium: 5.0, large: 6.0, xlarge: 7.0 },
    parquet:      { small: 2.5, medium: 3.0, large: 3.5, xlarge: 4.0 },
    mosaic:       { small: 3.5, medium: 4.0, large: 4.5, xlarge: 5.0 },
    natural_stone:{ small: 5.0, medium: 6.0, large: 7.0, xlarge: 8.0 },
}

const LOCATION_MULTIPLIER: Record<string, number> = {
    indoor: 1.0,
    outdoor: 1.15,
    wet: 1.2,
    pool: 1.3,
}

const GLUE_WASTE_PERCENT = 10

/* ─── Helpers ─── */
function numInput(val: string, min = 0, max = 9999): number | null {
    const n = parseFloat(val)
    if (isNaN(n) || n < min || n > max) return null
    return n
}

function fmt(n: number | null, decimals = 2): string {
    if (n === null) return '—'
    return n.toFixed(decimals)
}

/* ─── Result row ─── */
function ResultRow({ icon, label, value, highlight, note }: {
    icon: string; label: string; value: string; highlight?: boolean; note?: string
}) {
    return (
        <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                <span style={{ marginLeft: 6 }}>{icon}</span>
                <span>{label}</span>
                {note && <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginRight: 6 }}>({note})</span>}
            </span>
            <span style={{
                fontSize: highlight ? 16 : 14, fontWeight: highlight ? 800 : 600,
                color: highlight ? 'var(--color-gold)' : 'var(--color-text-primary)',
                direction: 'ltr', textAlign: 'left',
            }}>
                {value}
            </span>
        </div>
    )
}

/* ─── Shared styles ─── */
const labelStyle: React.CSSProperties = {
    fontSize: 12, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6, fontWeight: 500,
}
const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', background: 'var(--color-surface-raised)',
    border: '1px solid var(--color-border-strong)', borderRadius: 8,
    color: 'var(--color-text-primary)', fontSize: 14, fontFamily: 'inherit',
    boxSizing: 'border-box', direction: 'ltr', textAlign: 'left',
}
const gridStyle: React.CSSProperties = {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20,
}
const resultCardStyle: React.CSSProperties = {
    marginTop: 24, padding: '18px 20px',
    background: 'var(--color-surface-raised)',
    border: '1px solid var(--color-border)',
    borderRadius: 14,
}
const resultTitleStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 700, color: 'var(--color-gold)',
    letterSpacing: 0.5, marginBottom: 12,
}
const resultGridStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column' }
const sectionHeaderStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)',
    letterSpacing: 1, marginBottom: 6, marginTop: 8,
}
const selectStyle: React.CSSProperties = {
    ...({} as React.CSSProperties),
    width: '100%', padding: '10px 12px', background: 'var(--color-surface-raised)',
    border: '1px solid var(--color-border-strong)', borderRadius: 8,
    color: 'var(--color-text-primary)', fontSize: 14, fontFamily: 'inherit',
    boxSizing: 'border-box', appearance: 'none', cursor: 'pointer',
}

/* ─── Basic Glue Calculator ─── */
function BasicGlueCalculator() {
    const [area, setArea] = useState('')
    const [consumptionRate, setConsumptionRate] = useState('')
    const [bagWeight, setBagWeight] = useState('25')

    const areaVal = numInput(area, 0.01, 50000)
    const rate = numInput(consumptionRate, 0.1, 50)
    const bag = numInput(bagWeight, 1, 1000) ?? 25

    const totalGlueKg = (areaVal && rate) ? areaVal * rate * (1 + GLUE_WASTE_PERCENT / 100) : null
    const bagsNeeded = totalGlueKg ? Math.ceil(totalGlueKg / bag) : null
    const actualKg = bagsNeeded ? bagsNeeded * bag : null
    const surplusKg = (actualKg && totalGlueKg) ? actualKg - totalGlueKg : null

    return (
        <div>
            <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>المساحة (م²)</label>
                <input value={area} onChange={e => setArea(e.target.value)}
                    type="number" min={0.01} max={50000} step={0.1} placeholder="20.0"
                    style={inputStyle} />
            </div>

            <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>
                    معدل الاستهلاك (كجم / م²)
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, marginRight: 6 }}>
                        عادة بين 3–6 كجم لكل م²
                    </span>
                </label>
                <input value={consumptionRate} onChange={e => setConsumptionRate(e.target.value)}
                    type="number" min={0.1} max={50} step={0.1} placeholder="4"
                    style={inputStyle} />
            </div>

            <div style={{ marginBottom: 20, maxWidth: 220 }}>
                <label style={labelStyle}>وزن الكيس الواحد (كجم)</label>
                <input value={bagWeight} onChange={e => setBagWeight(e.target.value)}
                    type="number" min={1} max={1000} step={1} placeholder="25"
                    style={inputStyle} />
            </div>

            <div style={resultCardStyle}>
                <div style={resultTitleStyle}>النتيجة</div>
                <div style={resultGridStyle}>
                    <ResultRow icon="📐" label="المساحة" value={`${fmt(areaVal)} م²`} />
                    <ResultRow icon="⚖️" label="الاستهلاك الكلي" value={`${fmt(totalGlueKg)} كجم`} note={`مع هدر ${GLUE_WASTE_PERCENT}%`} />
                    <ResultRow icon="📦" label="عدد الأكياس" value={bagsNeeded !== null ? `${bagsNeeded.toLocaleString('ar-SA')} كيس` : '—'} highlight />
                    <ResultRow icon="💼" label="الوزن الفعلي" value={`${fmt(actualKg)} كجم`} />
                    {(surplusKg !== null && surplusKg > 0) && (
                        <ResultRow icon="➕" label="الفائض" value={`${fmt(surplusKg)} كجم`} />
                    )}
                </div>
            </div>
        </div>
    )
}

/* ─── Advanced Glue Calculator ─── */
function AdvancedGlueCalculator() {
    const [surfaceType, setSurfaceType] = useState('ceramic')
    const [tileSize, setTileSize] = useState('medium')
    const [location, setLocation] = useState('indoor')
    const [area, setArea] = useState('')
    const [userRate, setUserRate] = useState('')
    const [bagWeight, setBagWeight] = useState('25')
    const [wasteOption, setWasteOption] = useState<'10' | '15' | '20' | 'custom'>('10')
    const [wasteCustom, setWasteCustom] = useState('')

    const suggestedRate = (GLUE_CONSUMPTION_TABLE[surfaceType]?.[tileSize] ?? 4) * (LOCATION_MULTIPLIER[location] ?? 1)
    const actualRate = numInput(userRate, 0.1, 50) ?? suggestedRate

    useEffect(() => {
        setUserRate(suggestedRate.toFixed(1))
    }, [suggestedRate])

    const areaVal = numInput(area, 0.01, 50000)
    const bag = numInput(bagWeight, 1, 1000) ?? 25
    const wastePercent = wasteOption === 'custom'
        ? (numInput(wasteCustom, 0, 100) ?? 10)
        : Number(wasteOption)

    const totalGlueKg = areaVal ? areaVal * actualRate * (1 + wastePercent / 100) : null
    const bagsNeeded = totalGlueKg ? Math.ceil(totalGlueKg / bag) : null
    const actualKg = bagsNeeded ? bagsNeeded * bag : null
    const surplusKg = (actualKg && totalGlueKg) ? actualKg - totalGlueKg : null

    const surfaceLabels: Record<string, string> = {
        ceramic: 'سيراميك', porcelain: 'بورسلان', marble: 'رخام',
        parquet: 'باركيه', mosaic: 'فسيفساء/موزاييك', natural_stone: 'حجر طبيعي',
    }
    const sizeLabels: Record<string, string> = {
        small: 'صغير (أقل من 30×30)', medium: 'متوسط (30–60 سم)',
        large: 'كبير (60–80 سم)', xlarge: 'كبير جداً (فوق 80×80)',
    }
    const locationLabels: Record<string, string> = {
        indoor: 'داخلي', outdoor: 'خارجي', wet: 'رطب (حمامات/مطابخ)', pool: 'مسابح',
    }

    return (
        <div>
            {/* Surface type */}
            <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>نوع السطح</label>
                <select value={surfaceType} onChange={e => setSurfaceType(e.target.value)} style={selectStyle}>
                    {Object.entries(surfaceLabels).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                    ))}
                </select>
            </div>

            <div style={gridStyle}>
                {/* Tile size */}
                <div>
                    <label style={labelStyle}>مقاس القطعة</label>
                    <select value={tileSize} onChange={e => setTileSize(e.target.value)} style={selectStyle}>
                        {Object.entries(sizeLabels).map(([v, l]) => (
                            <option key={v} value={v}>{l}</option>
                        ))}
                    </select>
                </div>
                {/* Location */}
                <div>
                    <label style={labelStyle}>مكان التركيب</label>
                    <select value={location} onChange={e => setLocation(e.target.value)} style={selectStyle}>
                        {Object.entries(locationLabels).map(([v, l]) => (
                            <option key={v} value={v}>{l}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Area */}
            <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>المساحة (م²)</label>
                <input value={area} onChange={e => setArea(e.target.value)}
                    type="number" min={0.01} max={50000} step={0.1} placeholder="20.0"
                    style={inputStyle} />
            </div>

            {/* Consumption rate (auto-suggested, user-editable) */}
            <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>
                    معدل الاستهلاك (كجم / م²)
                    <span style={{
                        marginRight: 8, padding: '2px 8px', borderRadius: 8, fontSize: 11,
                        background: 'var(--color-gold-light)', color: 'var(--color-gold)',
                    }}>
                        مقترح: {suggestedRate.toFixed(1)} كجم/م²
                    </span>
                </label>
                <input value={userRate} onChange={e => setUserRate(e.target.value)}
                    type="number" min={0.1} max={50} step={0.1}
                    placeholder={suggestedRate.toFixed(1)}
                    style={inputStyle} />
            </div>

            <div style={gridStyle}>
                {/* Bag weight */}
                <div>
                    <label style={labelStyle}>وزن الكيس (كجم)</label>
                    <input value={bagWeight} onChange={e => setBagWeight(e.target.value)}
                        type="number" min={1} max={1000} step={1} placeholder="25" style={inputStyle} />
                </div>
                {/* Waste */}
                <div>
                    <label style={labelStyle}>نسبة الهدر</label>
                    <select value={wasteOption} onChange={e => setWasteOption(e.target.value as typeof wasteOption)} style={selectStyle}>
                        <option value="10">10% — تركيب عادي</option>
                        <option value="15">15% — تركيب صعب</option>
                        <option value="20">20% — أسطح غير منتظمة</option>
                        <option value="custom">مخصص</option>
                    </select>
                </div>
            </div>
            {wasteOption === 'custom' && (
                <div style={{ marginBottom: 20, maxWidth: 160 }}>
                    <input value={wasteCustom} onChange={e => setWasteCustom(e.target.value)}
                        type="number" min={0} max={100} step={1} placeholder="10" style={inputStyle} />
                </div>
            )}

            {/* Result */}
            <div style={resultCardStyle}>
                <div style={resultTitleStyle}>النتيجة التفصيلية</div>

                <div style={sectionHeaderStyle}>تفاصيل المشروع</div>
                <div style={resultGridStyle}>
                    <ResultRow icon="🏗️" label="نوع السطح" value={surfaceLabels[surfaceType]} />
                    <ResultRow icon="📏" label="مقاس القطعة" value={sizeLabels[tileSize]} />
                    <ResultRow icon="📍" label="مكان التركيب" value={locationLabels[location]} />
                    <ResultRow icon="📐" label="المساحة" value={`${fmt(areaVal)} م²`} />
                </div>

                <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 8, paddingTop: 4 }}>
                    <div style={sectionHeaderStyle}>حسابات الغراء</div>
                </div>
                <div style={resultGridStyle}>
                    <ResultRow icon="💡" label="المعدل المقترح" value={`${suggestedRate.toFixed(1)} كجم/م²`} />
                    <ResultRow icon="✏️" label="المعدل المستخدم" value={`${actualRate.toFixed(1)} كجم/م²`} />
                    <ResultRow icon="♻️" label="نسبة الهدر" value={`${wastePercent}%`} />
                    <ResultRow icon="⚖️" label="الاستهلاك الكلي" value={`${fmt(totalGlueKg)} كجم`} />
                </div>

                <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 8, paddingTop: 4 }}>
                    <div style={sectionHeaderStyle}>الكميات</div>
                </div>
                <div style={resultGridStyle}>
                    <ResultRow icon="📦" label="عدد الأكياس"
                        value={bagsNeeded !== null ? `${bagsNeeded.toLocaleString('ar-SA')} كيس (${bag} كجم/كيس)` : '—'}
                        highlight />
                    <ResultRow icon="💼" label="الوزن الفعلي" value={`${fmt(actualKg)} كجم`} />
                    {(surplusKg !== null && surplusKg > 0) && (
                        <ResultRow icon="➕" label="الفائض" value={`${fmt(surplusKg)} كجم`} />
                    )}
                </div>

                <div style={{
                    marginTop: 14, padding: '10px 14px', borderRadius: 8,
                    background: 'rgba(200,168,75,0.07)', border: '1px solid rgba(200,168,75,0.2)',
                    fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.6,
                }}>
                    💡 الاستهلاك يختلف حسب نوع البلاط ومهارة الفني ودرجة استواء السطح
                </div>
            </div>
        </div>
    )
}

/* ─── Main modal ─── */
interface Props {
    onClose: () => void
}

export default function GlueCalculatorModal({ onClose }: Props) {
    const [tab, setTab] = useState<'basic' | 'advanced'>('basic')

    return (
        <div
            onClick={e => { if (e.target === e.currentTarget) onClose() }}
            style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9000,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
            }}
        >
            <div style={{
                background: 'var(--color-surface)', borderRadius: 16, width: '100%', maxWidth: 680,
                border: '1px solid rgba(200,168,75,0.25)', boxShadow: 'var(--shadow-lg)',
                maxHeight: '92vh', overflowY: 'auto', direction: 'rtl',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '20px 24px', borderBottom: '1px solid var(--color-border)',
                    position: 'sticky', top: 0, background: 'var(--color-surface)', zIndex: 10,
                }}>
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 2, color: 'var(--color-text-primary)' }}>
                            🧲 حاسبة الغراء
                        </h2>
                        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                            احسب كمية الغراء اللازمة لتركيب البلاط أو الباركيه
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--color-border)', padding: '0 24px' }}>
                    {([
                        { val: 'basic', label: 'عادية' },
                        { val: 'advanced', label: 'متقدمة' },
                    ] as const).map(t => (
                        <button key={t.val} onClick={() => setTab(t.val)} style={{
                            padding: '13px 22px', background: 'none', border: 'none',
                            borderBottom: tab === t.val ? '2.5px solid var(--color-gold)' : '2.5px solid transparent',
                            color: tab === t.val ? 'var(--color-gold)' : 'var(--color-text-secondary)',
                            fontFamily: 'inherit', fontSize: 14, fontWeight: tab === t.val ? 700 : 500,
                            cursor: 'pointer', transition: 'color 0.15s', marginBottom: -1,
                        }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={{ padding: '22px 24px' }}>
                    {tab === 'basic' ? <BasicGlueCalculator /> : <AdvancedGlueCalculator />}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '12px 24px', borderTop: '1px solid var(--color-border)',
                    fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center',
                }}>
                    النتائج تقريبية. يُنصح بمراجعة مصنّع الغراء للحصول على التوصيات الدقيقة.
                </div>
            </div>
        </div>
    )
}
