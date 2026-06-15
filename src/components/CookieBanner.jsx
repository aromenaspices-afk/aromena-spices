import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function CookieBanner() {
  const { i18n } = useTranslation()
  const isAr = i18n.language === 'ar'
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('aromena_cookie_consent')
    if (!consent) setTimeout(() => setVisible(true), 1500)
  }, [])

  function dismiss(accepted) {
    setLeaving(true)
    setTimeout(() => {
      localStorage.setItem('aromena_cookie_consent', accepted ? 'accepted' : 'rejected')
      localStorage.setItem('aromena_cookie_date', new Date().toISOString())
      setVisible(false)
    }, 400)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: isAr ? 24 : 'auto',
      right: isAr ? 'auto' : 24,
      zIndex: 9998,
      maxWidth: 380,
      width: 'calc(100vw - 48px)',
      background: '#fff',
      borderRadius: 18,
      boxShadow: '0 8px 40px rgba(62,28,0,0.18)',
      border: '1px solid #E2C9A8',
      padding: '20px',
      opacity: leaving ? 0 : 1,
      transform: leaving
        ? `translateY(20px)`
        : 'translateY(0)',
      transition: 'opacity 0.4s ease, transform 0.4s ease',
    }}>

      {/* أيقونة + عنوان */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: 'linear-gradient(135deg,#7b192c,#a82040)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem',
        }}>🍪</div>
        <p style={{ color: '#3E1C00', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>
          {isAr ? 'نستخدم الكوكيز' : 'We use cookies'}
        </p>
      </div>

      {/* النص */}
      <p style={{ color: '#6B3A2A', fontSize: '0.82rem', lineHeight: 1.7, marginBottom: 16 }}>
        {isAr
          ? 'نستخدم الكوكيز لتحسين تجربتك وتذكر تفضيلاتك. بالقبول توافق على سياسة الخصوصية.'
          : 'We use cookies to improve your experience and remember your preferences. By accepting, you agree to our privacy policy.'
        }
      </p>

      {/* الأزرار */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => dismiss(true)}
          style={{
            flex: 2,
            background: 'linear-gradient(to left,#7b192c,#a82040)',
            color: '#f4be69',
            padding: '10px 0', borderRadius: 10,
            fontWeight: 700, fontSize: '0.85rem',
            border: 'none', cursor: 'pointer',
            fontFamily: 'Tajawal, sans-serif',
            boxShadow: '0 3px 12px rgba(123,25,44,0.25)',
          }}
        >
          {isAr ? '✓ قبول' : '✓ Accept'}
        </button>
        <button
          onClick={() => dismiss(false)}
          style={{
            flex: 1,
            background: '#fff',
            color: '#9C6B4E',
            padding: '10px 0', borderRadius: 10,
            fontWeight: 600, fontSize: '0.85rem',
            border: '2px solid #E2C9A8', cursor: 'pointer',
            fontFamily: 'Tajawal, sans-serif',
          }}
        >
          {isAr ? 'رفض' : 'Decline'}
        </button>
      </div>

    </div>
  )
}