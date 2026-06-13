import { useState } from 'react'
import { useCurrency } from '../context/CurrencyContext'

// مبدّل العملة — يعرض عملة الزائر المكتشفة تلقائيّاً، ويتيح تغييرها يدويّاً
export default function CurrencySelector({ size = 'normal' }) {
  const { currency, currencyInfo, allCurrencies, changeCurrency } = useCurrency()
  const [open, setOpen] = useState(false)
  const small = size === 'small'

  return (
    <div style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 3,
        padding: small ? '3px 5px' : '4px 8px',
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: '#f4be69', fontSize: small ? '0.7rem' : '0.75rem', fontWeight: 700,
      }}>
        <span style={{ fontSize: small ? '0.95rem' : '1rem' }}>{currencyInfo.flag}</span>
        <span style={{ fontSize: small ? '0.7rem' : '0.72rem' }}>{currency}</span>
        <span style={{ fontSize: '0.6rem', opacity: 0.7, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
          <div style={{
            position: 'absolute', top: '130%', insetInlineEnd: 0, minWidth: 190,
            background: '#fff', borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
            border: '1px solid #E2C9A8', zIndex: 999, overflow: 'hidden', maxHeight: 320, overflowY: 'auto',
          }}>
            {Object.entries(allCurrencies).map(([code, info]) => (
              <button key={code} type="button"
                onClick={() => { changeCurrency(code); setOpen(false) }}
                style={{
                  width: '100%', padding: '10px 14px', border: 'none',
                  background: code === currency ? '#fdf0f2' : '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10, textAlign: 'start',
                  borderBottom: '1px solid #F5E6D3', fontFamily: 'Amiri, serif',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#fdf0f2'}
                onMouseLeave={e => e.currentTarget.style.background = code === currency ? '#fdf0f2' : '#fff'}>
                <span style={{ fontSize: '1.1rem' }}>{info.flag}</span>
                <span style={{ color: '#7b192c', fontWeight: 700, fontSize: '0.8rem', width: 34 }}>{code}</span>
                <span style={{ color: '#6B3A2A', fontSize: '0.78rem', flex: 1 }}>{info.name}</span>
                {code === currency && <span style={{ color: '#16A34A' }}>✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
