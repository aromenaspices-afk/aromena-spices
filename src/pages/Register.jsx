import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'

const LOGO = 'https://res.cloudinary.com/dvt0nntn7/image/upload/v1773706292/%D8%AF%D9%88%D9%86_%D8%B9%D9%86%D9%88%D8%A7%D9%86_1000_x_300_%D8%A8%D9%8A%D9%83%D8%B3%D9%84_yjbttl.png'

export default function Register() {
  const { i18n } = useTranslation()
  const isAr = i18n.language === 'ar'
  const { register, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirm: ''
  })
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError(isAr ? 'يرجى ملء جميع الحقول' : 'Please fill all fields')
      return
    }
    if (form.password !== form.confirm) {
      setError(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError(isAr ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters')
      return
    }
    setLoading(true)
    setError('')
    try {
      await register(form.email, form.password, form.firstName, form.lastName)
      navigate('/')
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError(isAr ? 'البريد مستخدم مسبقاً' : 'Email already in use')
      } else {
        setError(isAr ? 'حدث خطأ، حاول مرة ثانية' : 'Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    setError('')
    try {
      await loginWithGoogle()
      navigate('/')
    } catch {
      setError(isAr ? 'فشل تسجيل الدخول بـ Google' : 'Google login failed')
    } finally {
      setGoogleLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    borderRadius: 10, border: '2px solid #E2C9A8',
    fontSize: '0.9rem', color: '#3E1C00',
    fontFamily: 'Amiri, serif', outline: 'none',
    background: '#FFFBF5', boxSizing: 'border-box',
  }

  const labelStyle = {
    color: '#3E1C00', fontSize: '0.85rem',
    fontWeight: 600, display: 'block', marginBottom: 6,
  }

  return (
    <div style={{
      background: '#F5E6D3', minHeight: '100vh',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '40px 16px',
    }}>
      <div style={{
        background: '#fff', borderRadius: 20,
        padding: '32px 24px', width: '100%', maxWidth: 440,
        border: '1px solid #E2C9A8',
        boxShadow: '0 8px 40px rgba(123,25,44,0.1)',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Link to="/" style={{ display: 'inline-block', marginBottom: 14 }}>
            <div style={{
              background: 'linear-gradient(135deg, #7b192c, #a82040)',
              borderRadius: 12, padding: '10px 16px',
              display: 'inline-block',
            }}>
              <img
                src={LOGO}
                alt="Aromena Spices"
                style={{ height: 44, width: 140, objectFit: 'contain', objectPosition: 'center', display: 'block' }}
              />
            </div>
          </Link>
          <h1 style={{ color: '#3E1C00', fontFamily: 'Amiri, serif', fontSize: '1.4rem', marginBottom: 4 }}>
            {isAr ? 'إنشاء حساب' : 'Create Account'}
          </h1>
          <p style={{ color: '#9C6B4E', fontSize: '0.85rem' }}>
            {isAr ? 'انضم لعائلة أرومينا!' : 'Join the Aromena family!'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Google */}
          <button onClick={handleGoogle} disabled={googleLoading} style={{
            width: '100%', padding: '11px 0', borderRadius: 10,
            border: '2px solid #E2C9A8', background: '#fff', color: '#3E1C00',
            fontWeight: 700, fontSize: '0.88rem', cursor: googleLoading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: 'Amiri, serif',
          }}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
            </svg>
            {googleLoading ? (isAr ? 'جاري...' : 'Loading...') : (isAr ? 'التسجيل بـ Google' : 'Continue with Google')}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: '#E2C9A8' }} />
            <span style={{ color: '#9C6B4E', fontSize: '0.78rem' }}>
              {isAr ? 'أو بالبريد الإلكتروني' : 'or with email'}
            </span>
            <div style={{ flex: 1, height: 1, background: '#E2C9A8' }} />
          </div>

          {/* الاسم */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>{isAr ? 'الاسم الأول *' : 'First Name *'}</label>
              <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{isAr ? 'الاسم الثاني *' : 'Last Name *'}</label>
              <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>{isAr ? 'البريد الإلكتروني *' : 'Email *'}</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="example@email.com" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>{isAr ? 'كلمة المرور *' : 'Password *'}</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>{isAr ? 'تأكيد كلمة المرور *' : 'Confirm Password *'}</label>
            <input
              type="password"
              value={form.confirm}
              onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
              placeholder="••••••••"
              style={inputStyle}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {error && (
            <div style={{ background: '#FEE2E2', borderRadius: 8, padding: '9px 12px', color: '#DC2626', fontSize: '0.82rem', fontWeight: 600 }}>
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
            {loading ? (isAr ? 'جاري التسجيل...' : 'Registering...') : (isAr ? 'إنشاء حساب' : 'Create Account')}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: '#E2C9A8' }} />
            <span style={{ color: '#9C6B4E', fontSize: '0.78rem' }}>{isAr ? 'أو' : 'or'}</span>
            <div style={{ flex: 1, height: 1, background: '#E2C9A8' }} />
          </div>

          <Link to="/checkout" style={{
            display: 'block', textAlign: 'center', padding: '11px 0',
            borderRadius: 10, border: '2px solid #E2C9A8', color: '#6B3A2A',
            fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none',
            fontFamily: 'Amiri, serif',
          }}>
            {isAr ? 'متابعة كضيف' : 'Continue as Guest'}
          </Link>

          <p style={{ textAlign: 'center', color: '#9C6B4E', fontSize: '0.82rem' }}>
            {isAr ? 'لديك حساب؟' : 'Already have an account?'}{' '}
            <Link to="/login" style={{ color: '#7b192c', fontWeight: 700, textDecoration: 'none' }}>
              {isAr ? 'سجّل دخولك' : 'Login'}
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}