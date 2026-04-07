/**
 * Audit Log — Screen 9
 * Full operations history with filters
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ScrollText, Search } from 'lucide-react'
import { logsAPI } from '@/api/client'
import type { AuditLog } from '@/types'

export default function AuditLogPage() {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')

    const { data, isLoading } = useQuery({
        queryKey: ['logs', page, search],
        queryFn: () => logsAPI.list({ page, page_size: 30, search }).then(r => r.data),
    })
    const logs: AuditLog[] = data?.results ?? []
    const totalCount = data?.count ?? 0

    const actionColor: Record<string, string> = {
        'user_login': '#1D4ED8', 'user_logout': '#6B7280',
        'product_create': '#15803D', 'product_update': '#D97706',
        'product_delete': '#DC2626', 'product_publish': '#15803D',
        'image_approve': '#15803D', 'image_reject': '#DC2626',
        'approval_approve': '#15803D', 'approval_reject': '#DC2626',
    }

    return (
        <div className="page-enter">
            <div className="page-header">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="page-header-title">سجل العمليات</h1>
                        <p className="page-header-sub">تتبع كامل لجميع الإجراءات في المنصة</p>
                    </div>
                </div>
            </div>

            <div className="card p-16" style={{ marginBottom: 24 }}>
                <div style={{ position: 'relative' }}>
                    <Search size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-warm-gray)' }} />
                    <input type="text" className="form-input" placeholder="بحث في السجل..."
                        value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                        style={{ paddingRight: 36 }} />
                </div>
            </div>

            <div className="data-table-wrapper">
                {isLoading ? (
                    <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-warm-gray)' }}>جاري التحميل...</div>
                ) : logs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--color-warm-gray)' }}>
                        <ScrollText size={48} strokeWidth={1} style={{ marginBottom: 16 }} />
                        <p>لا توجد سجلات</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>المستخدم</th>
                                <th>الإجراء</th>
                                <th>الكيان</th>
                                <th>التفاصيل</th>
                                <th>IP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log.id}>
                                    <td style={{ fontSize: 12, color: 'var(--color-warm-gray)', whiteSpace: 'nowrap' }}>
                                        {new Date(log.created_at).toLocaleString('ar-SA')}
                                    </td>
                                    <td style={{ fontWeight: 500, fontSize: 13 }}>{log.user_name}</td>
                                    <td>
                                        <span style={{
                                            background: `${actionColor[log.action] ?? '#6B7280'}15`,
                                            color: actionColor[log.action] ?? '#6B7280',
                                            padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                                            fontFamily: 'var(--font-mono)',
                                        }}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 12 }}>{log.content_type}</td>
                                    <td style={{ fontSize: 12, color: 'var(--color-warm-gray)', maxWidth: 280 }}>
                                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {log.details || log.object_repr}
                                        </div>
                                    </td>
                                    <td><code className="text-mono" style={{ fontSize: 11 }}>{log.ip_address}</code></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {totalCount > 30 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                    <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>السابق</button>
                    <span style={{ display: 'flex', alignItems: 'center', padding: '0 16px', fontSize: 13 }}>{page} من {Math.ceil(totalCount / 30)}</span>
                    <button className="btn btn-ghost btn-sm" disabled={page * 30 >= totalCount} onClick={() => setPage(p => p + 1)}>التالي</button>
                </div>
            )}
        </div>
    )
}
