import { useState } from 'react'
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { sendPasswordResetEmail as sendBrevoResetEmail } from '../utils/emailService'
import { auth } from '../firebase'
import { sendPasswordResetEmail as firebaseSendReset } from 'firebase/auth'

const LOGO = 'https://res.cloudinary.com/dvt0nntn7/image/upload/v1775408607/02_fwrhni.png'

export default function Login() {
  const { i18n } = useTranslation()
  const isAr = i18n.language === 'ar'
  const { login, loginWithGoogle, resetPassword, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  const [form, setForm]               = useState({ email: '', password: '' })
  const [loading, setLoading]         = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError]             = useState('')
  const [forgotMode, setForgotMode]   = useState(false)
  const [resetEmail, setResetEmail]   = useState('')
  const [resetSent, setResetSent]     = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  async function handleSubmit() {
    if (!form.email || !form.password) return
    setLoading(true)
    setError('')
    try {
      await login(form.email, form.password)
      navigate(from, { replace: true })
    } catch {
      setError(isAr ? 'البريد أو كلمة المرور غير صحيحة' : 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    setError('')
    try {
      await loginWithGoogle()
      navigate(from, { replace: true })
    } catch {
      setError(isAr ? 'فشل تسجيل الدخول بـ Google' : 'Google login failed')
    } finally {
      setGoogleLoading(false)
    }
  }

  async function handleResetPassword() {
    if (!resetEmail.trim()) return
    setResetLoading(true)
    setError('')
    try {
      // نطلب الرابط من Firebase
      await firebaseSendReset(auth, resetEmail.trim())

      // نرسل إيميل Brevo الجميل مع رابط Firebase
      const resetUrl = `https://aromina.com.tr/login`
      await sendBrevoResetEmail({ email: resetEmail.trim(), resetUrl })

      setResetSent(true)
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError(isAr ? 'البريد الإلكتروني غير مسجل' : 'Email not registered')
      } else {
        setError(isAr ? 'حدث خطأ، حاول مرة ثانية' : 'Something went wrong, try again')
      }
    } finally {
      setResetLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    borderRadius: 10, border: '2px solid #E2C9A8',
    fontSize: '0.9rem', color: '#3E1C00',
    fontFamily: 'Amiri, serif', outline: 'none',
    background: '#FFFBF5', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }

  const labelStyle = {
    color: '#3E1C00', fontSize: '0.85rem',
    fontWeight: 600, display: 'block', marginBottom: 6,
  }

  // المستخدم المسجّل لا يرى نموذج الدخول — يُوجَّه لوجهته
  if (user) return <Navigate to={from} replace />

  return (
    <div style={{
      background: '#F5E6D3', minHeight: '100vh',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '40px 16px',
    }}>
      <div style={{
        background: '#fff', borderRadius: 20,
        padding: '32px 24px', width: '100%', maxWidth: 400,
        border: '1px solid #E2C9A8',
        boxShadow: '0 8px 40px rgba(123,25,44,0.1)',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ display: 'inline-block', marginBottom: 16 }}>
            <div style={{
              background: 'linear-gradient(135deg, #7b192c, #a82040)',
              borderRadius: 12, padding: '5px 1px', display: 'inline-block',
            }}>
              <img src={LOGO} alt="Aromena Spices"
                style={{ height: 60, width: 140, objectFit: 'contain', display: 'block' }} />
            </div>
          </Link>
          <h1 style={{ color: '#3E1C00', fontFamily: 'Amiri, serif', fontSize: '1.4rem', marginBottom: 4 }}>
            {forgotMode
              ? (isAr ? 'استعادة كلمة المرور' : 'Reset Password')
              : (isAr ? 'تسجيل الدخول' : 'Login')}
          </h1>
          <p style={{ color: '#9C6B4E', fontSize: '0.85rem' }}>
            {forgotMode
              ? (isAr ? 'سنرسل لك رابط إعادة التعيين' : 'We\'ll send you a reset link')
              : (isAr ? 'أهلاً بعودتك!' : 'Welcome back!')}
          </p>
        </div>

        {/* ══ وضع نسيان كلمة المرور ══ */}
        {forgotMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {resetSent ? (
              // تم الإرسال
              <div style={{
                background: '#F0FDF4', border: '1px solid #BBF7D0',
                borderRadius: 12, padding: '20px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>📧</div>
                <p style={{ color: '#065F46', fontWeight: 700, fontSize: '0.95rem', marginBottom: 6 }}>
                  {isAr ? 'تمَّ إرسال الرابط!' : 'Link Sent!'}
                </p>
                <p style={{ color: '#16A34A', fontSize: '0.83rem', lineHeight: 1.7 }}>
                  {isAr
                    ? `تمَّ إرسال رابط إعادة تعيين كلمة المرور إلى ${resetEmail}`
                    : `A reset link has been sent to ${resetEmail}`}
                </p>
                <p style={{ color: '#9C6B4E', fontSize: '0.78rem', marginTop: 8 }}>
                  {isAr ? 'تحقق من البريد الوارد والبريد المزعج' : 'Check your inbox and spam folder'}
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label style={labelStyle}>
                    {isAr ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder="example@email.com"
                    style={inputStyle}
                    onKeyDown={e => e.key === 'Enter' && handleResetPassword()}
                    onFocus={e => e.target.style.borderColor = '#7b192c'}
                    onBlur={e => e.target.style.borderColor = '#E2C9A8'}
                  />
                </div>

                {error && (
                  <div style={{
                    background: '#FEE2E2', borderRadius: 8,
                    padding: '9px 12px', color: '#DC2626',
                    fontSize: '0.82rem', fontWeight: 600,
                  }}>
                    {error}
                  </div>
                )}

                <button onClick={handleResetPassword} disabled={resetLoading || !resetEmail.trim()} style={{
                  background: resetLoading || !resetEmail.trim()
                    ? '#E2C9A8'
                    : 'linear-gradient(to left, #7b192c, #a82040)',
                  color: resetLoading || !resetEmail.trim() ? '#9C6B4E' : '#f4be69',
                  padding: '12px 0', borderRadius: 10,
                  fontWeight: 700, fontSize: '0.92rem', border: 'none',
                  cursor: resetLoading || !resetEmail.trim() ? 'not-allowed' : 'pointer',
                  fontFamily: 'Amiri, serif',
                  boxShadow: resetLoading ? 'none' : '0 4px 14px rgba(123,25,44,0.25)',
                }}>
                  {resetLoading
                    ? (isAr ? 'جاري الإرسال...' : 'Sending...')
                    : (isAr ? 'إرسال رابط الاستعادة' : 'Send Reset Link')}
                </button>
              </>
            )}

            <button onClick={() => { setForgotMode(false); setResetSent(false); setResetEmail(''); setError('') }} style={{
              background: 'none', border: 'none',
              color: '#7b192c', fontWeight: 700, fontSize: '0.88rem',
              cursor: 'pointer', fontFamily: 'Amiri, serif',
              textDecoration: 'underline', padding: 0,
            }}>
              {isAr ? '← العودة لتسجيل الدخول' : '← Back to Login'}
            </button>
          </div>

        ) : (
          // ══ وضع تسجيل الدخول العادي ══
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Google */}
            <button onClick={handleGoogle} disabled={googleLoading} style={{
              width: '100%', padding: '11px 0',
              borderRadius: 10, border: '2px solid #E2C9A8',
              background: '#fff', color: '#3E1C00',
              fontWeight: 700, fontSize: '0.88rem',
              cursor: googleLoading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8,
              fontFamily: 'Amiri, serif',
            }}>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
              </svg>
              {googleLoading
                ? (isAr ? 'جاري الدخول...' : 'Signing in...')
                : (isAr ? 'دخول بـ Google' : 'Continue with Google')}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: '#E2C9A8' }} />
              <span style={{ color: '#9C6B4E', fontSize: '0.78rem' }}>
                {isAr ? 'أو بالبريد الإلكتروني' : 'or with email'}
              </span>
              <div style={{ flex: 1, height: 1, background: '#E2C9A8' }} />
            </div>

            <div>
              <label style={labelStyle}>{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="example@email.com"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#7b192c'}
                onBlur={e => e.target.style.borderColor = '#E2C9A8'}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>
                  {isAr ? 'كلمة المرور' : 'Password'}
                </label>
                <button onClick={() => { setForgotMode(true); setResetEmail(form.email); setError('') }} style={{
                  background: 'none', border: 'none',
                  color: '#7b192c', fontSize: '0.78rem',
                  fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'Amiri, serif', padding: 0,
                  textDecoration: 'underline',
                }}>
                  {isAr ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                </button>
              </div>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                style={inputStyle}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                onFocus={e => e.target.style.borderColor = '#7b192c'}
                onBlur={e => e.target.style.borderColor = '#E2C9A8'}
              />
            </div>

            {error && (
              <div style={{
                background: '#FEE2E2', borderRadius: 8,
                padding: '9px 12px', color: '#DC2626',
                fontSize: '0.82rem', fontWeight: 600,
              }}>
                {error}
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading} style={{
              background: loading ? '#E2C9A8' : 'linear-gradient(to left, #7b192c, #a82040)',
              color: loading ? '#9C6B4E' : '#f4be69',
              padding: '12px 0', borderRadius: 10,
              fontWeight: 700, fontSize: '0.92rem', border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Amiri, serif',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(123,25,44,0.25)',
            }}>
              {loading ? (isAr ? 'جاري الدخول...' : 'Logging in...') : (isAr ? 'دخول' : 'Login')}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: '#E2C9A8' }} />
              <span style={{ color: '#9C6B4E', fontSize: '0.78rem' }}>{isAr ? 'أو' : 'or'}</span>
              <div style={{ flex: 1, height: 1, background: '#E2C9A8' }} />
            </div>

            <Link to="/checkout" style={{
              display: 'block', textAlign: 'center',
              padding: '11px 0', borderRadius: 10,
              border: '2px solid #E2C9A8', color: '#6B3A2A',
              fontWeight: 600, fontSize: '0.88rem',
              textDecoration: 'none', fontFamily: 'Amiri, serif',
            }}>
              {isAr ? 'متابعة كضيف' : 'Continue as Guest'}
            </Link>

            <p style={{ textAlign: 'center', color: '#9C6B4E', fontSize: '0.82rem' }}>
              {isAr ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
              <Link to="/register" state={{ from }} style={{ color: '#7b192c', fontWeight: 700, textDecoration: 'none' }}>
                {isAr ? 'سجّل الآن' : 'Register'}
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}