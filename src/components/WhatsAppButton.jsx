import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const WA_NUMBER = '905550044476'
const WA_URL    = `https://wa.me/${WA_NUMBER}`

export default function WhatsAppButton() {
  const [visible,  setVisible]  = useState(false)
  const [tooltip,  setTooltip]  = useState(false)
  const [pulse,    setPulse]    = useState(false)
  const location = useLocation()

  // إخفاء في صفحة الـ Checkout
  const isCheckout = location.pathname === '/checkout'

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(true)
      setTimeout(() => setPulse(false), 600)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  if (!visible || isCheckout) return null

  return (
    <>
      <style>{`
        @keyframes wa-slide-in {
          from { opacity: 0; transform: translateY(20px) scale(0.8); }
          to   { opacity: 1; transform: translateY(0)    scale(1);   }
        }
        @keyframes wa-pulse {
          0%   { box-shadow: 0 0 0 0   rgba(37,211,102,0.5); }
          70%  { box-shadow: 0 0 0 14px rgba(37,211,102,0);  }
          100% { box-shadow: 0 0 0 0   rgba(37,211,102,0);   }
        }
        @keyframes wa-tooltip {
          from { opacity: 0; transform: translateX(8px); }
          to   { opacity: 1; transform: translateX(0);   }
        }
        .wa-btn {
          animation: wa-slide-in 0.4s ease forwards;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .wa-btn:hover {
          transform: scale(1.08) !important;
          box-shadow: 0 8px 32px rgba(37,211,102,0.5) !important;
        }
        .wa-btn.pulse {
          animation: wa-pulse 0.6s ease;
        }
        @media (max-width: 768px) {
          .wa-tooltip { display: none !important; }
          .wa-btn { bottom: 20px !important; left: 16px !important; width: 50px !important; height: 50px !important; }
        }
      `}</style>

      <div style={{ position: 'fixed', bottom: 28, left: 28, zIndex: 9000, display: 'flex', alignItems: 'center', gap: 10 }}>
        {tooltip && (
          <div className="wa-tooltip" style={{ background: '#fff', borderRadius: 12, padding: '10px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: '1px solid #E2C9A8', animation: 'wa-tooltip 0.2s ease', whiteSpace: 'nowrap' }}>
            <p style={{ color: '#3E1C00', fontWeight: 700, fontSize: '0.82rem', margin: 0 }}>تحدث معنا 👋</p>
            <p style={{ color: '#9C6B4E', fontSize: '0.74rem', margin: '2px 0 0' }}>نرد خلال دقائق</p>
          </div>
        )}
        <a href={WA_URL} target="_blank" rel="noreferrer"
          className={`wa-btn${pulse ? ' pulse' : ''}`}
          onMouseEnter={() => setTooltip(true)}
          onMouseLeave={() => setTooltip(false)}
          style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #25D366, #128C7E)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(37,211,102,0.4)', textDecoration: 'none', flexShrink: 0 }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      </div>
    </>
  )
}