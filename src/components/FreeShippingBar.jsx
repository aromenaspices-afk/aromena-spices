import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useCurrency } from '../context/CurrencyContext'
import { getFreeShippingThreshold } from '../utils/shippingData'

// شريط تقدّم نحو الشحن المجّاني — يظهر عند نقص قيمة السلّة عن العتبة
// subtotal: قيمة السلّة بالليرة (الأساس). country: اختياريّ لعتبة دقيقة.
export default function FreeShippingBar({ subtotal = 0, country, compact = false }) {
  const { formatPrice } = useCurrency()
  const { i18n } = useTranslation()
  const isAr = i18n.language === 'ar'
  const [threshold, setThreshold] = useState(null)

  useEffect(() => {
    let alive = true
    getFreeShippingThreshold(country).then(t => { if (alive) setThreshold(t) })
    return () => { alive = false }
  }, [country])

  if (!threshold || subtotal <= 0) return null

  // وصل/تجاوز العتبة → رسالة نجاح مقتضبة
  if (subtotal >= threshold) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
        border: '1px solid #A7F3D0', borderRadius: 14,
        padding: compact ? '10px 14px' : '12px 16px', textAlign: 'center',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <span style={{ fontSize: '1.1rem' }}>🎉</span>
        <span style={{ color: '#065F46', fontWeight: 800, fontSize: compact ? '0.8rem' : '0.88rem', fontFamily: 'Tajawal, sans-serif' }}>
          {isAr ? 'رائع! حصلتَ على التّوصيل المجّاني' : 'Great! You got free shipping'}
        </span>
      </div>
    )
  }

  const remaining = threshold - subtotal
  const pct = Math.min(100, Math.max(4, Math.round((subtotal / threshold) * 100)))

  return (
    <div style={{
      background: 'linear-gradient(135deg, #FFF8EC 0%, #FBEFD6 100%)',
      border: '1px solid #E7CFA0', borderRadius: 16,
      padding: compact ? '12px 14px' : '14px 18px',
      boxShadow: '0 4px 16px rgba(201,169,97,0.18)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* توهّج زاويّ ناعم */}
      <div style={{ position: 'absolute', insetInlineEnd: -28, top: -28, width: 90, height: 90, borderRadius: '50%', background: 'radial-gradient(circle, rgba(214,179,106,0.35), transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: '1.15rem' }}>🚚</span>
        <p style={{ color: '#7b192c', fontWeight: 800, fontSize: compact ? '0.85rem' : '0.95rem', fontFamily: 'Tajawal, sans-serif', margin: 0 }}>
          {isAr ? 'الشّحن المجّاني أقرب ممّا تتوقّع!' : 'Free shipping is closer than you think!'}
        </p>
      </div>

      <p style={{ color: '#6B3A2A', fontSize: compact ? '0.76rem' : '0.82rem', lineHeight: 1.8, margin: 0 }}>
        {isAr ? 'قيمة سلّتكَ الحاليّة ' : 'Your cart total is '}
        <strong style={{ color: '#7b192c' }}>{formatPrice(subtotal)}</strong>
        <br />
        {isAr ? 'أضف منتجات بقيمة ' : 'Add just '}
        <strong style={{ color: '#b8860b', fontSize: '1.05em' }}>{formatPrice(remaining)}</strong>
        {isAr ? ' فقط' : ' more'}
        <br />
        {isAr ? 'واستمتع بالتّوصيل المجّاني' : 'to enjoy free shipping'}
      </p>

      {/* شريط التقدّم */}
      <div style={{ marginTop: 10, height: 8, borderRadius: 50, background: 'rgba(123,25,44,0.10)', overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 50,
          background: 'linear-gradient(90deg, #c9a961, #7b192c)',
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  )
}
