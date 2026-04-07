import { useState } from 'react'
import { X } from 'lucide-react'

/* ─── Constants ─── */
const PARQUET_WASTE_PERCENT = 8

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
function ResultRow({ icon, label, value, highlight, indent }: {
    icon: string; label: string; value: string; highlight?: boolean; indent?: boolean
}) {
    return (
        <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
            paddingRight: indent ? 16 : 0,
        }}>
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                <span style={{ marginLeft: 6 }}>{icon}</span>{label}
            </span>
            <span style={{
                fontSize: highlight ? 16 : 14, fontWeight: highlight ? 800 : 600,
                color: highlight ? 'var(--color-gold)' : 'var(--color-text-primary)',
                direction: 'ltr',
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
function btnStyle(active: boolean): React.CSSProperties {
    return {
        flex: 1, padding: '9px 0', borderRadius: 8, fontSize: 13,
        fontFamily: 'inherit', cursor: 'pointer', fontWeight: active ? 700 : 400,
        border: active ? '1.5px solid var(--color-gold)' : '1.5px solid var(--color-border-strong)',
        background: active ? 'var(--color-gold-light)' : 'var(--color-surface-raised)',
        color: active ? 'var(--color-gold)' : 'var(--color-text-secondary)',
        transition: 'all 0.15s',
    }
}

/* ─── Basic Parquet Calculator ─── */
function BasicParquetCalculator() {
    const [saleType, setSaleType] = useState<'square_meter' | 'pack' | 'carton'>('square_meter')
    const [unitCoverage, setUnitCoverage] = useState('')
    const [length, setLength] = useState('')
    const [width, setWidth] = useState('')
    const [includeFoam, setIncludeFoam] = useState(false)
    const [foamRollSize, setFoamRollSize] = useState('15')
    const [includeFoamWaste, setIncludeFoamWaste] = useState(false)

    const L = numInput(length, 0.1, 200)
    const W = numInput(width, 0.1, 200)
    const coverage = numInput(unitCoverage, 0.1, 100)
    const foamRoll = numInput(foamRollSize, 0.1, 500) ?? 15

    const roomArea = (L && W) ? L * W : null
    const parquetWithWaste = roomArea ? roomArea * (1 + PARQUET_WASTE_PERCENT / 100) : null

    let parquetQty: number | null = null
    let parquetUnit = ''
    if (parquetWithWaste !== null) {
        if (saleType === 'square_meter') {
            parquetQty = parquetWithWaste
            parquetUnit = 'م²'
        } else if ((saleType === 'pack' || saleType === 'carton') && coverage) {
            parquetQty = Math.ceil(parquetWithWaste / coverage)
            parquetUnit = saleType === 'pack' ? 'باكيت' : 'كرتون'
        }
    }

    let foamRolls: number | null = null
    if (includeFoam && roomArea !== null) {
        const foamArea = includeFoamWaste ? roomArea * 1.05 : roomArea
        foamRolls = Math.ceil(foamArea / foamRoll)
    }

    const saleTypeLabel = saleType === 'square_meter' ? 'متر مربع' : saleType === 'pack' ? 'باكيت' : 'كرتون'

    return (
        <div>
            {/* Sale type */}
            <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>طريقة البيع</label>
                <div style={{ display: 'flex', gap: 8 }}>
                    {([
                        { val: 'square_meter', label: 'متر مربع' },
                        { val: 'pack', label: 'باكيت' },
                        { val: 'carton', label: 'كرتون' },
                    ] as const).map(opt => (
                        <button key={opt.val} onClick={() => setSaleType(opt.val)} style={btnStyle(saleType === opt.val)}>
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Coverage per unit */}
            {(saleType === 'pack' || saleType === 'carton') && (
                <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>
                        مساحة التغطية لكل {saleType === 'pack' ? 'باكيت' : 'كرتون'} (م²)
                    </label>
                    <input
                        value={unitCoverage} onChange={e => setUnitCoverage(e.target.value)}
                        type="number" min={0.1} max={100} step={0.1} placeholder="2.4"
                        style={inputStyle}
                    />
                </div>
            )}

            {/* Dimensions */}
            <div style={gridStyle}>
                <div>
                    <label style={labelStyle}>الطول (متر)</label>
                    <input value={length} onChange={e => setLength(e.target.value)}
                        type="number" min={0.1} max={200} step={0.1} placeholder="5.0" style={inputStyle} />
                </div>
                <div>
                    <label style={labelStyle}>العرض (متر)</label>
                    <input value={width} onChange={e => setWidth(e.target.value)}
                        type="number" min={0.1} max={200} step={0.1} placeholder="4.0" style={inputStyle} />
                </div>
            </div>

            {/* Foam section */}
            <div style={{
                marginBottom: 20, padding: '14px 16px',
                background: 'var(--color-surface-raised)', borderRadius: 10,
                border: '1px solid var(--color-border)',
            }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                    <input
                        type="checkbox" checked={includeFoam}
                        onChange={e => setIncludeFoam(e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: 'var(--color-gold)', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        إضافة حساب الفوم العازل
                    </span>
                </label>

                {includeFoam && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--color-border)' }}>
                        <div style={{ marginBottom: 12 }}>
                            <label style={labelStyle}>مساحة رولة الفوم الواحدة (م²)</label>
                            <input
                                value={foamRollSize} onChange={e => setFoamRollSize(e.target.value)}
                                type="number" min={1} max={500} step={0.5} placeholder="15"
                                style={{ ...inputStyle, maxWidth: 160 }}
                            />
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                            <input
                                type="checkbox" checked={includeFoamWaste}
                                onChange={e => setIncludeFoamWaste(e.target.checked)}
                                style={{ width: 16, height: 16, accentColor: 'var(--color-gold)', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                                إضافة هدر 5% للفوم
                            </span>
                        </label>
                    </div>
                )}
            </div>

            {/* Result */}
            <div style={resultCardStyle}>
                <div style={resultTitleStyle}>النتيجة</div>
                <div style={resultGridStyle}>
                    <ResultRow icon="📐" label="مساحة الغرفة" value={`${fmt(roomArea)} م²`} />
                    <ResultRow icon="📦" label={`مع الهدر (${PARQUET_WASTE_PERCENT}%)`} value={`${fmt(parquetWithWaste)} م²`} />
                    <ResultRow icon="🎯" label={`الباركيه (${saleTypeLabel})`}
                        value={parquetQty !== null ? `${saleType === 'square_meter' ? fmt(parquetQty) : parquetQty.toLocaleString('ar-SA')} ${parquetUnit}` : '—'}
                        highlight />
                    {includeFoam && (
                        <ResultRow icon="🧴" label="الفوم العازل"
                            value={foamRolls !== null ? `${foamRolls.toLocaleString('ar-SA')} رولة` : '—'}
                            highlight />
                    )}
                </div>
            </div>
        </div>
    )
}

/* ─── Advanced Parquet Calculator ─── */
function AdvancedParquetCalculator() {
    const [saleType, setSaleType] = useState<'square_meter' | 'pack' | 'carton'>('square_meter')
    const [unitCoverage, setUnitCoverage] = useState('')
    const [length, setLength] = useState('')
    const [width, setWidth] = useState('')
    const [roomShape, setRoomShape] = useState<'rectangle' | 'L'>('rectangle')
    const [secLength, setSecLength] = useState('')
    const [secWidth, setSecWidth] = useState('')
    const [columns, setColumns] = useState('0')
    const [direction, setDirection] = useState<'parallel' | 'diagonal' | 'herringbone'>('parallel')
    const [wasteOption, setWasteOption] = useState<'8' | '12' | '15' | 'custom'>('8')
    const [wasteCustom, setWasteCustom] = useState('')
    const [includeFoam, setIncludeFoam] = useState(false)
    const [foamType, setFoamType] = useState<'2mm' | '3mm' | '5mm'>('3mm')
    const [foamRollSize, setFoamRollSize] = useState('15')
    const [foamWastePercent, setFoamWastePercent] = useState('5')

    const L = numInput(length, 0.1, 200)
    const W = numInput(width, 0.1, 200)
    const SL = numInput(secLength, 0.1, 200)
    const SW = numInput(secWidth, 0.1, 200)
    const cols = numInput(columns, 0, 100) ?? 0
    const coverage = numInput(unitCoverage, 0.1, 100)
    const foamRoll = numInput(foamRollSize, 0.1, 500) ?? 15
    const foamWaste = numInput(foamWastePercent, 0, 100) ?? 5

    const wastePercent = wasteOption === 'custom'
        ? (numInput(wasteCustom, 0, 100) ?? 8)
        : Number(wasteOption)

    let totalArea = (L && W) ? L * W : null
    if (totalArea && roomShape === 'L' && SL && SW) totalArea += SL * SW

    const columnsArea = cols * 0.25
    const netArea = totalArea !== null ? Math.max(0, totalArea - columnsArea) : null
    const parquetWithWaste = netArea !== null ? netArea * (1 + wastePercent / 100) : null

    const saleTypeLabel = saleType === 'square_meter' ? 'م²' : saleType === 'pack' ? 'باكيت' : 'كرتون'
    let parquetQty: number | null = null
    if (parquetWithWaste !== null) {
        if (saleType === 'square_meter') {
            parquetQty = parquetWithWaste
        } else if (coverage) {
            parquetQty = Math.ceil(parquetWithWaste / coverage)
        }
    }

    let foamRolls: number | null = null
    let foamAreaCalc: number | null = null
    if (includeFoam && netArea !== null) {
        foamAreaCalc = netArea * (1 + foamWaste / 100)
        foamRolls = Math.ceil(foamAreaCalc / foamRoll)
    }

    const directionLabel = direction === 'parallel' ? 'موازي للجدار' : direction === 'diagonal' ? 'قطري' : 'متعرج / Herringbone'
    const foamTypeLabel = foamType === '2mm' ? 'رقيق 2mm' : foamType === '3mm' ? 'متوسط 3mm' : 'سميك 5mm'

    return (
        <div>
            {/* Sale type */}
            <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>طريقة البيع</label>
                <div style={{ display: 'flex', gap: 8 }}>
                    {([
                        { val: 'square_meter', label: 'متر مربع' },
                        { val: 'pack', label: 'باكيت' },
                        { val: 'carton', label: 'كرتون' },
                    ] as const).map(opt => (
                        <button key={opt.val} onClick={() => setSaleType(opt.val)} style={btnStyle(saleType === opt.val)}>
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {(saleType === 'pack' || saleType === 'carton') && (
                <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>
                        مساحة التغطية لكل {saleType === 'pack' ? 'باكيت' : 'كرتون'} (م²)
                    </label>
                    <input
                        value={unitCoverage} onChange={e => setUnitCoverage(e.target.value)}
                        type="number" min={0.1} max={100} step={0.1} placeholder="2.4"
                        style={inputStyle}
                    />
                </div>
            )}

            {/* Dimensions */}
            <div style={gridStyle}>
                <div>
                    <label style={labelStyle}>الطول (متر)</label>
                    <input value={length} onChange={e => setLength(e.target.value)}
                        type="number" min={0.1} max={200} step={0.1} placeholder="5.0" style={inputStyle} />
                </div>
                <div>
                    <label style={labelStyle}>العرض (متر)</label>
                    <input value={width} onChange={e => setWidth(e.target.value)}
                        type="number" min={0.1} max={200} step={0.1} placeholder="4.0" style={inputStyle} />
                </div>
            </div>

            {/* Room shape */}
            <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>شكل الغرفة</label>
                <div style={{ display: 'flex', gap: 10 }}>
                    {([
                        { val: 'rectangle', label: 'مستطيلة' },
                        { val: 'L', label: 'حرف L' },
                    ] as const).map(opt => (
                        <button key={opt.val} onClick={() => setRoomShape(opt.val)} style={btnStyle(roomShape === opt.val)}>
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {roomShape === 'L' && (
                <div style={{ ...gridStyle, padding: '12px 14px', background: 'var(--color-surface-raised)', borderRadius: 10, border: '1px solid var(--color-border)', marginBottom: 20 }}>
                    <div>
                        <label style={{ ...labelStyle, fontSize: 11 }}>طول القسم الثاني (متر)</label>
                        <input value={secLength} onChange={e => setSecLength(e.target.value)}
                            type="number" min={0.1} max={200} step={0.1} placeholder="2.0" style={inputStyle} />
                    </div>
                    <div>
                        <label style={{ ...labelStyle, fontSize: 11 }}>عرض القسم الثاني (متر)</label>
                        <input value={secWidth} onChange={e => setSecWidth(e.target.value)}
                            type="number" min={0.1} max={200} step={0.1} placeholder="1.5" style={inputStyle} />
                    </div>
                </div>
            )}

            {/* Columns */}
            <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>عدد الأعمدة / الفتحات الداخلية <span style={{ opacity: 0.6 }}>(اختياري)</span></label>
                <input value={columns} onChange={e => setColumns(e.target.value)}
                    type="number" min={0} max={100} placeholder="0"
                    style={{ ...inputStyle, maxWidth: 160 }} />
                {cols > 0 && (
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4, display: 'block' }}>
                        يُخصم {fmt(cols * 0.25)} م² (0.25 م² للعمود)
                    </span>
                )}
            </div>

            {/* Direction */}
            <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>اتجاه التركيب</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {([
                        { val: 'parallel', label: 'موازي — هدر 8%' },
                        { val: 'diagonal', label: 'قطري — هدر 12%' },
                        { val: 'herringbone', label: 'Herringbone — هدر 15%' },
                    ] as const).map(opt => (
                        <button key={opt.val} onClick={() => {
                            setDirection(opt.val)
                            if (wasteOption !== 'custom') {
                                setWasteOption(opt.val === 'parallel' ? '8' : opt.val === 'diagonal' ? '12' : '15')
                            }
                        }} style={{
                            padding: '7px 12px', borderRadius: 8, fontSize: 12,
                            fontFamily: 'inherit', cursor: 'pointer', fontWeight: direction === opt.val ? 700 : 400,
                            border: direction === opt.val ? '1.5px solid var(--color-gold)' : '1.5px solid var(--color-border-strong)',
                            background: direction === opt.val ? 'var(--color-gold-light)' : 'var(--color-surface-raised)',
                            color: direction === opt.val ? 'var(--color-gold)' : 'var(--color-text-secondary)',
                        }}>
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Waste */}
            <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>نسبة الهدر</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {([
                        { val: '8', label: '8% — عادي' },
                        { val: '12', label: '12% — قطري' },
                        { val: '15', label: '15% — Herringbone' },
                        { val: 'custom', label: 'مخصص' },
                    ] as const).map(opt => (
                        <button key={opt.val} onClick={() => setWasteOption(opt.val)} style={{
                            padding: '7px 12px', borderRadius: 8, fontSize: 12,
                            fontFamily: 'inherit', cursor: 'pointer', fontWeight: wasteOption === opt.val ? 700 : 400,
                            border: wasteOption === opt.val ? '1.5px solid var(--color-gold)' : '1.5px solid var(--color-border-strong)',
                            background: wasteOption === opt.val ? 'var(--color-gold-light)' : 'var(--color-surface-raised)',
                            color: wasteOption === opt.val ? 'var(--color-gold)' : 'var(--color-text-secondary)',
                        }}>
                            {opt.label}
                        </button>
                    ))}
                </div>
                {wasteOption === 'custom' && (
                    <div style={{ marginTop: 8, maxWidth: 160 }}>
                        <input value={wasteCustom} onChange={e => setWasteCustom(e.target.value)}
                            type="number" min={0} max={100} step={1} placeholder="8" style={inputStyle} />
                    </div>
                )}
            </div>

            {/* Foam section */}
            <div style={{
                marginBottom: 20, padding: '14px 16px',
                background: 'var(--color-surface-raised)', borderRadius: 10,
                border: '1px solid var(--color-border)',
            }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                    <input
                        type="checkbox" checked={includeFoam}
                        onChange={e => setIncludeFoam(e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: 'var(--color-gold)', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        إضافة حساب الفوم العازل
                    </span>
                </label>

                {includeFoam && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--color-border)' }}>
                        {/* Foam type */}
                        <div style={{ marginBottom: 12 }}>
                            <label style={labelStyle}>نوع الفوم</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {([
                                    { val: '2mm', label: 'رقيق 2mm' },
                                    { val: '3mm', label: 'متوسط 3mm' },
                                    { val: '5mm', label: 'سميك 5mm' },
                                ] as const).map(opt => (
                                    <button key={opt.val} onClick={() => setFoamType(opt.val)} style={btnStyle(foamType === opt.val)}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={gridStyle}>
                            <div>
                                <label style={labelStyle}>مساحة الرولة (م²)</label>
                                <input value={foamRollSize} onChange={e => setFoamRollSize(e.target.value)}
                                    type="number" min={1} max={500} step={0.5} placeholder="15" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>نسبة هدر الفوم (%)</label>
                                <input value={foamWastePercent} onChange={e => setFoamWastePercent(e.target.value)}
                                    type="number" min={0} max={100} step={1} placeholder="5" style={inputStyle} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Result */}
            <div style={resultCardStyle}>
                <div style={resultTitleStyle}>النتيجة التفصيلية</div>

                <div style={sectionHeaderStyle}>تفاصيل الغرفة</div>
                <div style={resultGridStyle}>
                    <ResultRow icon="📐" label="الأبعاد"
                        value={L && W ? `${L} × ${W} م` + (roomShape === 'L' && SL && SW ? ` + ${SL} × ${SW} م` : '') : '—'} />
                    <ResultRow icon="🟫" label="المساحة الإجمالية" value={`${fmt(totalArea)} م²`} />
                    {cols > 0 && <ResultRow icon="🏛️" label="خصم الأعمدة" value={`−${fmt(columnsArea)} م²`} indent />}
                    <ResultRow icon="✅" label="المساحة الصافية" value={`${fmt(netArea)} م²`} />
                </div>

                <div style={sectionHeaderStyle}>الباركيه</div>
                <div style={resultGridStyle}>
                    <ResultRow icon="📏" label={`نسبة الهدر`} value={`${wastePercent}%`} />
                    <ResultRow icon="📦" label="الكمية مع الهدر" value={`${fmt(parquetWithWaste)} م²`} />
                    <ResultRow icon="🔧" label="اتجاه التركيب" value={directionLabel} />
                    <ResultRow icon="🎯" label={saleType === 'square_meter' ? 'الكمية المطلوبة' : `عدد الـ${saleType === 'pack' ? 'باكيت' : 'كراتين'}`}
                        value={parquetQty !== null ? `${saleType === 'square_meter' ? fmt(parquetQty) : parquetQty.toLocaleString('ar-SA')} ${saleTypeLabel}` : '—'}
                        highlight />
                </div>

                {includeFoam && (
                    <>
                        <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 12, paddingTop: 4 }}>
                            <div style={sectionHeaderStyle}>الفوم العازل</div>
                        </div>
                        <div style={resultGridStyle}>
                            <ResultRow icon="🧴" label="النوع" value={foamTypeLabel} />
                            <ResultRow icon="📐" label="المساحة مع الهدر" value={`${fmt(foamAreaCalc)} م²`} />
                            <ResultRow icon="🎯" label="عدد الرولات" value={foamRolls !== null ? `${foamRolls.toLocaleString('ar-SA')} رولة` : '—'} highlight />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

/* ─── Main modal ─── */
interface Props {
    onClose: () => void
}

export default function ParquetCalculatorModal({ onClose }: Props) {
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
                            🪵 حاسبة الباركيه والفوم
                        </h2>
                        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                            احسب الكمية المطلوبة لمشروعك مع خيار الفوم العازل
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
                    {tab === 'basic' ? <BasicParquetCalculator /> : <AdvancedParquetCalculator />}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '12px 24px', borderTop: '1px solid var(--color-border)',
                    fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center',
                }}>
                    النتائج تقريبية. يُنصح بشراء كمية احتياطية إضافية.
                </div>
            </div>
        </div>
    )
}
