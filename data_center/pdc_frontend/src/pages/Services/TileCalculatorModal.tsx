import { useState } from 'react'
import { X } from 'lucide-react'

/* ─── Tile size presets ─── */
const TILE_SIZES = [
    { label: '20×20', width: 20, height: 20 },
    { label: '25×25', width: 25, height: 25 },
    { label: '30×30', width: 30, height: 30 },
    { label: '30×60', width: 30, height: 60 },
    { label: '40×40', width: 40, height: 40 },
    { label: '45×45', width: 45, height: 45 },
    { label: '60×60', width: 60, height: 60, popular: true },
    { label: '60×120', width: 60, height: 120 },
    { label: '80×80', width: 80, height: 80 },
    { label: '100×100', width: 100, height: 100 },
    { label: '120×120', width: 120, height: 120 },
    { label: 'مخصص', width: 0, height: 0, custom: true },
]

const DOOR_AREA = 1.76
const WINDOW_AREA = 1.5
const DEFAULT_WASTE = 10

/* ─── Helpers ─── */
function numInput(val: string, min = 0, max = 100): number | null {
    const n = parseFloat(val)
    if (isNaN(n) || n < min || n > max) return null
    return n
}

function fmt(n: number | null, decimals = 2): string {
    if (n === null) return '—'
    return n.toFixed(decimals)
}

/* ─── Shared: tile size selector ─── */
function TileSizeSelector({
    selected, onSelect, customW, customH, onCustomW, onCustomH,
}: {
    selected: number
    onSelect: (idx: number) => void
    customW: string
    customH: string
    onCustomW: (v: string) => void
    onCustomH: (v: string) => void
}) {
    return (
        <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>مقاس البلاطة (سم)</label>
            <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8,
            }}>
                {TILE_SIZES.map((ts, i) => (
                    <button
                        key={ts.label}
                        onClick={() => onSelect(i)}
                        style={{
                            padding: '6px 12px', borderRadius: 8, fontSize: 13,
                            fontFamily: 'inherit', cursor: 'pointer',
                            fontWeight: selected === i ? 700 : 400,
                            border: selected === i ? '1.5px solid var(--color-gold)' : '1.5px solid var(--color-border-strong)',
                            background: selected === i ? 'var(--color-gold-light)' : 'var(--color-surface-raised)',
                            color: selected === i ? 'var(--color-gold)' : 'var(--color-text-secondary)',
                            transition: 'all 0.15s',
                            position: 'relative',
                        }}
                    >
                        {ts.label}
                        {ts.popular && (
                            <span style={{
                                position: 'absolute', top: -7, right: -4,
                                background: 'var(--color-gold)', color: '#1a1a1a',
                                fontSize: 9, fontWeight: 700, padding: '1px 4px',
                                borderRadius: 4, lineHeight: 1.4,
                            }}>شائع</span>
                        )}
                    </button>
                ))}
            </div>
            {TILE_SIZES[selected]?.custom && (
                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ ...labelStyle, fontSize: 11 }}>العرض (سم)</label>
                        <input
                            value={customW} onChange={e => onCustomW(e.target.value)}
                            type="number" min={5} max={200} placeholder="60"
                            style={inputStyle}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ ...labelStyle, fontSize: 11 }}>الطول (سم)</label>
                        <input
                            value={customH} onChange={e => onCustomH(e.target.value)}
                            type="number" min={5} max={200} placeholder="60"
                            style={inputStyle}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

/* ─── Basic calculator ─── */
function BasicCalculator() {
    const [tileIdx, setTileIdx] = useState(6)
    const [customW, setCustomW] = useState('')
    const [customH, setCustomH] = useState('')
    const [length, setLength] = useState('')
    const [width, setWidth] = useState('')

    const tile = TILE_SIZES[tileIdx]
    const tw = tile.custom ? numInput(customW, 5, 200) : tile.width
    const th = tile.custom ? numInput(customH, 5, 200) : tile.height
    const tileAreaM2 = (tw && th) ? (tw * th) / 10000 : null

    const L = numInput(length, 0.1, 100)
    const W = numInput(width, 0.1, 100)
    const roomArea = (L && W) ? L * W : null
    const areaWithWaste = roomArea ? roomArea * 1.10 : null
    const tilesNeeded = (areaWithWaste && tileAreaM2) ? Math.ceil(areaWithWaste / tileAreaM2) : null

    return (
        <div>
            <TileSizeSelector
                selected={tileIdx} onSelect={setTileIdx}
                customW={customW} customH={customH}
                onCustomW={setCustomW} onCustomH={setCustomH}
            />

            <div style={gridStyle}>
                <div>
                    <label style={labelStyle}>الطول (متر)</label>
                    <input
                        value={length} onChange={e => setLength(e.target.value)}
                        type="number" min={0.1} max={100} step={0.1} placeholder="5.0"
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>العرض (متر)</label>
                    <input
                        value={width} onChange={e => setWidth(e.target.value)}
                        type="number" min={0.1} max={100} step={0.1} placeholder="4.0"
                        style={inputStyle}
                    />
                </div>
            </div>

            {/* Result */}
            <div style={resultCardStyle}>
                <div style={resultTitleStyle}>النتيجة</div>
                <div style={resultGridStyle}>
                    <ResultRow icon="📐" label="مساحة الغرفة" value={`${fmt(roomArea)} م²`} />
                    <ResultRow icon="♻️" label="مع الهدر (10%)" value={`${fmt(areaWithWaste)} م²`} />
                    <ResultRow icon="🎯" label="تحتاج" value={tilesNeeded !== null ? `${tilesNeeded.toLocaleString('ar-SA')} بلاطة` : '—'} highlight />
                </div>
            </div>
        </div>
    )
}

/* ─── Advanced calculator ─── */
function AdvancedCalculator() {
    const [tileIdx, setTileIdx] = useState(6)
    const [customW, setCustomW] = useState('')
    const [customH, setCustomH] = useState('')
    const [installType, setInstallType] = useState<'floor' | 'walls' | 'both'>('floor')
    const [length, setLength] = useState('')
    const [width, setWidth] = useState('')
    const [height, setHeight] = useState('')
    const [doors, setDoors] = useState('0')
    const [windows, setWindows] = useState('0')
    const [wasteOption, setWasteOption] = useState<'10' | '15' | '20' | 'custom'>('10')
    const [wasteCustom, setWasteCustom] = useState('')

    const tile = TILE_SIZES[tileIdx]
    const tw = tile.custom ? numInput(customW, 5, 200) : tile.width
    const th = tile.custom ? numInput(customH, 5, 200) : tile.height
    const tileAreaM2 = (tw && th) ? (tw * th) / 10000 : null

    const L = numInput(length, 0.1, 100)
    const W = numInput(width, 0.1, 100)
    const H = numInput(height, 0.1, 100)
    const D = numInput(doors, 0, 50) ?? 0
    const Win = numInput(windows, 0, 50) ?? 0
    const wastePercent = wasteOption === 'custom'
        ? (numInput(wasteCustom, 0, 100) ?? DEFAULT_WASTE)
        : Number(wasteOption)

    const floorArea = (L && W) ? L * W : null
    const wallsArea = (L && W && H) ? 2 * (L + W) * H : null
    const openingsArea = D * DOOR_AREA + Win * WINDOW_AREA
    const netWallsArea = wallsArea !== null ? Math.max(0, wallsArea - openingsArea) : null

    let floorTiles: number | null = null
    let wallTiles: number | null = null
    let floorWithWaste: number | null = null
    let wallWithWaste: number | null = null

    if ((installType === 'floor' || installType === 'both') && floorArea && tileAreaM2) {
        floorWithWaste = floorArea * (1 + wastePercent / 100)
        floorTiles = Math.ceil(floorWithWaste / tileAreaM2)
    }
    if ((installType === 'walls' || installType === 'both') && netWallsArea !== null && tileAreaM2) {
        wallWithWaste = netWallsArea * (1 + wastePercent / 100)
        wallTiles = Math.ceil(wallWithWaste / tileAreaM2)
    }

    const totalTiles = (floorTiles ?? 0) + (wallTiles ?? 0) || null
    const totalArea = (floorWithWaste ?? 0) + (wallWithWaste ?? 0) || null

    const needsHeight = installType === 'walls' || installType === 'both'

    return (
        <div>
            <TileSizeSelector
                selected={tileIdx} onSelect={setTileIdx}
                customW={customW} customH={customH}
                onCustomW={setCustomW} onCustomH={setCustomH}
            />

            {/* Installation type */}
            <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>نوع التركيب</label>
                <div style={{ display: 'flex', gap: 10 }}>
                    {([
                        { val: 'floor', label: 'أرضية' },
                        { val: 'walls', label: 'جدار' },
                        { val: 'both', label: 'الاثنين' },
                    ] as const).map(opt => (
                        <button
                            key={opt.val}
                            onClick={() => setInstallType(opt.val)}
                            style={{
                                flex: 1, padding: '9px 0', borderRadius: 8, fontSize: 13,
                                fontFamily: 'inherit', cursor: 'pointer', fontWeight: installType === opt.val ? 700 : 400,
                                border: installType === opt.val ? '1.5px solid var(--color-gold)' : '1.5px solid var(--color-border-strong)',
                                background: installType === opt.val ? 'var(--color-gold-light)' : 'var(--color-surface-raised)',
                                color: installType === opt.val ? 'var(--color-gold)' : 'var(--color-text-secondary)',
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Dimensions */}
            <div style={{ ...gridStyle, marginBottom: needsHeight ? 0 : 20 }}>
                <div>
                    <label style={labelStyle}>الطول (متر)</label>
                    <input value={length} onChange={e => setLength(e.target.value)}
                        type="number" min={0.1} max={100} step={0.1} placeholder="5.0" style={inputStyle} />
                </div>
                <div>
                    <label style={labelStyle}>العرض (متر)</label>
                    <input value={width} onChange={e => setWidth(e.target.value)}
                        type="number" min={0.1} max={100} step={0.1} placeholder="4.0" style={inputStyle} />
                </div>
            </div>
            {needsHeight && (
                <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>الارتفاع (متر)</label>
                    <input value={height} onChange={e => setHeight(e.target.value)}
                        type="number" min={0.1} max={100} step={0.1} placeholder="2.8" style={inputStyle} />
                </div>
            )}

            {/* Doors & windows */}
            {needsHeight && (
                <div style={gridStyle}>
                    <div>
                        <label style={labelStyle}>عدد الأبواب</label>
                        <input value={doors} onChange={e => setDoors(e.target.value)}
                            type="number" min={0} max={50} placeholder="0" style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>عدد النوافذ</label>
                        <input value={windows} onChange={e => setWindows(e.target.value)}
                            type="number" min={0} max={50} placeholder="0" style={inputStyle} />
                    </div>
                </div>
            )}

            {/* Waste */}
            <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>نسبة الهدر</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {([
                        { val: '10', label: '10% — عادي' },
                        { val: '15', label: '15% — قطري' },
                        { val: '20', label: '20% — معقد' },
                        { val: 'custom', label: 'مخصص' },
                    ] as const).map(opt => (
                        <button
                            key={opt.val}
                            onClick={() => setWasteOption(opt.val)}
                            style={{
                                padding: '7px 12px', borderRadius: 8, fontSize: 12,
                                fontFamily: 'inherit', cursor: 'pointer',
                                fontWeight: wasteOption === opt.val ? 700 : 400,
                                border: wasteOption === opt.val ? '1.5px solid var(--color-gold)' : '1.5px solid var(--color-border-strong)',
                                background: wasteOption === opt.val ? 'var(--color-gold-light)' : 'var(--color-surface-raised)',
                                color: wasteOption === opt.val ? 'var(--color-gold)' : 'var(--color-text-secondary)',
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
                {wasteOption === 'custom' && (
                    <div style={{ marginTop: 8, maxWidth: 160 }}>
                        <input
                            value={wasteCustom} onChange={e => setWasteCustom(e.target.value)}
                            type="number" min={0} max={100} step={1} placeholder="10"
                            style={inputStyle}
                        />
                    </div>
                )}
            </div>

            {/* Result */}
            <div style={resultCardStyle}>
                <div style={resultTitleStyle}>النتيجة التفصيلية</div>

                {/* Room details */}
                <div style={sectionHeaderStyle}>تفاصيل الغرفة</div>
                <div style={resultGridStyle}>
                    <ResultRow icon="📏" label="الأبعاد"
                        value={L && W ? `${L} × ${W}${needsHeight && H ? ` × ${H}` : ''} م` : '—'} />
                    {(installType === 'floor' || installType === 'both') &&
                        <ResultRow icon="🟫" label="مساحة الأرضية" value={`${fmt(floorArea)} م²`} />}
                    {needsHeight && <>
                        <ResultRow icon="🧱" label="مساحة الجدران" value={`${fmt(wallsArea)} م²`} />
                        {(D > 0 || Win > 0) &&
                            <ResultRow icon="🚪" label="خصم الفتحات" value={`${fmt(openingsArea)} م²`} />}
                        <ResultRow icon="✅" label="المساحة الصافية (جدران)" value={`${fmt(netWallsArea)} م²`} />
                    </>}
                </div>

                {/* Quantities */}
                <div style={sectionHeaderStyle}>الكميات المطلوبة</div>
                <div style={resultGridStyle}>
                    {(installType === 'floor' || installType === 'both') && <>
                        <ResultRow icon="🟫" label={`أرضية (مع ${wastePercent}% هدر)`} value={`${fmt(floorWithWaste)} م²`} />
                        <ResultRow icon="🎯" label="بلاطات الأرضية"
                            value={floorTiles !== null ? `${floorTiles.toLocaleString('ar-SA')} بلاطة` : '—'} />
                    </>}
                    {(installType === 'walls' || installType === 'both') && <>
                        <ResultRow icon="🧱" label={`جدران (مع ${wastePercent}% هدر)`} value={`${fmt(wallWithWaste)} م²`} />
                        <ResultRow icon="🎯" label="بلاطات الجدران"
                            value={wallTiles !== null ? `${wallTiles.toLocaleString('ar-SA')} بلاطة` : '—'} />
                    </>}
                </div>

                {/* Total */}
                <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 12, paddingTop: 12 }}>
                    <div style={sectionHeaderStyle}>الإجمالي</div>
                    <div style={resultGridStyle}>
                        <ResultRow icon="📦" label="إجمالي المساحة" value={`${fmt(totalArea)} م²`} />
                        <ResultRow icon="🏆" label="إجمالي البلاطات"
                            value={totalTiles !== null ? `${totalTiles.toLocaleString('ar-SA')} بلاطة` : '—'}
                            highlight />
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ─── Result row sub-component ─── */
function ResultRow({ icon, label, value, highlight }: {
    icon: string; label: string; value: string; highlight?: boolean
}) {
    return (
        <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
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
const resultGridStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column',
}
const sectionHeaderStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)',
    letterSpacing: 1, marginBottom: 6, marginTop: 8, textTransform: 'uppercase',
}

/* ─── Main modal ─── */
interface Props {
    onClose: () => void
}

export default function TileCalculatorModal({ onClose }: Props) {
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
                            🧮 حاسبة البلاط والسيراميك
                        </h2>
                        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                            احسب الكمية المطلوبة لمشروعك بدقة
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex', gap: 0, borderBottom: '1px solid var(--color-border)',
                    padding: '0 24px',
                }}>
                    {([
                        { val: 'basic', label: 'عادية' },
                        { val: 'advanced', label: 'متقدمة' },
                    ] as const).map(t => (
                        <button
                            key={t.val}
                            onClick={() => setTab(t.val)}
                            style={{
                                padding: '13px 22px', background: 'none', border: 'none',
                                borderBottom: tab === t.val ? '2.5px solid var(--color-gold)' : '2.5px solid transparent',
                                color: tab === t.val ? 'var(--color-gold)' : 'var(--color-text-secondary)',
                                fontFamily: 'inherit', fontSize: 14, fontWeight: tab === t.val ? 700 : 500,
                                cursor: 'pointer', transition: 'color 0.15s',
                                marginBottom: -1,
                            }}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={{ padding: '22px 24px' }}>
                    {tab === 'basic' ? <BasicCalculator /> : <AdvancedCalculator />}
                </div>

                {/* Footer note */}
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
