/**
 * ProductLogsModal — سجل العمليات لمنتج معين
 */
import { useQuery } from '@tanstack/react-query'
import {
    X, PackagePlus, Pencil, Upload, Eye, Trash2,
    CheckCircle, XCircle, Sparkles, RefreshCw,
    Send, ThumbsUp, ThumbsDown, Clock, Image as ImageIcon,
} from 'lucide-react'
import { logsAPI } from '@/api/client'
import type { AuditLog } from '@/types'

interface ActionMeta { icon: JSX.Element; color: string; bg: string }

const ACTION_META: Record<string, ActionMeta> = {
    create_product:       { icon: <PackagePlus size={13} />, color: '#60A5FA', bg: 'rgba(96,165,250,0.18)' },
    update_product:       { icon: <Pencil size={13} />,      color: 'var(--color-gold)', bg: 'rgba(200,168,75,0.18)' },
    publish_product:      { icon: <Eye size={13} />,         color: '#34D399', bg: 'rgba(52,211,153,0.18)' },
    delete_product:       { icon: <Trash2 size={13} />,      color: '#F87171', bg: 'rgba(248,113,113,0.18)' },
    upload_image:         { icon: <Upload size={13} />,      color: '#A78BFA', bg: 'rgba(167,139,250,0.18)' },
    approve_image:        { icon: <CheckCircle size={13} />, color: '#34D399', bg: 'rgba(52,211,153,0.18)' },
    reject_image:         { icon: <XCircle size={13} />,     color: '#F87171', bg: 'rgba(248,113,113,0.18)' },
    generate_description: { icon: <Sparkles size={13} />,   color: '#FBBF24', bg: 'rgba(251,191,36,0.18)'  },
    generate_image:       { icon: <ImageIcon size={13} />,   color: '#FBBF24', bg: 'rgba(251,191,36,0.18)'  },
    sap_sync:             { icon: <RefreshCw size={13} />,   color: '#94A3B8', bg: 'rgba(148,163,184,0.15)' },
    approval_submit:      { icon: <Send size={13} />,        color: '#60A5FA', bg: 'rgba(96,165,250,0.18)' },
    approval_approve:     { icon: <ThumbsUp size={13} />,    color: '#34D399', bg: 'rgba(52,211,153,0.18)' },
    approval_reject:      { icon: <ThumbsDown size={13} />,  color: '#F87171', bg: 'rgba(248,113,113,0.18)' },
}

const DEFAULT_META: ActionMeta = {
    icon: <Clock size={13} />, color: '#94A3B8', bg: 'rgba(148,163,184,0.15)',
}

const fmtDate = (iso: string) => {
    const d = new Date(iso)
    return {
        date: d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' }),
        time: d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    }
}

const groupByDay = (logs: AuditLog[]) => {
    const groups: { label: string; items: AuditLog[] }[] = []
    let current: typeof groups[0] | null = null
    for (const log of logs) {
        const { date } = fmtDate(log.created_at)
        if (!current || current.label !== date) {
            current = { label: date, items: [] }
            groups.push(current)
        }
        current.items.push(log)
    }
    return groups
}

interface Props {
    productId: number
    productName: string
    productSku: string
    onClose: () => void
}

export default function ProductLogsModal({ productId, productName, productSku, onClose }: Props) {
    const { data, isLoading } = useQuery({
        queryKey: ['product-logs', productId],
        queryFn: () => logsAPI.forProduct(productId).then(r => r.data),
        staleTime: 0,
        refetchOnMount: true,
    })

    const logs: AuditLog[] = data?.results ?? []
    const groups = groupByDay(logs)

    return (
        <>
            {/* Modal */}
            <div style={{
                position: 'fixed',
                top: '50%', right: '50%',
                transform: 'translate(50%, -50%)',
                width: 520,
                maxWidth: 'calc(100vw - 24px)',
                maxHeight: '82vh',
                background: 'var(--color-surface-raised)',
                borderRadius: 20,
                zIndex: 901,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px var(--color-border-strong)',
                overflow: 'hidden',
                color: 'var(--color-text-primary)',
            }}>

                {/* رأس المودال */}
                <div style={{
                    padding: '20px 22px 16px',
                    borderBottom: '1px solid var(--color-border-strong)',
                    background: 'var(--color-surface-hover)',
                    flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <div style={{
                                    width: 30, height: 30,
                                    borderRadius: 8,
                                    background: 'rgba(200,168,75,0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Clock size={15} color="var(--color-gold)" />
                                </div>
                                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                    سجل العمليات
                                </h3>
                            </div>
                            <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)', paddingRight: 38 }}>
                                {productName}
                                <span style={{
                                    marginRight: 8,
                                    fontFamily: 'monospace', fontSize: 11,
                                    background: 'var(--color-border-strong)',
                                    color: '#cbd5e1',
                                    padding: '2px 7px', borderRadius: 5,
                                }}>
                                    {productSku}
                                </span>
                            </p>
                        </div>
                        <button onClick={onClose} style={{
                            background: 'var(--color-border)',
                            border: '1px solid var(--color-border-strong)',
                            borderRadius: 8, cursor: 'pointer',
                            color: 'var(--color-text-primary)', padding: '6px 7px',
                            display: 'flex', alignItems: 'center',
                            transition: 'background .15s',
                        }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-border-strong)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-border)')}
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* المحتوى */}
                <div style={{ overflowY: 'auto', flex: 1, padding: '16px 22px', background: 'var(--color-surface)' }}>
                    {isLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[...Array(4)].map((_, i) => (
                                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                    <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }} />
                                    <div className="skeleton" style={{ flex: 1, height: 52, borderRadius: 10 }} />
                                </div>
                            ))}
                        </div>
                    ) : logs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                            <div style={{
                                width: 56, height: 56,
                                borderRadius: '50%',
                                background: 'var(--color-surface-raised)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 14px',
                            }}>
                                <Clock size={24} strokeWidth={1.5} color="var(--color-text-muted)" />
                            </div>
                            <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                لا يوجد سجل بعد
                            </p>
                            <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)' }}>
                                ستظهر هنا كل عملية تتم على هذا المنتج
                            </p>
                        </div>
                    ) : (
                        <div>
                            {groups.map((group) => (
                                <div key={group.label} style={{ marginBottom: 20 }}>
                                    {/* فاصل اليوم */}
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
                                    }}>
                                        <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                                        <span style={{
                                            fontSize: 11, fontWeight: 600,
                                            color: '#cbd5e1',
                                            background: 'var(--color-surface-raised)',
                                            padding: '2px 10px',
                                            borderRadius: 20,
                                            border: '1px solid var(--color-border-strong)',
                                        }}>
                                            {group.label}
                                        </span>
                                        <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                                    </div>

                                    {/* قائمة العمليات */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {group.items.map((log) => {
                                            const meta = ACTION_META[log.action] ?? DEFAULT_META
                                            const { time } = fmtDate(log.created_at)
                                            return (
                                                <div key={log.id} style={{
                                                    display: 'flex', gap: 12, alignItems: 'flex-start',
                                                }}>
                                                    {/* أيقونة العملية */}
                                                    <div style={{
                                                        width: 32, height: 32,
                                                        borderRadius: 10,
                                                        background: meta.bg,
                                                        border: `1px solid ${meta.color}40`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        flexShrink: 0, color: meta.color,
                                                        marginTop: 2,
                                                    }}>
                                                        {meta.icon}
                                                    </div>

                                                    {/* بطاقة التفاصيل */}
                                                    <div style={{
                                                        flex: 1,
                                                        background: 'var(--color-surface-raised)',
                                                        border: '1px solid var(--color-border-strong)',
                                                        borderRadius: 12,
                                                        padding: '10px 14px',
                                                    }}>
                                                        <div style={{
                                                            display: 'flex', alignItems: 'center',
                                                            justifyContent: 'space-between', gap: 8,
                                                        }}>
                                                            <span style={{
                                                                fontSize: 13, fontWeight: 600,
                                                                color: meta.color,
                                                            }}>
                                                                {log.action_display ?? log.action}
                                                            </span>
                                                            <span style={{
                                                                fontSize: 11, color: 'var(--color-text-muted)',
                                                                fontFamily: 'monospace', flexShrink: 0,
                                                            }}>
                                                                {time}
                                                            </span>
                                                        </div>

                                                        {log.details && (() => {
                                                            const lines = log.details.split('\n').filter(Boolean)
                                                            const header = lines[0]
                                                            const changes = lines.slice(1)
                                                            return (
                                                                <div style={{ marginTop: 6 }}>
                                                                    {/* السطر الأول: وصف العملية */}
                                                                    <p style={{
                                                                        margin: '0 0 4px',
                                                                        fontSize: 12,
                                                                        color: '#e2e8f0',
                                                                        lineHeight: 1.5,
                                                                    }}>
                                                                        {header}
                                                                    </p>
                                                                    {/* التغييرات الحقلية */}
                                                                    {changes.length > 0 && (
                                                                        <div style={{
                                                                            marginTop: 5,
                                                                            display: 'flex',
                                                                            flexDirection: 'column',
                                                                            gap: 3,
                                                                        }}>
                                                                            {changes.map((line, idx) => {
                                                                                // تحليل: "الاسم (عربي): [قديم] ← [جديد]"
                                                                                const arrowIdx = line.indexOf('←')
                                                                                const colonIdx = line.indexOf(':')
                                                                                if (arrowIdx > -1 && colonIdx > -1) {
                                                                                    const fieldLabel = line.slice(0, colonIdx).trim()
                                                                                    const rest = line.slice(colonIdx + 1).trim()
                                                                                    const [oldPart, newPart] = rest.split('←').map(s => s.trim())
                                                                                    const oldVal = oldPart?.replace(/^\[|\]$/g, '') ?? ''
                                                                                    const newVal = newPart?.replace(/^\[|\]$/g, '') ?? ''
                                                                                    return (
                                                                                        <div key={idx} style={{
                                                                                            background: 'var(--color-surface-raised)',
                                                                                            border: '1px solid var(--color-border)',
                                                                                            borderRadius: 6,
                                                                                            padding: '4px 8px',
                                                                                            fontSize: 11,
                                                                                            display: 'flex',
                                                                                            alignItems: 'center',
                                                                                            gap: 6,
                                                                                            flexWrap: 'wrap',
                                                                                        }}>
                                                                                            <span style={{ color: 'var(--color-text-muted)', fontWeight: 600, flexShrink: 0 }}>
                                                                                                {fieldLabel}
                                                                                            </span>
                                                                                            <span style={{
                                                                                                color: '#F87171',
                                                                                                background: 'rgba(248,113,113,0.1)',
                                                                                                padding: '1px 5px', borderRadius: 4,
                                                                                                textDecoration: 'line-through',
                                                                                                maxWidth: 120, overflow: 'hidden',
                                                                                                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                                                            }} title={oldVal}>
                                                                                                {oldVal || '—'}
                                                                                            </span>
                                                                                            <span style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>←</span>
                                                                                            <span style={{
                                                                                                color: '#34D399',
                                                                                                background: 'rgba(52,211,153,0.1)',
                                                                                                padding: '1px 5px', borderRadius: 4,
                                                                                                maxWidth: 120, overflow: 'hidden',
                                                                                                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                                                            }} title={newVal}>
                                                                                                {newVal || '—'}
                                                                                            </span>
                                                                                        </div>
                                                                                    )
                                                                                }
                                                                                return (
                                                                                    <p key={idx} style={{
                                                                                        margin: 0, fontSize: 11, color: 'var(--color-text-muted)',
                                                                                    }}>{line}</p>
                                                                                )
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )
                                                        })()}

                                                        <div style={{
                                                            marginTop: 6,
                                                            fontSize: 11,
                                                            color: 'var(--color-text-muted)',
                                                            display: 'flex', alignItems: 'center', gap: 5,
                                                        }}>
                                                            <div style={{
                                                                width: 16, height: 16, borderRadius: '50%',
                                                                background: 'rgba(200,168,75,0.25)',
                                                                display: 'flex', alignItems: 'center',
                                                                justifyContent: 'center', fontSize: 9,
                                                                color: 'var(--color-gold)', fontWeight: 700,
                                                            }}>
                                                                {log.user_name?.charAt(0) ?? '?'}
                                                            </div>
                                                            <span style={{ color: '#cbd5e1' }}>
                                                                {log.user_name ?? '—'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* تذييل */}
                {!isLoading && logs.length > 0 && (
                    <div style={{
                        padding: '10px 22px',
                        borderTop: '1px solid var(--color-border-strong)',
                        background: 'var(--color-surface-hover)',
                        flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: 6,
                    }}>
                        <div style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: 'var(--color-gold)', flexShrink: 0,
                        }} />
                        <span style={{ fontSize: 12, color: '#cbd5e1' }}>
                            {logs.length} عملية مسجّلة
                        </span>
                    </div>
                )}
            </div>
        </>
    )
}
