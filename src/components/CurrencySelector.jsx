// العملة ثابتة على الليرة التركية — تبديل العملات موقوف مؤقتاً
export default function CurrencySelector({ size = 'normal' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 3,
      padding: size === 'small' ? '3px 5px' : '4px 8px',
      color: '#f4be69',
      fontSize: size === 'small' ? '0.7rem' : '0.75rem',
      fontWeight: 700,
    }}>
      <span style={{ fontSize: size === 'small' ? '0.95rem' : '1rem' }}>🇹🇷</span>
      {size !== 'small' && <span style={{ fontSize: '0.72rem' }}>TRY</span>}
    </div>
  )
}