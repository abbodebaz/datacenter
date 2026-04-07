/**
 * Settings Page — Lookup Lists Management (super_admin only)
 * Manage: Countries of Origin / Colors / Brands
 */
import { Component, useState } from 'react'
import type { ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Edit3, Save, X, Globe, Palette, ToggleLeft, ToggleRight, Settings2, Tag, RefreshCw } from 'lucide-react'
import { settingsAPI, brandsAPI } from '@/api/client'
import { toast } from 'react-toastify'

/* ── Error Boundary ──────────────────────────────────────────── */
class PanelErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
    constructor(props: { children: ReactNode }) {
        super(props)
        this.state = { hasError: false }
    }
    static getDerivedStateFromError() { return { hasError: true } }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)', fontSize: 13 }}>
                    <p style={{ marginBottom: 12 }}>حدث خطأ أثناء تحميل هذا القسم.</p>
                    <button className="btn btn-ghost btn-sm" onClick={() => { this.setState({ hasError: false }) }}>
                        <RefreshCw size={13} /> إعادة المحاولة
                    </button>
                </div>
            )
        }
        return this.props.children
    }
}

interface LookupValue {
    id: number
    lookup_type: string
    name_ar: string
    name_en: string
    is_active: boolean
    order: number
}

const TABS = [
    { key: 'country', label: 'بلدان المنشأ', icon: Globe,   color: '#4A90D9' },
    { key: 'color',   label: 'الألوان',       icon: Palette, color: '#C8A84B' },
    { key: 'brand',   label: 'الماركات',       icon: Tag,     color: '#7C5CBF' },
]

/* ── Shared styles ── */
const lStyle: React.CSSProperties = { display: 'block', fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4, fontWeight: 600 }
const iStyle: React.CSSProperties = { display: 'block', width: '100%', padding: '8px 10px', border: '1px solid var(--color-border-strong)', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', color: 'var(--color-text-primary)', background: 'var(--color-surface-raised)' }
const iconBtnStyle: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '4px 6px', borderRadius: 4, display: 'flex', alignItems: 'center' }

/* ═══════════════════════════════════════════════════════════
   Add Form
═══════════════════════════════════════════════════════════ */
function AddForm({ lookupType, onDone }: { lookupType: string; onDone: () => void }) {
    const qc = useQueryClient()
    const [form, setForm] = useState({ name_ar: '', name_en: '', is_active: true, order: 0 })

    const mutation = useMutation({
        mutationFn: () => settingsAPI.createLookup({ ...form, lookup_type: lookupType }),
        onSuccess: () => {
            toast.success('تمت الإضافة')
            qc.invalidateQueries({ queryKey: ['lookups', lookupType] })
            onDone()
        },
        onError: () => toast.error('فشلت الإضافة — قد يكون الاسم مكرراً'),
    })

    return (
        <div style={{ background: 'rgba(74,144,217,0.05)', border: '1px solid rgba(74,144,217,0.2)', borderRadius: 10, padding: 16, marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: '#4A90D9', fontWeight: 600, marginBottom: 12 }}>إضافة جديد</div>
            <div className="resp-filters-bar">
                <div>
                    <label style={lStyle}>الاسم بالعربية *</label>
                    <input style={iStyle} value={form.name_ar} placeholder={lookupType === 'country' ? 'مثال: ألمانيا' : 'مثال: تيفاني'}
                        onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))} />
                </div>
                <div>
                    <label style={lStyle}>الاسم بالإنجليزية</label>
                    <input style={{ ...iStyle, direction: 'ltr', textAlign: 'left' }} value={form.name_en}
                        placeholder={lookupType === 'country' ? 'Germany' : 'Tiffany'}
                        onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => mutation.mutate()}
                        disabled={mutation.isPending || !form.name_ar}>
                        <Plus size={13} /> إضافة
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={onDone}><X size={13} /></button>
                </div>
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════
   Lookup Row
═══════════════════════════════════════════════════════════ */
function LookupRow({ item }: { item: LookupValue }) {
    const qc = useQueryClient()
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({ name_ar: item.name_ar, name_en: item.name_en, is_active: item.is_active, order: item.order })

    const updateMutation = useMutation({
        mutationFn: () => settingsAPI.updateLookup(item.id, form),
        onSuccess: () => {
            toast.success('تم التحديث')
            qc.invalidateQueries({ queryKey: ['lookups', item.lookup_type] })
            qc.invalidateQueries({ queryKey: ['lookups-' + item.lookup_type] })
            setEditing(false)
        },
        onError: () => toast.error('فشل التحديث'),
    })

    const deleteMutation = useMutation({
        mutationFn: () => settingsAPI.deleteLookup(item.id),
        onSuccess: () => {
            toast.success('تم الحذف')
            qc.invalidateQueries({ queryKey: ['lookups', item.lookup_type] })
            qc.invalidateQueries({ queryKey: ['lookups-' + item.lookup_type] })
        },
        onError: () => toast.error('فشل الحذف'),
    })

    if (editing) {
        return (
            <div style={{ background: 'rgba(200,168,75,0.04)', border: '1px solid rgba(200,168,75,0.2)', borderRadius: 8, padding: '12px 14px', marginBottom: 6 }}>
                <div className="resp-filters-bar">
                    <div>
                        <label style={lStyle}>الاسم بالعربية</label>
                        <input style={iStyle} value={form.name_ar} onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))} />
                    </div>
                    <div>
                        <label style={lStyle}>الاسم بالإنجليزية</label>
                        <input style={{ ...iStyle, direction: 'ltr', textAlign: 'left' }} value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} />
                    </div>
                    <div>
                        <label style={lStyle}>مفعّل</label>
                        <button type="button" onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: form.is_active ? '#C8A84B' : 'var(--color-text-secondary)', padding: 0, display: 'flex', paddingTop: 4 }}>
                            {form.is_active ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: 6, paddingTop: 18 }}>
                        <button className="btn btn-primary btn-sm" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                            <Save size={13} />
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}><X size={13} /></button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 8, background: 'var(--color-surface)', border: '1px solid var(--color-border)', marginBottom: 6 }}>
            <div style={{ flex: 1 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{item.name_ar}</span>
                {item.name_en && (
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginRight: 10, fontFamily: 'var(--font-latin)', direction: 'ltr', display: 'inline-block' }}>
                        {item.name_en}
                    </span>
                )}
            </div>
            {!item.is_active && (
                <span style={{ fontSize: 10, color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', borderRadius: 4, padding: '1px 6px' }}>موقوف</span>
            )}
            <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setEditing(true)} style={iconBtnStyle} title="تعديل"><Edit3 size={14} /></button>
                <button onClick={() => { if (confirm(`حذف "${item.name_ar}"؟`)) deleteMutation.mutate() }}
                    style={{ ...iconBtnStyle, color: '#e07070' }} disabled={deleteMutation.isPending} title="حذف">
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════
   Lookup Panel (one tab content)
═══════════════════════════════════════════════════════════ */
function LookupPanel({ lookupType }: { lookupType: string }) {
    const [adding, setAdding] = useState(false)

    const { data = [], isLoading } = useQuery<LookupValue[]>({
        queryKey: ['lookups', lookupType],
        queryFn: () => settingsAPI.lookups(lookupType).then(r => {
            const d = r.data
            return Array.isArray(d) ? d : d.results ?? []
        }),
    })

    const activeItems = data.filter(i => i.is_active)
    const inactiveItems = data.filter(i => !i.is_active)

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                    <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                        {data.length} عنصر ({activeItems.length} مفعّل)
                    </span>
                </div>
                {!adding && (
                    <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>
                        <Plus size={14} /> إضافة
                    </button>
                )}
            </div>

            {adding && <AddForm lookupType={lookupType} onDone={() => setAdding(false)} />}

            {isLoading ? (
                [...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 46, borderRadius: 8, marginBottom: 6 }} />)
            ) : data.length === 0 && !adding ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)', fontSize: 13 }}>
                    لا توجد عناصر بعد — اضغط "إضافة" لإضافة أول عنصر
                </div>
            ) : (
                <>
                    {activeItems.map(item => <LookupRow key={item.id} item={item} />)}
                    {inactiveItems.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 8, fontWeight: 600 }}>موقوف</div>
                            {inactiveItems.map(item => <LookupRow key={item.id} item={item} />)}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════
   Brand Panel
═══════════════════════════════════════════════════════════ */
interface Brand { id: number; name: string; name_ar: string; is_active: boolean }

function BrandRow({ item, onRefresh }: { item: Brand; onRefresh: () => void }) {
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({ name_ar: item.name_ar, name: item.name })

    const updateMutation = useMutation({
        mutationFn: () => brandsAPI.update(item.id, form),
        onSuccess: () => { toast.success('تم التحديث'); onRefresh(); setEditing(false) },
        onError: () => toast.error('فشل التحديث'),
    })
    const deleteMutation = useMutation({
        mutationFn: () => brandsAPI.delete(item.id),
        onSuccess: () => { toast.success('تم الحذف'); onRefresh() },
        onError: () => toast.error('فشل الحذف'),
    })

    if (editing) {
        return (
            <div style={{ background: 'rgba(124,92,191,0.04)', border: '1px solid rgba(124,92,191,0.2)', borderRadius: 8, padding: '12px 14px', marginBottom: 6 }}>
                <div className="resp-filters-bar">
                    <div>
                        <label style={lStyle}>الاسم بالعربية</label>
                        <input style={iStyle} value={form.name_ar} onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))} />
                    </div>
                    <div>
                        <label style={lStyle}>الاسم بالإنجليزية</label>
                        <input style={{ ...iStyle, direction: 'ltr', textAlign: 'left' }} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div style={{ display: 'flex', gap: 6, paddingTop: 18 }}>
                        <button className="btn btn-primary btn-sm" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                            <Save size={13} />
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}><X size={13} /></button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 8, background: 'var(--color-surface)', border: '1px solid var(--color-border)', marginBottom: 6 }}>
            <div style={{ flex: 1 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{item.name_ar || item.name}</span>
                {item.name && item.name_ar && (
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginRight: 10, fontFamily: 'var(--font-latin)', direction: 'ltr', display: 'inline-block' }}>
                        {item.name}
                    </span>
                )}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setEditing(true)} style={iconBtnStyle} title="تعديل"><Edit3 size={14} /></button>
                <button onClick={() => { if (confirm(`حذف "${item.name_ar || item.name}"؟`)) deleteMutation.mutate() }}
                    style={{ ...iconBtnStyle, color: '#e07070' }} disabled={deleteMutation.isPending} title="حذف">
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    )
}

function BrandPanel() {
    const qc = useQueryClient()
    const [adding, setAdding] = useState(false)
    const [newForm, setNewForm] = useState({ name_ar: '', name: '' })

    const { data, isLoading, isError, refetch } = useQuery<Brand[]>({
        queryKey: ['brands-settings'],
        queryFn: async () => {
            const r = await brandsAPI.list()
            const d = r.data
            return Array.isArray(d) ? d : (d?.results ?? [])
        },
        retry: 3,
        staleTime: 0,
        refetchOnMount: true,
    })
    const brands = data ?? []

    const createMutation = useMutation({
        mutationFn: () => brandsAPI.create(newForm),
        onSuccess: () => {
            toast.success('تمت الإضافة')
            qc.invalidateQueries({ queryKey: ['brands-settings'] })
            qc.invalidateQueries({ queryKey: ['brands'] })
            setNewForm({ name_ar: '', name: '' })
            setAdding(false)
        },
        onError: () => toast.error('فشلت الإضافة — قد يكون الاسم مكرراً'),
    })

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{brands.length} ماركة</span>
                {!adding && (
                    <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>
                        <Plus size={14} /> إضافة ماركة
                    </button>
                )}
            </div>

            {adding && (
                <div style={{ background: 'rgba(124,92,191,0.05)', border: '1px solid rgba(124,92,191,0.2)', borderRadius: 10, padding: 16, marginBottom: 10 }}>
                    <div style={{ fontSize: 12, color: '#7C5CBF', fontWeight: 600, marginBottom: 12 }}>إضافة ماركة جديدة</div>
                    <div className="resp-filters-bar">
                        <div>
                            <label style={lStyle}>الاسم بالعربية *</label>
                            <input style={iStyle} value={newForm.name_ar} placeholder="مثال: سيراميك راك"
                                onChange={e => setNewForm(f => ({ ...f, name_ar: e.target.value }))} />
                        </div>
                        <div>
                            <label style={lStyle}>الاسم بالإنجليزية</label>
                            <input style={{ ...iStyle, direction: 'ltr', textAlign: 'left' }} value={newForm.name} placeholder="RAK Ceramics"
                                onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-primary btn-sm" onClick={() => createMutation.mutate()}
                                disabled={createMutation.isPending || !newForm.name_ar}>
                                <Plus size={13} /> إضافة
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setAdding(false)}><X size={13} /></button>
                        </div>
                    </div>
                </div>
            )}

            {isLoading ? (
                [...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 46, borderRadius: 8, marginBottom: 6 }} />)
            ) : isError ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)', fontSize: 13 }}>
                    <p>تعذّر تحميل الماركات.</p>
                    <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => refetch()}>إعادة المحاولة</button>
                </div>
            ) : brands.length === 0 && !adding ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)', fontSize: 13 }}>
                    لا توجد ماركات بعد — اضغط "إضافة ماركة" لإضافة أول ماركة
                </div>
            ) : (
                brands.map(b => (
                    <BrandRow key={b.id} item={b} onRefresh={() => {
                        qc.invalidateQueries({ queryKey: ['brands-settings'] })
                        qc.invalidateQueries({ queryKey: ['brands'] })
                    }} />
                ))
            )}
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════
   Main Page
═══════════════════════════════════════════════════════════ */
export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('country')

    return (
        <div className="page-enter">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(200,168,75,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Settings2 size={22} color="#C8A84B" />
                </div>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>الإعدادات</h1>
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>إدارة قوائم الاختيار المستخدمة في نماذج المنتجات</p>
                </div>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                    {TABS.map(tab => {
                        const Icon = tab.icon
                        const active = activeTab === tab.key
                        return (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 24px', border: 'none', borderBottom: active ? `3px solid ${tab.color}` : '3px solid transparent', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: active ? 700 : 400, color: active ? tab.color : 'var(--color-text-secondary)', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>

                {/* Tab Content */}
                <div style={{ padding: 24 }}>
                    <PanelErrorBoundary key={activeTab}>
                        {activeTab === 'brand'
                            ? <BrandPanel key="brand" />
                            : <LookupPanel key={activeTab} lookupType={activeTab} />
                        }
                    </PanelErrorBoundary>
                </div>
            </div>

            {/* Info box */}
            <div style={{ marginTop: 16, background: 'rgba(200,168,75,0.06)', border: '1px solid rgba(200,168,75,0.15)', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: 16 }}>💡</span>
                <span>القيم التي تضيفها هنا ستظهر كخيارات في نموذج إضافة المنتج. القيم الموقوفة لن تظهر في النماذج لكن تبقى محفوظة في المنتجات الموجودة.</span>
            </div>
        </div>
    )
}
