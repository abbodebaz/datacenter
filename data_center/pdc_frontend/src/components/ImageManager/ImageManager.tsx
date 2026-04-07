/**
 * ImageManager — upload, preview, change type, delete product images.
 * Uses R2 presigned URLs for direct upload.
 */
import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Star, Loader2, ImagePlus, CheckCircle, Clock } from 'lucide-react'
import { productsAPI } from '@/api/client'
import { toast } from 'react-toastify'

interface ProductImage {
    id: number
    image_type: string
    url: string
    order: number
    status: string
    is_ai_generated: boolean
    created_at: string
}

const IMAGE_TYPE_LABELS: Record<string, string> = {
    main: 'الرئيسية',
    gallery: 'معرض',
    detail: 'تفاصيل',
    lifestyle: 'ديكورية',
    technical: 'تقني',
}

const IMAGE_TYPE_COLORS: Record<string, string> = {
    main: '#C8A84B',
    gallery: '#4b8ec8',
    detail: '#4bc896',
    lifestyle: '#c84b8e',
    technical: '#8e4bc8',
}

interface Props {
    productId: number
}

export default function ImageManager({ productId }: Props) {
    const qc = useQueryClient()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedType, setSelectedType] = useState<string>('gallery')
    const [uploading, setUploading] = useState(false)
    const [dragOver, setDragOver] = useState(false)

    const { data: images = [], isLoading } = useQuery<ProductImage[]>({
        queryKey: ['product-images', productId],
        queryFn: () => productsAPI.listImages(productId).then(r => r.data),
        enabled: !!productId,
    })

    const deleteMutation = useMutation({
        mutationFn: (imageId: number) => productsAPI.deleteImage(productId, imageId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['product-images', productId] })
            toast.success('تم حذف الصورة')
        },
        onError: () => toast.error('فشل حذف الصورة'),
    })

    const changeTypeMutation = useMutation({
        mutationFn: ({ imageId, image_type }: { imageId: number; image_type: string }) =>
            productsAPI.updateImage(productId, imageId, { image_type }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['product-images', productId] })
            toast.success('تم تغيير نوع الصورة')
        },
    })

    const approveMutation = useMutation({
        mutationFn: (imageId: number) =>
            productsAPI.updateImage(productId, imageId, { status: 'approved' }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['product-images', productId] })
            toast.success('تم اعتماد الصورة بنجاح')
        },
        onError: () => toast.error('فشل اعتماد الصورة'),
    })

    const handleFiles = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return
        const file = files[0]
        if (!file.type.startsWith('image/')) {
            toast.error('يُسمح بالصور فقط')
            return
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error('الحجم الأقصى 10 ميجابايت')
            return
        }

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('image_type', selectedType)

            await productsAPI.uploadImageFile(productId, formData)

            qc.invalidateQueries({ queryKey: ['product-images', productId] })
            toast.success('تم رفع الصورة بنجاح')
        } catch (err: unknown) {
            console.error(err)
            const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
            toast.error(msg || 'فشل رفع الصورة، حاول مجدداً')
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }, [productId, selectedType, qc])

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        handleFiles(e.dataTransfer.files)
    }

    const mainImage = images.find(i => i.image_type === 'main')
    const otherImages = images.filter(i => i.image_type !== 'main')

    return (
        <div className="card p-24" style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3>صور المنتج</h3>
                <span style={{ fontSize: 12, color: 'var(--color-warm-gray)' }}>
                    {images.length} صورة
                </span>
            </div>

            {/* Upload Area */}
            <div style={{ marginBottom: 20 }}>
                <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: 'var(--color-warm-gray)', marginBottom: 8, fontWeight: 500 }}>
                        نوع الصورة المراد رفعها:
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {Object.entries(IMAGE_TYPE_LABELS).map(([key, label]) => {
                            const isActive = selectedType === key
                            const color = IMAGE_TYPE_COLORS[key]
                            return (
                                <button
                                    key={key}
                                    onClick={() => setSelectedType(key)}
                                    style={{
                                        padding: '7px 16px',
                                        borderRadius: 8,
                                        border: isActive ? `2px solid ${color}` : '2px solid var(--color-sand)',
                                        background: isActive ? `${color}18` : 'var(--color-surface)',
                                        color: isActive ? color : 'var(--color-charcoal)',
                                        fontSize: 13,
                                        fontWeight: isActive ? 600 : 400,
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                        transition: 'all .15s',
                                        display: 'flex', alignItems: 'center', gap: 5,
                                        boxShadow: isActive ? `0 2px 8px ${color}25` : 'none',
                                    }}
                                >
                                    <span style={{
                                        width: 8, height: 8, borderRadius: '50%',
                                        background: color, flexShrink: 0,
                                        boxShadow: isActive ? `0 0 0 3px ${color}30` : 'none',
                                    }} />
                                    {key === 'main' && <Star size={11} style={{ color: color, flexShrink: 0 }} />}
                                    {label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    style={{
                        border: `2px dashed ${dragOver ? 'var(--color-gold)' : 'var(--color-border)'}`,
                        borderRadius: 12,
                        padding: '28px 20px',
                        textAlign: 'center',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        background: dragOver ? 'rgba(200,168,75,0.05)' : 'transparent',
                        transition: 'all .2s',
                    }}
                >
                    {uploading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <Loader2 size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--color-gold)' }} />
                            <span style={{ fontSize: 13, color: 'var(--color-warm-gray)' }}>جاري الرفع...</span>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <ImagePlus size={28} style={{ color: 'var(--color-warm-gray)' }} />
                            <span style={{ fontSize: 13, color: 'var(--color-warm-gray)' }}>
                                اسحب صورة هنا أو <span style={{ color: 'var(--color-gold)' }}>تصفح</span>
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--color-warm-gray)', opacity: 0.7 }}>
                                PNG، JPG، WebP — حتى 10 MB • النوع: {IMAGE_TYPE_LABELS[selectedType]}
                            </span>
                        </div>
                    )}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => handleFiles(e.target.files)}
                />
            </div>

            {/* Images Grid */}
            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-warm-gray)', fontSize: 13 }}>
                    <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} />
                </div>
            ) : images.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--color-warm-gray)', fontSize: 13 }}>
                    لا توجد صور بعد
                </div>
            ) : (
                <div>
                    {/* Main image */}
                    {mainImage && (
                        <div style={{ marginBottom: 16 }}>
                            <p style={{ fontSize: 11, color: 'var(--color-gold)', marginBottom: 8, fontWeight: 600 }}>
                                ★ الصورة الرئيسية
                            </p>
                            <ImageCard
                                image={mainImage}
                                onDelete={() => deleteMutation.mutate(mainImage.id)}
                                onChangeType={(type) => changeTypeMutation.mutate({ imageId: mainImage.id, image_type: type })}
                                onApprove={() => approveMutation.mutate(mainImage.id)}
                                deleting={deleteMutation.isPending}
                                approving={approveMutation.isPending}
                            />
                        </div>
                    )}

                    {/* Other images */}
                    {otherImages.length > 0 && (
                        <div>
                            <p style={{ fontSize: 11, color: 'var(--color-warm-gray)', marginBottom: 8 }}>
                                باقي الصور ({otherImages.length})
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                                {otherImages.map(img => (
                                    <ImageCard
                                        key={img.id}
                                        image={img}
                                        onDelete={() => deleteMutation.mutate(img.id)}
                                        onChangeType={(type) => changeTypeMutation.mutate({ imageId: img.id, image_type: type })}
                                        onApprove={() => approveMutation.mutate(img.id)}
                                        deleting={deleteMutation.isPending}
                                        approving={approveMutation.isPending}
                                        compact
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}

function ImageCard({
    image,
    onDelete,
    onChangeType,
    onApprove,
    deleting,
    approving,
    compact = false,
}: {
    image: ProductImage
    onDelete: () => void
    onChangeType: (type: string) => void
    onApprove: () => void
    deleting: boolean
    approving: boolean
    compact?: boolean
}) {
    const isPending = image.status === 'pending_review'
    const [showMenu, setShowMenu] = useState(false)
    const btnRef = useRef<HTMLButtonElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null)

    useEffect(() => {
        if (showMenu && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect()
            const menuWidth = 170
            let left = rect.right - menuWidth
            if (left < 8) left = 8
            let top = rect.top - 8
            setMenuPos({ top, left })
        }
    }, [showMenu])

    useEffect(() => {
        if (!showMenu) return
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
                btnRef.current && !btnRef.current.contains(e.target as Node)) {
                setShowMenu(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [showMenu])

    return (
        <div style={{
            position: 'relative', borderRadius: 10, overflow: 'hidden', background: 'var(--color-cream)',
            outline: isPending ? '2px solid #f59e0b' : 'none',
        }}>
            <img
                src={image.url}
                alt=""
                style={{
                    width: '100%',
                    height: compact ? 120 : 200,
                    objectFit: 'cover',
                    display: 'block',
                    opacity: isPending ? 0.85 : 1,
                }}
                onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/161f2a/C8A84B?text=صورة' }}
            />

            {/* Type badge */}
            <div style={{
                position: 'absolute', top: 8, right: 8,
                background: IMAGE_TYPE_COLORS[image.image_type] ?? '#666',
                color: 'var(--color-text-inverse)', fontSize: 11, padding: '3px 10px',
                borderRadius: 20, fontWeight: 600,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}>
                {image.image_type === 'main' && '★ '}
                {IMAGE_TYPE_LABELS[image.image_type] ?? image.image_type}
            </div>

            {/* Pending badge */}
            {isPending && (
                <div style={{
                    position: 'absolute', top: 8, left: 8,
                    background: 'rgba(245,158,11,0.9)',
                    color: '#fff', fontSize: 10, padding: '3px 8px',
                    borderRadius: 20, fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 4,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}>
                    <Clock size={10} />
                    قيد المراجعة
                </div>
            )}

            {/* Actions overlay */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
                padding: isPending ? '8px 10px 8px' : '24px 10px 10px',
                display: 'flex', flexDirection: 'column', gap: 6,
            }}>
                {/* Approve button — shown only for pending */}
                {isPending && (
                    <button
                        onClick={onApprove}
                        disabled={approving}
                        style={{
                            background: 'rgba(34,197,94,0.9)', border: 'none',
                            borderRadius: 8, padding: '7px 12px', color: '#fff',
                            fontSize: 12, cursor: approving ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                            fontFamily: 'inherit', fontWeight: 600,
                            backdropFilter: 'blur(4px)',
                            transition: 'all 0.15s',
                            width: '100%',
                        }}
                    >
                        {approving ? <Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> : <CheckCircle size={12} />}
                        اعتماد الصورة
                    </button>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                {/* Change type */}
                <button
                    ref={btnRef}
                    onClick={() => setShowMenu(p => !p)}
                    style={{
                        background: showMenu ? 'rgba(200,168,75,0.3)' : 'var(--color-surface-hover)',
                        border: showMenu ? '1px solid rgba(200,168,75,0.5)' : '1px solid var(--color-border-strong)',
                        borderRadius: 8, padding: '6px 12px', color: 'var(--color-text-primary)',
                        fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', gap: 5,
                        backdropFilter: 'blur(4px)',
                        transition: 'all 0.15s',
                    }}
                >
                    تغيير النوع
                </button>

                {/* Delete */}
                <button
                    onClick={onDelete}
                    disabled={deleting}
                    style={{
                        background: 'rgba(220,60,60,0.85)', border: 'none',
                        borderRadius: 8, padding: '6px 12px', color: 'var(--color-text-primary)',
                        fontSize: 12, cursor: deleting ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: 5,
                        fontFamily: 'inherit',
                        backdropFilter: 'blur(4px)',
                        transition: 'all 0.15s',
                    }}
                >
                    <Trash2 size={12} />
                    حذف
                </button>
                </div>
            </div>

            {showMenu && menuPos && createPortal(
                <div
                    ref={menuRef}
                    style={{
                        position: 'fixed',
                        top: menuPos.top,
                        left: menuPos.left,
                        transform: 'translateY(-100%)',
                        background: 'var(--color-surface)',
                        borderRadius: 10, padding: 6, zIndex: 9999, minWidth: 170,
                        boxShadow: '0 4px 24px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)',
                        direction: 'rtl',
                    }}
                >
                    <div style={{ padding: '6px 10px 8px', fontSize: 11, color: '#888', fontWeight: 600 }}>
                        اختر النوع الجديد
                    </div>
                    {Object.entries(IMAGE_TYPE_LABELS).filter(([k]) => k !== image.image_type).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => { onChangeType(key); setShowMenu(false) }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                width: '100%', textAlign: 'right',
                                padding: '9px 12px', background: 'none', border: 'none',
                                color: '#333', fontSize: 13,
                                cursor: 'pointer', fontFamily: 'inherit', borderRadius: 6,
                                transition: 'background 0.1s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#f5f0e8')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            <span style={{
                                width: 10, height: 10, borderRadius: '50%',
                                background: IMAGE_TYPE_COLORS[key],
                                flexShrink: 0,
                                border: '2px solid #fff',
                                boxShadow: `0 0 0 1px ${IMAGE_TYPE_COLORS[key]}`,
                            }} />
                            <span style={{ flex: 1, fontWeight: 500 }}>{label}</span>
                            {key === 'main' && <Star size={12} style={{ color: '#C8A84B', flexShrink: 0 }} />}
                        </button>
                    ))}
                    <div style={{ borderTop: '1px solid #e8e0d0', margin: '4px 8px 2px' }} />
                    <button
                        onClick={() => setShowMenu(false)}
                        style={{
                            display: 'block', width: '100%', textAlign: 'center',
                            padding: '7px 10px', background: 'none', border: 'none',
                            color: '#999', fontSize: 12,
                            cursor: 'pointer', fontFamily: 'inherit', borderRadius: 6,
                        }}
                    >
                        إلغاء
                    </button>
                </div>,
                document.body
            )}
        </div>
    )
}
