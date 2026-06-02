import { useState } from 'react'
import { FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi'

const LOGO     = 'https://res.cloudinary.com/dvt0nntn7/image/upload/v1775408607/02_fwrhni.png'
const BORDEAUX = '#7b192c'
const GOLD     = '#f4be69'

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('')
  const [show,     setShow]     = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  function handleSubmit() {
    if (!password) return
    setLoading(true)
    setError('')
    setTimeout(async () => {
      const ok = await onLogin(password)
      if (!ok) {
        setError('كلمة المرور غير صحيحة')
        setPassword('')
      }
      setLoading(false)
    }, 600)
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, #1a0610 0%, ${BORDEAUX} 50%, #a82040 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        background: '#fff', borderRadius: 24,
        padding: '44px 36px', width: '100%', maxWidth: 400,
        boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
      }}>

        {/* لوغو */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src={LOGO} alt="Aromena Spices" style={{ height: 50, objectFit: 'contain', marginBottom: 16 }} />
          <h1 style={{ color: '#3E1C00', fontSize: '1.25rem', fontWeight: 900, marginBottom: 4, fontFamily: 'Amiri, serif' }}>
            لوحة التحكم
          </h1>
          <p style={{ color: '#9C6B4E', fontSize: '0.82rem' }}>Admin Panel — Aromena Spices</p>
        </div>

        {/* كلمة المرور */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ color: '#3E1C00', fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>
            كلمة المرور
          </label>
          <div style={{ position: 'relative' }}>
            <FiLock style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 14, color: '#9C6B4E' }} size={15} />
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              onKeyDown={handleKey}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '13px 42px',
                borderRadius: 12, border: `2px solid ${error ? '#DC2626' : '#E2C9A8'}`,
                fontSize: '1rem', color: '#3E1C00', outline: 'none',
                background: '#FFFBF5', fontFamily: 'Amiri, serif',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => { if (!error) e.target.style.borderColor = BORDEAUX }}
              onBlur={e => { if (!error) e.target.style.borderColor = '#E2C9A8' }}
            />
            <button onClick={() => setShow(!show)} style={{
              position: 'absolute', top: '50%', transform: 'translateY(-50%)',
              left: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#9C6B4E', padding: 0,
            }}>
              {show ? <FiEyeOff size={15} /> : <FiEye size={15} />}
            </button>
          </div>
        </div>

        {/* خطأ */}
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', color: '#DC2626', fontSize: '0.83rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
            <FiAlertCircle size={15} /> {error}
          </div>
        )}

        {/* زر الدخول */}
        <button onClick={handleSubmit} disabled={loading || !password} style={{
          width: '100%', marginTop: 4,
          background: loading || !password ? '#E2C9A8' : `linear-gradient(to left, ${BORDEAUX}, #a82040)`,
          color: loading || !password ? '#9C6B4E' : GOLD,
          padding: '14px 0', borderRadius: 12,
          fontWeight: 700, fontSize: '1rem', border: 'none',
          cursor: password && !loading ? 'pointer' : 'not-allowed',
          fontFamily: 'Amiri, serif',
          boxShadow: password && !loading ? `0 4px 16px rgba(123,25,44,0.3)` : 'none',
          transition: 'all 0.2s',
        }}>
          {loading ? 'جاري التحقق...' : 'دخول'}
        </button>

        <p style={{ textAlign: 'center', color: '#C4956A', fontSize: '0.72rem', marginTop: 24 }}>
          Aromena Spices &copy; 2026 — Admin Access Only
        </p>
      </div>
    </div>
  )
}