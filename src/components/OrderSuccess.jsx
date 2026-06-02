import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiMail, FiShoppingBag, FiCheck } from 'react-icons/fi'

const LOGO = 'https://res.cloudinary.com/dvt0nntn7/image/upload/v1775408607/02_fwrhni.png'

export default function OrderSuccess({ orderNumber, email }) {
  const { i18n } = useTranslation()
  const isAr = i18n.language === 'ar'
  const [phase, setPhase] = useState('truck')

  useEffect(() => {
    const t = setTimeout(() => setPhase('done'), 3500)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ background: '#F5E6D3', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>

      <style>{`
        @keyframes aro-motion {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(3px); }
          100% { transform: translateY(0px); }
        }
        @keyframes aro-road {
          0%   { transform: translateX(0px); }
          100% { transform: translateX(-350px); }
        }
        @keyframes aro-fadein {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes aro-check {
          from { stroke-dashoffset: 60; }
          to   { stroke-dashoffset: 0; }
        }
        .aro-truck-body { animation: aro-motion 1s linear infinite; }
        .aro-road-line::before {
          content: "";
          position: absolute;
          width: 20px; height: 100%;
          background-color: #E2C9A8;
          right: -50%; border-radius: 3px;
          animation: aro-road 1.4s linear infinite;
          border-left: 10px solid #F5E6D3;
        }
        .aro-road-line::after {
          content: "";
          position: absolute;
          width: 10px; height: 100%;
          background-color: #E2C9A8;
          right: -65%; border-radius: 3px;
          animation: aro-road 1.4s linear infinite;
          border-left: 4px solid #F5E6D3;
        }
        .aro-done { animation: aro-fadein 0.5s ease forwards; }
      `}</style>

      <div style={{ background: '#fff', borderRadius: 28, padding: '44px 28px', maxWidth: 440, width: '100%', border: '1px solid #E2C9A8', boxShadow: '0 16px 60px rgba(123,25,44,0.1)', textAlign: 'center' }}>

        {phase === 'truck' ? (
          <>
            {/* عنوان */}
            <p style={{ color: '#7b192c', fontWeight: 700, fontSize: '1rem', fontFamily: 'Amiri, serif', marginBottom: 24 }}>
              {isAr ? 'جاري تجهيز طلبك...' : 'Preparing your order...'}
            </p>

            {/* الشاحنة من uiverse */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <div style={{ width: 200, height: 100, display: 'flex', flexDirection: 'column', position: 'relative', alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden' }}>

                {/* جسم الشاحنة */}
                <div className="aro-truck-body" style={{ width: 130, marginBottom: 6 }}>
                  <svg viewBox="0 0 198 93" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* الجسم الرئيسي */}
                    <rect x="2" y="22" width="135" height="63" rx="4" fill="#7b192c" stroke="#1a0610" strokeWidth="2"/>
                    {/* مقدمة الشاحنة */}
                    <path d="M137 45 L137 85 L193 85 L193 55 L175 35 L137 35 Z" fill="#a82040" stroke="#1a0610" strokeWidth="2"/>
                    {/* زجاج */}
                    <path d="M145 40 L145 60 L185 60 L185 52 L170 40 Z" fill="#f4be69" opacity="0.8"/>
                    {/* مصباح */}
                    <rect x="188" y="62" width="8" height="6" rx="1" fill="#f4be69"/>
                    {/* اللوغو */}
                    <image href="https://res.cloudinary.com/dvt0nntn7/image/upload/v1775408607/02_fwrhni.png" x="20" y="28" width="90" height="45"/>
                  </svg>
                </div>

                {/* العجلات */}
                <div style={{ width: 130, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px 0 15px', position: 'absolute', bottom: 0 }}>
                  <svg viewBox="0 0 24 24" width="24" fill="none">
                    <circle cx="12" cy="12" r="11" fill="#1a0610" stroke="#1a0610" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="5" fill="#E2C9A8"/>
                    <circle cx="12" cy="12" r="2" fill="#1a0610"/>
                  </svg>
                  <svg viewBox="0 0 24 24" width="24" fill="none">
                    <circle cx="12" cy="12" r="11" fill="#1a0610" stroke="#1a0610" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="5" fill="#E2C9A8"/>
                    <circle cx="12" cy="12" r="2" fill="#1a0610"/>
                  </svg>
                  <svg viewBox="0 0 24 24" width="24" fill="none">
                    <circle cx="12" cy="12" r="11" fill="#1a0610" stroke="#1a0610" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="5" fill="#E2C9A8"/>
                    <circle cx="12" cy="12" r="2" fill="#1a0610"/>
                  </svg>
                </div>

                {/* الطريق */}
                <div className="aro-road-line" style={{ width: '100%', height: '2px', background: '#E2C9A8', position: 'relative', bottom: 0, alignSelf: 'flex-end', borderRadius: 3 }} />
              </div>
            </div>

            <p style={{ color: '#9C6B4E', fontSize: '0.82rem' }}>
              {isAr ? 'شكراً لثقتك بأرومينا' : 'Thank you for trusting Aromena'}
            </p>
          </>
        ) : (
          <div className="aro-done">
            {/* دائرة الصح */}
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f0fdf4', border: '2px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M8 18L15 25L28 11" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                  strokeDasharray="60" strokeDashoffset="60"
                  style={{ animation: 'aro-check 0.5s ease 0.2s forwards' }} />
              </svg>
            </div>

            <h2 style={{ color: '#3E1C00', fontSize: '1.4rem', fontFamily: 'Amiri, serif', marginBottom: 10 }}>
              {isAr ? 'تمَّ تأكيد طلبك!' : 'Order Confirmed!'}
            </h2>

            {orderNumber && (
              <div style={{ background: '#fdf0f2', borderRadius: 12, padding: '10px 20px', marginBottom: 16, display: 'inline-block' }}>
                <p style={{ color: '#9C6B4E', fontSize: '0.75rem', marginBottom: 2 }}>{isAr ? 'رقم طلبك' : 'Order Number'}</p>
                <p style={{ color: '#7b192c', fontWeight: 900, fontSize: '1.1rem', letterSpacing: 1 }}>{orderNumber}</p>
              </div>
            )}

            <p style={{ color: '#9C6B4E', fontSize: '0.86rem', lineHeight: 1.8, marginBottom: 8 }}>
              {isAr ? 'شكراً لطلبك! سنتواصل معك قريباً.' : 'Thank you! We will contact you soon.'}
            </p>

            {email && (
              <p style={{ color: '#9C6B4E', fontSize: '0.8rem', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <FiMail size={13} /> {email}
              </p>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/account" style={{ background: 'linear-gradient(to left, #7b192c, #a82040)', color: '#f4be69', padding: '11px 22px', borderRadius: 50, fontWeight: 700, textDecoration: 'none', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiShoppingBag size={14} />
                {isAr ? 'طلباتي' : 'My Orders'}
              </Link>
              <Link to="/products" style={{ background: '#fff', color: '#7b192c', border: '2px solid #7b192c', padding: '11px 22px', borderRadius: 50, fontWeight: 700, textDecoration: 'none', fontSize: '0.88rem' }}>
                {isAr ? 'متابعة التسوق' : 'Continue Shopping'}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}