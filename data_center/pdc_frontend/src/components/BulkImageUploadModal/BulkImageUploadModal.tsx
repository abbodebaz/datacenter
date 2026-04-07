/**
 * BulkImageUploadModal
 * رفع صور جماعي مرتبط بأكواد المنتجات.
 * الاصطلاح: {sku}.jpg و {sku}_1.jpg و {sku}_2.jpg …
 */
import { useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, Images, Upload, CheckCircle2, XCircle, AlertCircle, Loader2, FileImage } from 'lucide-react'
import { decorativeAPI } from '@/api/client'
import { toast } from 'react-toastify'

interface MatchedItem {
    filename: string
    sku: string
    product_name: string
    image_id: number
    r2_url: string
}

interface UnmatchedItem {
    filename: string
    parsed_sku: string
}

interface ErrorItem {
    filename: string
    error: string
}

interface UploadResult {
    total: number
    matched_count: number
    unmatched_count: number
    error_count: number
    matched: MatchedItem[]
    unmatched: UnmatchedItem[]
    errors: ErrorItem[]
}

interface Props {
    onClose: () => void
}

export default function BulkImageUploadModal({ onClose }: Props) {
    const [files, setFiles] = useState<File[]>([])
    const [uploading, setUploading] = useState(false)
    const [result, setResult] = useState<UploadResult | null>(null)
    const [dragging, setDragging] = useState(false)
    const [activeTab, setActiveTab] = useState<'matched' | 'unmatched' | 'errors'>('matched')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const addFiles = useCallback((incoming: FileList | File[]) => {
        const arr = Array.from(incoming).filter(f =>
            ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(f.type)
        )
        setFiles(prev => {
            const existing = new Set(prev.map(f => f.name))
            const fresh = arr.filter(f => !existing.has(f.name))
            return [...prev, ...fresh]
        })
        setResult(null)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragging(false)
        addFiles(e.dataTransfer.files)
    }, [addFiles])

    const handleUpload = async () => {
        if (files.length === 0) { toast.warning('اختر صوراً أولاً'); return }
        if (files.length > 200) { toast.warning('الحد الأقصى 200 صورة في الطلب الواحد'); return }
        setUploading(true)
        try {
            const fd = new FormData()
            files.forEach(f => fd.append('files', f))
            const res = await decorativeAPI.bulkImagesUpload(fd)
            setResult(res.data)
            if (res.data.matched_count > 0) {
                toast.success(`تم رفع ${res.data.matched_count} صورة بنجاح`)
            }
            if (res.data.unmatched_count > 0) {
                toast.warning(`${res.data.unmatched_count} صورة لم تجد منتجاً مطابقاً`)
            }
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'فشل رفع الصور'
            toast.error(msg)
        } finally {
            setUploading(false)
        }
    }

    useCallback(() => {
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = prev }
    }, [])

    const overlay: React.CSSProperties = {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }
    const box: React.CSSProperties = {
        background: 'var(--color-surface)', border: '1px solid rgba(200,168,75,0.25)', borderRadius: 16,
        padding: 28, width: '100%', maxWidth: 740, maxHeight: '92vh', overflowY: 'auto',
        fontFamily: 'inherit', direction: 'rtl',
    }
    const sectionBox: React.CSSProperties = {
        background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)',
        borderRadius: 10, padding: '14px 16px', marginBottom: 14,
    }

    return createPortal(
        <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
            <div style={box}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(200,168,75,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Images size={20} color="#C8A84B" />
                        </div>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>رفع صور جماعية</div>
                            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                                كل صورة تُربط تلقائياً بمنتجها عبر رمز الصنف في اسم الملف
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: 4 }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Naming convention */}
                <div style={sectionBox}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-gold)', marginBottom: 10 }}>الطريقة الصحيحة لرفع الصور</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {[
                            { name: 'F19.006-2.jpg', desc: 'الصورة الأولى للمنتج F19.006-2' },
                            { name: 'F19.006-2_1.jpg', desc: 'الصورة الثانية لنفس المنتج' },
                            { name: 'C360.376.jpg', desc: 'الصورة الأولى للمنتج C360.376' },
                            { name: 'C360.376_2.jpg', desc: 'الصورة الثالثة لنفس المنتج' },
                        ].map(ex => (
                            <div key={ex.name} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', background: 'rgba(200,168,75,0.06)', borderRadius: 8 }}>
                                <FileImage size={14} color="#C8A84B" style={{ marginTop: 1, flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>{ex.name}</div>
                                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>{ex.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Drop zone */}
                <div
                    onDrop={handleDrop}
                    onDragOver={e => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        border: `2px dashed ${dragging ? '#C8A84B' : 'var(--color-border-strong)'}`,
                        borderRadius: 12, padding: '28px 20px', textAlign: 'center', cursor: 'pointer',
                        background: dragging ? 'rgba(200,168,75,0.06)' : 'var(--color-surface-raised)',
                        transition: 'all 0.2s', marginBottom: 14,
                    }}
                >
                    <Upload size={28} color={dragging ? '#C8A84B' : 'var(--color-text-secondary)'} style={{ margin: '0 auto 10px' }} />
                    <div style={{ fontSize: 14, fontWeight: 600, color: dragging ? 'var(--color-gold)' : 'var(--color-text-primary)', marginBottom: 4 }}>
                        اسحب الصور هنا أو انقر للاختيار
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                        JPG · PNG · WebP — حتى 10 ميجابايت للصورة، 200 صورة كحد أقصى
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        style={{ display: 'none' }}
                        onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = '' }}
                    />
                </div>

                {/* Selected files list */}
                {files.length > 0 && !result && (
                    <div style={sectionBox}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                الصور المحددة ({files.length})
                            </div>
                            <button
                                onClick={() => setFiles([])}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--color-text-secondary)' }}
                            >
                                مسح الكل
                            </button>
                        </div>
                        <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {files.map((f, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 8px', background: 'rgba(200,168,75,0.05)', borderRadius: 6 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                        <FileImage size={13} color="#C8A84B" />
                                        <span style={{ fontSize: 12, color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>{f.name}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{(f.size / 1024).toFixed(0)} KB</span>
                                        <button
                                            onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: 0 }}
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Results */}
                {result && (
                    <div style={{ marginBottom: 14 }}>
                        {/* Summary cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
                            <div style={{ padding: '12px 14px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, textAlign: 'center' }}>
                                <div style={{ fontSize: 22, fontWeight: 700, color: '#22c55e' }}>{result.matched_count}</div>
                                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>تم الربط بنجاح</div>
                            </div>
                            <div style={{ padding: '12px 14px', background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: 10, textAlign: 'center' }}>
                                <div style={{ fontSize: 22, fontWeight: 700, color: '#eab308' }}>{result.unmatched_count}</div>
                                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>لم يُعثر على منتج</div>
                            </div>
                            <div style={{ padding: '12px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, textAlign: 'center' }}>
                                <div style={{ fontSize: 22, fontWeight: 700, color: '#ef4444' }}>{result.error_count}</div>
                                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>أخطاء</div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                            {(['matched', 'unmatched', 'errors'] as const).map(tab => {
                                const labels = { matched: `نجح (${result.matched_count})`, unmatched: `غير مطابق (${result.unmatched_count})`, errors: `أخطاء (${result.error_count})` }
                                const active = activeTab === tab
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        style={{
                                            padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: active ? 700 : 500,
                                            background: active ? 'rgba(200,168,75,0.15)' : 'var(--color-surface-raised)',
                                            border: active ? '1px solid rgba(200,168,75,0.5)' : '1px solid var(--color-border)',
                                            color: active ? 'var(--color-gold)' : 'var(--color-text-secondary)',
                                            cursor: 'pointer', fontFamily: 'inherit',
                                        }}
                                    >
                                        {labels[tab]}
                                    </button>
                                )
                            })}
                        </div>

                        <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 5 }}>
                            {activeTab === 'matched' && result.matched.map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 8 }}>
                                    <CheckCircle2 size={14} color="#22c55e" style={{ flexShrink: 0 }} />
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--color-text-primary)' }}>{item.filename}</span>
                                            <span style={{ fontSize: 11, color: '#22c55e', background: 'rgba(34,197,94,0.12)', padding: '1px 6px', borderRadius: 4 }}>{item.sku}</span>
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>{item.product_name}</div>
                                    </div>
                                </div>
                            ))}

                            {activeTab === 'unmatched' && result.unmatched.map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.15)', borderRadius: 8 }}>
                                    <AlertCircle size={14} color="#eab308" style={{ flexShrink: 0 }} />
                                    <div>
                                        <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--color-text-primary)' }}>{item.filename}</div>
                                        <div style={{ fontSize: 11, color: '#eab308', marginTop: 2 }}>الكود المُستخرج: <span style={{ fontFamily: 'monospace' }}>{item.parsed_sku}</span> — لم يُعثر على منتج</div>
                                    </div>
                                </div>
                            ))}

                            {activeTab === 'errors' && result.errors.map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8 }}>
                                    <XCircle size={14} color="#ef4444" style={{ flexShrink: 0 }} />
                                    <div>
                                        <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--color-text-primary)' }}>{item.filename}</div>
                                        <div style={{ fontSize: 11, color: '#ef4444', marginTop: 2 }}>{item.error}</div>
                                    </div>
                                </div>
                            ))}

                            {activeTab === 'matched' && result.matched.length === 0 && (
                                <div style={{ textAlign: 'center', padding: 20, color: 'var(--color-text-secondary)', fontSize: 13 }}>لا يوجد</div>
                            )}
                            {activeTab === 'unmatched' && result.unmatched.length === 0 && (
                                <div style={{ textAlign: 'center', padding: 20, color: '#22c55e', fontSize: 13 }}>جميع الصور وجدت منتجات مطابقة ✓</div>
                            )}
                            {activeTab === 'errors' && result.errors.length === 0 && (
                                <div style={{ textAlign: 'center', padding: 20, color: '#22c55e', fontSize: 13 }}>لا أخطاء ✓</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                    {result && (
                        <button
                            onClick={() => { setFiles([]); setResult(null) }}
                            style={{
                                padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                                background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)',
                                color: 'var(--color-text-primary)', cursor: 'pointer', fontFamily: 'inherit',
                            }}
                        >
                            رفع صور جديدة
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        style={{
                            padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                            background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)',
                            color: 'var(--color-text-secondary)', cursor: 'pointer', fontFamily: 'inherit',
                        }}
                    >
                        إغلاق
                    </button>
                    {!result && (
                        <button
                            onClick={handleUpload}
                            disabled={uploading || files.length === 0}
                            style={{
                                padding: '9px 22px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                                background: uploading || files.length === 0 ? 'rgba(200,168,75,0.3)' : 'var(--color-gold)',
                                border: 'none', color: uploading || files.length === 0 ? 'rgba(255,255,255,0.5)' : '#1a1206',
                                cursor: uploading || files.length === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                                display: 'flex', alignItems: 'center', gap: 8,
                            }}
                        >
                            {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                            {uploading ? `جارٍ الرفع…` : `رفع ${files.length > 0 ? files.length + ' صورة' : 'الصور'}`}
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    )
}
