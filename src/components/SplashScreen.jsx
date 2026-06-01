import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const LOGO = 'https://res.cloudinary.com/dvt0nntn7/image/upload/v1775408607/02_fwrhni.png'

export default function SplashScreen({ onDone }) {
  const { i18n } = useTranslation()
  const isAr = i18n.language === 'ar'
  const [phase, setPhase] = useState('in')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 400)
    const t2 = setTimeout(() => setPhase('out'),  2400)
    const t3 = setTimeout(() => onDone(),         3100)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'linear-gradient(160deg, #1a0610 0%, #7b192c 55%, #a82040 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: phase === 'out' ? 0 : 1,
      transition: 'opacity 0.7s ease',
      pointerEvents: phase === 'out' ? 'none' : 'all',
    }}>

      {/* زخارف خلفية */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', border: '1px solid rgba(244,190,105,0.06)', top: -150, right: -150 }} />
        <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', border: '1px solid rgba(244,190,105,0.05)', bottom: -100, left: -100 }} />
        <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', border: '1px solid rgba(244,190,105,0.04)', top: '35%', left: '8%' }} />
        {/* نقاط زخرفية */}
        <div style={{ position: 'absolute', top: '20%', left: '15%', width: 4, height: 4, borderRadius: '50%', background: 'rgba(244,190,105,0.2)' }} />
        <div style={{ position: 'absolute', top: '70%', right: '12%', width: 3, height: 3, borderRadius: '50%', background: 'rgba(244,190,105,0.15)' }} />
        <div style={{ position: 'absolute', top: '45%', right: '20%', width: 5, height: 5, borderRadius: '50%', background: 'rgba(244,190,105,0.1)' }} />
      </div>

      {/* المحتوى */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 24,
        opacity: phase === 'in' ? 0 : 1,
        transform: phase === 'in' ? 'translateY(16px)' : 'translateY(0)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
        padding: '0 32px', textAlign: 'center',
        position: 'relative', zIndex: 1,
      }}>

        {/* اللوغو */}
        <div style={{
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 28, padding: '20px 36px',
          border: '1px solid rgba(244,190,105,0.12)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          <img
            src={LOGO}
            alt="Aromena Spices"
            style={{
              width: 'min(260px, 65vw)',
              height: 'auto',
              mixBlendMode: 'screen',
              display: 'block',
            }}
          />
        </div>

        {/* فاصل ذهبي */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 1, background: 'rgba(244,190,105,0.3)' }} />
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#f4be69' }} />
          <div style={{ width: 30, height: 1, background: 'rgba(244,190,105,0.3)' }} />
        </div>

        {/* العبارة */}
        <div style={{ maxWidth: 320 }}>
          <p style={{
            color: '#f4be69',
            fontFamily: 'Amiri, serif',
            fontSize: 'clamp(1.05rem, 3.8vw, 1.35rem)',
            fontWeight: 700,
            lineHeight: 1.8,
            letterSpacing: 0.3,
            margin: 0,
          }}>
            {isAr
              ? 'حيثُ تبدأ رائحةُ الطّبخ ، تبدأ أرومينا'
              : 'Where the Scent of Cooking Begins, Aromena Begins'
            }
          </p>
        </div>

        {/* شريط تحميل */}
        <div style={{
          width: 'min(200px, 52vw)', height: 2,
          background: 'rgba(244,190,105,0.12)',
          borderRadius: 50, overflow: 'hidden',
          marginTop: 4,
        }}>
          <div style={{
            height: '100%', borderRadius: 50,
            background: 'linear-gradient(to right, #f4be69, #e8a84a)',
            animation: 'splashBar 2.2s ease forwards',
          }} />
        </div>

      </div>

      <style>{`
        @keyframes splashBar {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </div>
  )
}