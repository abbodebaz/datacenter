/**
 * Login Page — Bayt Alebaa PDC
 * Split-screen dark design — consistent with catalog theme
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { authAPI } from '@/api/client'
import { toast } from 'react-toastify'
import { Eye, EyeOff, Copy, Check } from 'lucide-react'

const ADMIN_EMAIL = 'admin@baytalebaa.com'
const ADMIN_PASS  = 'PDC@2025Admin!'

export default function LoginPage() {
    const [email, setEmail]               = useState('')
    const [password, setPassword]         = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading]           = useState(false)
    const [copiedEmail, setCopiedEmail]   = useState(false)
    const [copiedPass, setCopiedPass]     = useState(false)
    const { setAuth } = useAuthStore()
    const navigate    = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await authAPI.login(email, password)
            const { access, refresh, user } = res.data
            setAuth(user, access, refresh)
            navigate('/')
        } catch (err: unknown) {
            const error = err as { response?: { data?: { detail?: string } } }
            toast.error(error?.response?.data?.detail || 'بيانات الدخول غير صحيحة')
        } finally {
            setLoading(false)
        }
    }

    const fillAdmin = () => {
        setEmail(ADMIN_EMAIL)
        setPassword(ADMIN_PASS)
    }

    const copy = (text: string, which: 'email' | 'pass') => {
        navigator.clipboard.writeText(text)
        if (which === 'email') { setCopiedEmail(true); setTimeout(() => setCopiedEmail(false), 1500) }
        else                   { setCopiedPass(true);  setTimeout(() => setCopiedPass(false), 1500) }
    }

    return (
        <div dir="rtl" style={{ minHeight: '100vh', display: 'flex', fontFamily: 'inherit' }}>

            {/* ── LEFT PANEL — brand ── */}
            <div className="lp-brand">

                {/* subtle grid */}
                <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }}>
                    <defs>
                        <pattern id="lpgrid" width="48" height="48" patternUnits="userSpaceOnUse">
                            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#C8A84B" strokeWidth="0.7"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#lpgrid)" />
                </svg>

                {/* vertical gold line */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: 2, height: '100%',
                    background: 'linear-gradient(to bottom, transparent, #C8A84B 25%, #C8A84B 75%, transparent)',
                    opacity: 0.5,
                }} />

                {/* floating rings */}
                <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 300, height: 300,
                    border: '1px solid rgba(200,168,75,0.1)',
                    borderRadius: '50%',
                    animation: 'lpFloat 9s ease-in-out infinite alternate',
                    pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 180, height: 180,
                    border: '1px solid rgba(200,168,75,0.07)',
                    borderRadius: '50%',
                    animation: 'lpFloat 6s ease-in-out infinite alternate-reverse',
                    pointerEvents: 'none',
                }} />

                {/* brand content */}
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
                    <img
                        src="/logo.png"
                        alt="بيت الإباء"
                        style={{ height: 80, width: 'auto', filter: 'var(--logo-filter)', opacity: 0.9 }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 180 }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(200,168,75,0.25)' }} />
                        <div style={{ width: 5, height: 5, background: '#C8A84B', transform: 'rotate(45deg)' }} />
                        <div style={{ flex: 1, height: 1, background: 'rgba(200,168,75,0.25)' }} />
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 13, color: 'var(--color-gold)', letterSpacing: 3, marginBottom: 8 }}>
                            مركز بيانات المنتجات
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', letterSpacing: 2 }}>
                            PRODUCT DATA CENTER
                        </div>
                    </div>
                </div>
            </div>

            {/* ── RIGHT PANEL — form ── */}
            <div className="lp-form">
                <div style={{ width: '100%', maxWidth: 400 }}>

                    {/* mobile logo */}
                    <div className="lp-mobile-logo">
                        <img src="/logo.png" alt="بيت الإباء"
                            style={{ height: 44, filter: 'var(--logo-filter)', opacity: 0.85 }} />
                    </div>

                    {/* heading */}
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 6 }}>
                        مرحباً بعودتك
                    </h1>
                    <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 36 }}>
                        سجّل دخولك للمتابعة إلى مركز البيانات
                    </p>

                    {/* ── Admin credentials hint ── */}
                    <div className="lp-hint">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <span style={{ fontSize: 11, color: 'var(--color-gold)', letterSpacing: 1 }}>بيانات الأدمن</span>
                            <button onClick={fillAdmin} className="lp-fill-btn">تعبئة تلقائية</button>
                        </div>

                        <div className="lp-cred-row">
                            <span style={{ fontSize: 11, color: 'var(--color-text-muted)', minWidth: 60 }}>الإيميل</span>
                            <code style={{ fontSize: 12, color: 'var(--color-text-secondary)', flex: 1, fontFamily: 'monospace' }}>
                                {ADMIN_EMAIL}
                            </code>
                            <button onClick={() => copy(ADMIN_EMAIL, 'email')} className="lp-copy-btn">
                                {copiedEmail ? <Check size={12} color="#6dc98a" /> : <Copy size={12} />}
                            </button>
                        </div>

                        <div className="lp-cred-row" style={{ borderBottom: 'none' }}>
                            <span style={{ fontSize: 11, color: 'var(--color-text-muted)', minWidth: 60 }}>الباسورد</span>
                            <code style={{ fontSize: 12, color: 'var(--color-text-secondary)', flex: 1, fontFamily: 'monospace' }}>
                                {ADMIN_PASS}
                            </code>
                            <button onClick={() => copy(ADMIN_PASS, 'pass')} className="lp-copy-btn">
                                {copiedPass ? <Check size={12} color="#6dc98a" /> : <Copy size={12} />}
                            </button>
                        </div>
                    </div>

                    {/* form */}
                    <form onSubmit={handleLogin} style={{ marginTop: 28 }}>
                        <div style={{ marginBottom: 24 }}>
                            <label className="lp-label">البريد الإلكتروني</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="email@baytalebaa.com"
                                className="lp-input"
                                dir="ltr"
                            />
                        </div>

                        <div style={{ marginBottom: 32 }}>
                            <label className="lp-label">كلمة المرور</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="lp-input"
                                    dir="ltr"
                                    style={{ paddingLeft: 40 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', left: 0, top: 0, bottom: 0,
                                        paddingInline: 12, border: 'none', background: 'none',
                                        cursor: 'pointer', color: 'var(--color-text-muted)',
                                        display: 'flex', alignItems: 'center',
                                    }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="lp-btn">
                            {loading ? (
                                <span style={{
                                    display: 'inline-block', width: 18, height: 18,
                                    border: '2px solid rgba(28,28,46,0.3)',
                                    borderTop: '2px solid #1C1C2E',
                                    borderRadius: '50%', animation: 'lpSpin 0.75s linear infinite',
                                }} />
                            ) : 'تسجيل الدخول'}
                        </button>
                    </form>

                    <p style={{ marginTop: 40, textAlign: 'center', fontSize: 12, color: 'var(--color-text-muted)' }}>
                        © بيت الإباء 2025
                    </p>
                </div>
            </div>

            <style>{`
                .lp-brand {
                    width: 42%;
                    background: var(--color-surface);
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    border-left: 1px solid rgba(200,168,75,0.12);
                }
                .lp-form {
                    flex: 1;
                    background: var(--color-surface-hover);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 48px 40px;
                }
                .lp-mobile-logo {
                    margin-bottom: 32px;
                    display: none;
                }
                .lp-label {
                    display: block;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--color-text-muted);
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                    margin-bottom: 10px;
                    font-family: 'Readex Pro', sans-serif;
                }
                .lp-input {
                    display: block;
                    width: 100%;
                    background: var(--color-surface);
                    border: 1px solid var(--color-border-strong);
                    border-radius: 8px;
                    padding: 12px 14px;
                    font-size: 14px;
                    font-family: 'Readex Pro', sans-serif;
                    color: var(--color-text-primary);
                    outline: none;
                    transition: border-color 0.2s, background 0.2s;
                    box-sizing: border-box;
                }
                .lp-input:focus {
                    border-color: #C8A84B;
                    background: var(--color-gold-light);
                }
                .lp-input::placeholder {
                    color: var(--color-text-muted);
                }
                .lp-btn {
                    width: 100%;
                    padding: 14px;
                    background: linear-gradient(135deg, #C8A84B 0%, #DDB940 100%);
                    color: #1C1C2E;
                    font-family: 'Readex Pro', sans-serif;
                    font-weight: 700;
                    font-size: 15px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: opacity 0.2s, box-shadow 0.2s;
                    box-shadow: 0 4px 20px rgba(200,168,75,0.3);
                    letter-spacing: 0.5px;
                    gap: 8px;
                }
                .lp-btn:hover:not(:disabled) {
                    opacity: 0.9;
                    box-shadow: 0 6px 28px rgba(200,168,75,0.45);
                }
                .lp-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .lp-hint {
                    background: rgba(200,168,75,0.06);
                    border: 1px solid rgba(200,168,75,0.2);
                    border-radius: 10px;
                    padding: 14px 16px;
                }
                .lp-cred-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 7px 0;
                    border-bottom: 1px solid var(--color-border);
                }
                .lp-copy-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: var(--color-text-muted);
                    padding: 2px 4px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    transition: color 0.15s;
                }
                .lp-copy-btn:hover { color: var(--color-text-secondary); }
                .lp-fill-btn {
                    background: rgba(200,168,75,0.12);
                    border: 1px solid rgba(200,168,75,0.25);
                    border-radius: 5px;
                    color: #C8A84B;
                    font-size: 11px;
                    font-family: 'Readex Pro', sans-serif;
                    padding: 3px 10px;
                    cursor: pointer;
                    transition: background 0.15s;
                }
                .lp-fill-btn:hover { background: rgba(200,168,75,0.2); }
                @keyframes lpSpin {
                    to { transform: rotate(360deg); }
                }
                @keyframes lpFloat {
                    from { transform: translate(-50%, -50%) scale(1); }
                    to   { transform: translate(-50%, -50%) scale(1.06); }
                }
                @media (max-width: 768px) {
                    .lp-brand { display: none; }
                    .lp-form { padding: 40px 24px; align-items: flex-start; padding-top: 60px; }
                    .lp-mobile-logo { display: block; }
                }
            `}</style>
        </div>
    )
}
