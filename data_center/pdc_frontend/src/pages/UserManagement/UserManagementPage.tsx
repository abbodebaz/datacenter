/**
 * User Management — Screen 6
 * Super Admin only — CRUD: create/edit/toggle users, assign roles & departments
 */
import { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    Users, Plus, Edit3, Shield, Search, X,
    ToggleLeft, ToggleRight, Eye, EyeOff, UserX, UserCheck,
} from 'lucide-react'
import { usersAPI, categoriesAPI } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'react-toastify'

/* ── Types ── */
interface ManagedUser {
    id: number; email: string; name_ar: string; name_en: string
    role: string; role_display: string; department: number | null
    department_name: string | null; is_active: boolean; avatar: string
    date_joined: string; last_login: string | null
    permissions: { can_add_product: boolean; can_publish_product: boolean; can_generate_catalog: boolean; can_view_reports: boolean; can_manage_users: boolean }
}
interface Category { id: number; name_ar: string; slug: string }

/* ── Constants ── */
const ROLES = [
    { value: 'super_admin', label: 'مدير النظام', color: 'var(--color-gold)' },
    { value: 'مدير_قسم', label: 'مدير قسم', color: '#4A90D9' },
    { value: 'مبيعات', label: 'مبيعات', color: '#9B59B6' },
    { value: 'تسويق', label: 'تسويق', color: '#27AE60' },
    { value: 'عام', label: 'عام', color: '#95A5A6' },
]
const ROLE_BADGE: Record<string, string> = {
    'super_admin': 'badge-active', 'مدير_قسم': 'badge-periodic',
    'مبيعات': 'badge-pending', 'تسويق': 'badge-stock', 'عام': 'badge-draft',
}

/* ── Shared dark-theme styles ── */
const lStyle: React.CSSProperties = { display: 'block', fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 7, fontWeight: 600, letterSpacing: 0.2 }
const iStyle: React.CSSProperties = {
    display: 'block', width: '100%', padding: '11px 14px',
    border: '1px solid var(--color-border-strong)', borderRadius: 9, fontSize: 13,
    fontFamily: 'inherit', outline: 'none',
    boxSizing: 'border-box', color: 'var(--color-text-primary)', background: 'var(--color-surface-raised)',
    transition: 'border-color .15s',
}

/* ══════════════════════════════════════
   User Form Modal (Create / Edit)
══════════════════════════════════════ */
function UserFormModal({ existing, categories, onClose }: {
    existing?: ManagedUser; categories: Category[]; onClose: () => void
}) {
    const isEdit = !!existing
    const qc = useQueryClient()
    const [showPass, setShowPass] = useState(false)
    const [form, setForm] = useState({
        name_ar: existing?.name_ar ?? '',
        name_en: existing?.name_en ?? '',
        email: existing?.email ?? '',
        role: existing?.role ?? 'عام',
        department: existing?.department ?? null as number | null,
        is_active: existing?.is_active ?? true,
        password: '',
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

    const validate = () => {
        const e: Record<string, string> = {}
        if (!form.name_ar.trim()) e.name_ar = 'الاسم بالعربية مطلوب'
        if (!form.email.trim()) e.email = 'البريد الإلكتروني مطلوب'
        if (!isEdit && form.password.length < 8) e.password = 'كلمة المرور 8 أحرف على الأقل'
        if (form.role === 'مدير_قسم' && !form.department) e.department = 'القسم مطلوب لمدير القسم'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const mutation = useMutation({
        mutationFn: () => {
            const payload: Record<string, unknown> = {
                name_ar: form.name_ar, name_en: form.name_en, email: form.email,
                role: form.role, department: form.role === 'مدير_قسم' ? form.department : null,
                is_active: form.is_active,
            }
            if (!isEdit) payload.password = form.password
            else if (form.password) payload.password = form.password
            if (isEdit) return usersAPI.update(existing!.id, payload)
            return usersAPI.create(payload)
        },
        onSuccess: () => {
            toast.success(isEdit ? 'تم تحديث المستخدم' : 'تم إنشاء المستخدم بنجاح')
            qc.invalidateQueries({ queryKey: ['users-mgmt'] })
            onClose()
        },
        onError: (err: unknown) => {
            const e = err as { response?: { data?: Record<string, string | string[]> } }
            if (e?.response?.data) {
                const msgs: Record<string, string> = {}
                for (const [k, v] of Object.entries(e.response.data)) {
                    msgs[k] = Array.isArray(v) ? v[0] : String(v)
                }
                setErrors(msgs)
            } else {
                toast.error('فشلت العملية')
            }
        },
    })

    const errColor = '#E74C3C'
    const fieldErr = (k: string) => errors[k]
        ? <span style={{ fontSize: 11, color: errColor, display: 'block', marginTop: 4 }}>{errors[k]}</span>
        : null

    // منع تمرير الصفحة خلف المودال
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = '' }
    }, [])

    return createPortal(
        <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '48px 20px 60px' }}>
            <div style={{ background: 'var(--color-surface)', borderRadius: 18, width: '100%', maxWidth: 580, flexShrink: 0, boxShadow: 'var(--shadow-lg)', border: '1px solid rgba(200,168,75,0.2)' }}>

                {/* ── Header ── */}
                <div style={{ padding: '22px 28px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(200,168,75,0.12)', border: '1px solid rgba(200,168,75,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {isEdit ? <Edit3 size={17} color="#C8A84B" /> : <Plus size={17} color="#C8A84B" />}
                        </div>
                        <div>
                            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                                {isEdit ? 'تعديل مستخدم' : 'مستخدم جديد'}
                            </h2>
                            {isEdit && <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 1 }}>{existing?.email}</div>}
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4, display: 'flex', borderRadius: 6, transition: 'color .15s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
                        <X size={19} />
                    </button>
                </div>

                {/* ── Body ── */}
                <div style={{ padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Names row */}
                    <div className="grid-2">
                        <div>
                            <label style={lStyle}>الاسم بالعربية *</label>
                            <input style={{ ...iStyle, borderColor: fieldErr('name_ar') ? errColor : 'var(--color-border-strong)' }}
                                value={form.name_ar} onChange={e => set('name_ar', e.target.value)} placeholder="أحمد محمد" />
                            {fieldErr('name_ar')}
                        </div>
                        <div>
                            <label style={lStyle}>الاسم بالإنجليزية</label>
                            <input style={iStyle} value={form.name_en} onChange={e => set('name_en', e.target.value)}
                                placeholder="Ahmed Mohammed" dir="ltr" />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label style={lStyle}>البريد الإلكتروني *</label>
                        <input style={{ ...iStyle, direction: 'ltr', opacity: isEdit ? 0.55 : 1, borderColor: fieldErr('email') ? errColor : 'var(--color-border-strong)' }}
                            type="email" value={form.email} onChange={e => set('email', e.target.value)}
                            placeholder="user@baytalebaa.com" disabled={isEdit} />
                        {isEdit && <span style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'block', marginTop: 4 }}>لا يمكن تغيير البريد الإلكتروني</span>}
                        {fieldErr('email')}
                    </div>

                    {/* Password */}
                    <div>
                        <label style={lStyle}>{isEdit ? 'كلمة مرور جديدة (اختياري)' : 'كلمة المرور *'}</label>
                        <div style={{ position: 'relative' }}>
                            <input style={{ ...iStyle, borderColor: fieldErr('password') ? errColor : 'var(--color-border-strong)', paddingLeft: 38 }}
                                type={showPass ? 'text' : 'password'} value={form.password}
                                onChange={e => set('password', e.target.value)}
                                placeholder={isEdit ? 'اتركها فارغة لعدم التغيير' : '8 أحرف على الأقل'} />
                            <button type="button" onClick={() => setShowPass(v => !v)}
                                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 0, display: 'flex' }}>
                                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        {fieldErr('password')}
                    </div>

                    {/* Role selector */}
                    <div>
                        <label style={lStyle}>الدور</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}>
                            {ROLES.map(r => {
                                const active = form.role === r.value
                                return (
                                    <button key={r.value} type="button" onClick={() => set('role', r.value)}
                                        style={{
                                            padding: '11px 8px', borderRadius: 9, cursor: 'pointer', fontSize: 13,
                                            fontFamily: 'inherit', fontWeight: active ? 700 : 400,
                                            border: `1.5px solid ${active ? r.color : 'var(--color-border-strong)'}`,
                                            background: active ? `${r.color}18` : 'var(--color-surface-raised)',
                                            color: active ? r.color : 'var(--color-text-secondary)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                                            transition: 'all .15s',
                                        }}>
                                        {r.value === 'super_admin' && <Shield size={11} />}
                                        {r.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Department — only for مدير_قسم */}
                    {form.role === 'مدير_قسم' && (
                        <div>
                            <label style={lStyle}>القسم / الفئة *</label>
                            <select style={{ ...iStyle, borderColor: fieldErr('department') ? errColor : 'var(--color-border-strong)' }}
                                value={form.department ?? ''} onChange={e => set('department', e.target.value ? Number(e.target.value) : null)}>
                                <option value="" style={{ background: 'var(--color-surface)' }}>اختر قسماً...</option>
                                {categories.map(c => <option key={c.id} value={c.id} style={{ background: 'var(--color-surface)' }}>{c.name_ar}</option>)}
                            </select>
                            {fieldErr('department')}
                        </div>
                    )}

                    {/* Active toggle — edit mode only */}
                    {isEdit && (
                        <button type="button" onClick={() => set('is_active', !form.is_active)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', width: '100%', textAlign: 'right',
                                background: form.is_active ? 'rgba(39,174,96,0.07)' : 'rgba(231,76,60,0.07)',
                                borderRadius: 10, border: `1px solid ${form.is_active ? 'rgba(39,174,96,0.22)' : 'rgba(231,76,60,0.22)'}`,
                                cursor: 'pointer', fontFamily: 'inherit',
                            }}>
                            <span style={{ color: form.is_active ? '#27AE60' : '#E74C3C', display: 'flex' }}>
                                {form.is_active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                            </span>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: form.is_active ? '#27AE60' : '#E74C3C' }}>
                                    {form.is_active ? 'الحساب نشط' : 'الحساب معطل'}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                                    {form.is_active ? 'يستطيع تسجيل الدخول' : 'ممنوع من تسجيل الدخول'}
                                </div>
                            </div>
                        </button>
                    )}
                </div>

                {/* ── Footer ── */}
                <div style={{ padding: '18px 28px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button onClick={onClose}
                        style={{ padding: '9px 20px', border: '1px solid var(--color-border-strong)', borderRadius: 8, background: 'transparent', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
                        إلغاء
                    </button>
                    <button onClick={() => { if (validate()) mutation.mutate() }} disabled={mutation.isPending}
                        style={{ padding: '9px 24px', border: 'none', borderRadius: 8, background: mutation.isPending ? 'rgba(200,168,75,0.4)' : 'linear-gradient(135deg,#C8A84B,#a8832f)', color: '#1a1a1a', cursor: mutation.isPending ? 'not-allowed' : 'pointer', fontSize: 13, fontFamily: 'inherit', fontWeight: 700 }}>
                        {mutation.isPending ? 'جاري الحفظ...' : isEdit ? 'حفظ التعديلات' : 'إنشاء المستخدم'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}

/* ══════════════════════════════════════
   Main Page
══════════════════════════════════════ */
export default function UserManagementPage() {
    const currentUser = useAuthStore(s => s.user)
    const qc = useQueryClient()
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [page, setPage] = useState(1)
    const [showCreate, setShowCreate] = useState(false)
    const [editingUser, setEditingUser] = useState<ManagedUser | null>(null)

    const params: Record<string, unknown> = { page, page_size: 20 }
    if (search) params.search = search
    if (roleFilter) params.role = roleFilter
    if (statusFilter) params.is_active = statusFilter

    const { data, isLoading } = useQuery({
        queryKey: ['users-mgmt', params],
        queryFn: () => usersAPI.list(params).then(r => r.data),
        placeholderData: (prev) => prev,
    })
    const users: ManagedUser[] = data?.results ?? []
    const totalCount = data?.count ?? 0
    const totalPages = Math.ceil(totalCount / 20)

    const { data: catsData } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoriesAPI.list().then(r => r.data),
        staleTime: 5 * 60 * 1000,
    })
    const categories: Category[] = Array.isArray(catsData) ? catsData : (catsData?.results ?? [])

    const toggleActiveMutation = useMutation({
        mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
            usersAPI.update(id, { is_active }),
        onSuccess: (_, vars) => {
            toast.success(vars.is_active ? 'تم تفعيل الحساب' : 'تم تعطيل الحساب')
            qc.invalidateQueries({ queryKey: ['users-mgmt'] })
        },
        onError: () => toast.error('فشل تحديث الحالة'),
    })

    const handleSearch = useCallback((v: string) => { setSearch(v); setPage(1) }, [])

    const selStyle: React.CSSProperties = {
        height: 38, padding: '0 12px', border: '1px solid var(--color-sand)',
        borderRadius: 8, fontSize: 13, fontFamily: 'inherit',
        color: 'var(--color-text-primary)', background: 'var(--color-surface-raised)', outline: 'none', cursor: 'pointer',
    }

    return (
        <div className="page-enter">
            <div className="page-header">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="page-header-title">إدارة المستخدمين</h1>
                        <p className="page-header-sub">{totalCount} مستخدم في المنصة</p>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
                        <Plus size={15} /> إضافة مستخدم
                    </button>
                </div>
            </div>

            {/* Filter bar */}
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
                    <Search size={14} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-warm-gray)', pointerEvents: 'none' }} />
                    <input style={{ width: '100%', height: 38, paddingRight: 34, paddingLeft: 12, border: '1px solid var(--color-sand)', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', color: 'var(--color-charcoal)', outline: 'none', boxSizing: 'border-box' }}
                        placeholder="بحث بالاسم أو البريد الإلكتروني..."
                        value={search} onChange={e => handleSearch(e.target.value)} />
                </div>
                <select style={selStyle} value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }}>
                    <option value="">كل الأدوار</option>
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                <select style={selStyle} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
                    <option value="">كل الحالات</option>
                    <option value="true">نشط</option>
                    <option value="false">معطل</option>
                </select>
                {(search || roleFilter || statusFilter) && (
                    <button onClick={() => { setSearch(''); setRoleFilter(''); setStatusFilter(''); setPage(1) }}
                        style={{ height: 38, padding: '0 14px', border: '1px solid rgba(224,112,112,0.4)', borderRadius: 8, background: 'rgba(224,112,112,0.06)', color: '#c0392b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontFamily: 'inherit' }}>
                        <X size={13} /> مسح
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="data-table-wrapper">
                {isLoading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-warm-gray)' }}>جاري التحميل...</div>
                ) : users.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '56px 0', color: 'var(--color-warm-gray)' }}>
                        <Users size={40} strokeWidth={1} style={{ marginBottom: 12, opacity: 0.4 }} />
                        <div style={{ fontSize: 15 }}>لا توجد نتائج</div>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>المستخدم</th>
                                <th>البريد الإلكتروني</th>
                                <th>الدور</th>
                                <th>القسم</th>
                                <th>الصلاحيات</th>
                                <th>تاريخ الانضمام</th>
                                <th>الحالة</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => {
                                const isSelf = user.id === currentUser?.id
                                return (
                                    <tr key={user.id} style={{ opacity: user.is_active ? 1 : 0.6 }}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: user.is_active ? 'var(--color-gold)' : '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-inverse)', fontWeight: 700, fontSize: 13 }}>
                                                    {user.name_ar?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 500, fontSize: 13 }}>
                                                        {user.name_ar}
                                                        {isSelf && <span style={{ fontSize: 10, background: 'rgba(200,168,75,0.15)', color: 'var(--color-gold)', padding: '1px 7px', borderRadius: 4, marginRight: 6 }}>أنت</span>}
                                                    </div>
                                                    {user.name_en && <div style={{ fontSize: 11, color: 'var(--color-warm-gray)', fontFamily: 'var(--font-latin)' }}>{user.name_en}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ fontSize: 12, fontFamily: 'var(--font-latin)', direction: 'ltr', color: 'var(--color-warm-gray)' }}>{user.email}</td>
                                        <td>
                                            <span className={`badge ${ROLE_BADGE[user.role] ?? 'badge-draft'}`}>
                                                {user.role === 'super_admin' && <Shield size={10} style={{ marginLeft: 3 }} />}
                                                {user.role_display}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 12, color: 'var(--color-warm-gray)' }}>{user.department_name ?? '—'}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                                {user.permissions.can_add_product && <span style={{ fontSize: 10, background: '#DBEAFE', color: '#1D4ED8', padding: '1px 6px', borderRadius: 4 }}>إضافة منتج</span>}
                                                {user.permissions.can_publish_product && <span style={{ fontSize: 10, background: '#DCFCE7', color: '#15803D', padding: '1px 6px', borderRadius: 4 }}>نشر</span>}
                                                {user.permissions.can_generate_catalog && <span style={{ fontSize: 10, background: '#FEF3C7', color: '#D97706', padding: '1px 6px', borderRadius: 4 }}>كتالوج</span>}
                                                {user.permissions.can_view_reports && <span style={{ fontSize: 10, background: '#F3E8FF', color: '#7C3AED', padding: '1px 6px', borderRadius: 4 }}>تقارير</span>}
                                                {user.permissions.can_manage_users && <span style={{ fontSize: 10, background: 'rgba(200,168,75,0.15)', color: '#9A7A2A', padding: '1px 6px', borderRadius: 4 }}>مستخدمين</span>}
                                            </div>
                                        </td>
                                        <td style={{ fontSize: 12, color: 'var(--color-warm-gray)' }}>
                                            {new Date(user.date_joined).toLocaleDateString('ar-SA')}
                                        </td>
                                        <td>
                                            <span className={`badge ${user.is_active ? 'badge-active' : 'badge-inactive'}`}>
                                                {user.is_active ? 'نشط' : 'معطل'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                                <button onClick={() => setEditingUser(user)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-gold)', padding: 5, borderRadius: 6 }} title="تعديل">
                                                    <Edit3 size={14} />
                                                </button>
                                                {!isSelf && (
                                                    <button onClick={() => toggleActiveMutation.mutate({ id: user.id, is_active: !user.is_active })}
                                                        disabled={toggleActiveMutation.isPending}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: user.is_active ? '#e07070' : '#27AE60', padding: 5, borderRadius: 6 }}
                                                        title={user.is_active ? 'تعطيل' : 'تفعيل'}>
                                                        {user.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 24 }}>
                    <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>السابق</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => setPage(p)}
                            style={{ minWidth: 34, height: 34, border: `1px solid ${p === page ? 'var(--color-gold)' : 'var(--color-sand)'}`, borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, background: p === page ? 'var(--color-gold)' : 'white', color: p === page ? '#1a2533' : 'var(--color-charcoal)', fontWeight: p === page ? 700 : 400 }}>
                            {p}
                        </button>
                    ))}
                    <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>التالي</button>
                </div>
            )}

            {/* Modals */}
            {showCreate && <UserFormModal categories={categories} onClose={() => setShowCreate(false)} />}
            {editingUser && <UserFormModal existing={editingUser} categories={categories} onClose={() => setEditingUser(null)} />}
        </div>
    )
}
