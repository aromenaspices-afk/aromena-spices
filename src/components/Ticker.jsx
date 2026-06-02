import { useSettings } from '../hooks/useSettings'

export default function Ticker({ isAr }) {
  const { settings } = useSettings()
  const items = settings?.ticker_items || [
    '🌶️ بهارات أصيلة من قلب الشرق',
    '🚚 شحن سريع لأوروبّا والخليج',
    '✨ جودة مضمونة 100%',
    '🎁 باقات هدايا مميزة',
    '🌿 طبيعي بدون مواد حافظة',
  ]

  const repeated = [...items, ...items, ...items]

  return (
    <div style={{
      background: '#7b192c',
      overflow: 'hidden', padding: '14px 0',
      borderTop: '2px solid rgba(244,190,105,0.2)',
      borderBottom: '2px solid rgba(244,190,105,0.2)',
    }}>
      <style>{`
        @keyframes ticker-rtl {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        @keyframes ticker-ltr {
          0%   { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          display: flex;
          width: max-content;
          animation: ticker-${isAr ? 'rtl' : 'ltr'} 30s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="ticker-track">
        {repeated.map((item, i) => (
          <span key={i} style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '0 32px', color: '#f4be69',
            fontSize: 'clamp(0.8rem, 2vw, 0.95rem)',
            fontFamily: 'Amiri, serif', fontWeight: 600,
            whiteSpace: 'nowrap',
          }}>
            {item}
            <span style={{
              display: 'inline-block', width: 6, height: 6,
              borderRadius: '50%', background: '#f4be69',
              margin: isAr ? '0 0 0 32px' : '0 32px 0 0',
            }} />
          </span>
        ))}
      </div>
    </div>
  )
}