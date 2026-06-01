import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiHome, FiShoppingBag } from 'react-icons/fi'

export default function NotFound() {
  const { i18n } = useTranslation()
  const isAr = i18n.language === 'ar'

  return (
    <div style={{
      minHeight: '70vh',
      background: '#F5E6D3',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>

        {/* الرقم */}
        <div style={{
          fontSize: '7rem', fontWeight: 900, lineHeight: 1,
          fontFamily: 'Amiri, serif',
          background: 'linear-gradient(135deg, #7b192c, #a82040)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 8,
        }}>
          404
        </div>

        {/* إيموجي */}
        <div style={{ fontSize: '3rem', marginBottom: 20 }}>🫙</div>

        {/* العنوان */}
        <h1 style={{
          color: '#3E1C00', fontFamily: 'Amiri, serif',
          fontSize: '1.6rem', marginBottom: 12,
        }}>
          {isAr ? 'الصفحة غير موجودة' : 'Page Not Found'}
        </h1>

        {/* الوصف */}
        <p style={{
          color: '#9C6B4E', fontSize: '0.95rem',
          lineHeight: 1.7, marginBottom: 32,
        }}>
          {isAr
            ? 'يبدو أن هذه الصفحة طارت مع ريح البهارات! '
            : 'Looks like this page flew away with the spice winds! '
          }
        </p>

        {/* أزرار */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" style={{
            background: 'linear-gradient(to left, #7b192c, #a82040)',
            color: '#f4be69', padding: '12px 28px',
            borderRadius: 50, fontWeight: 700,
            textDecoration: 'none', fontSize: '0.9rem',
            display: 'flex', alignItems: 'center', gap: 7,
            fontFamily: 'Amiri, serif',
            boxShadow: '0 4px 14px rgba(123,25,44,0.25)',
            transition: 'transform 0.15s',
          }}>
            <FiHome size={16} />
            {isAr ? 'الصفحة الرئيسية' : 'Go Home'}
          </Link>

          <Link to="/products" style={{
            background: '#fff', color: '#7b192c',
            padding: '12px 28px', borderRadius: 50,
            fontWeight: 700, textDecoration: 'none',
            fontSize: '0.9rem', border: '2px solid #E2C9A8',
            display: 'flex', alignItems: 'center', gap: 7,
            fontFamily: 'Amiri, serif',
            transition: 'border-color 0.15s',
          }}>
            <FiShoppingBag size={16} />
            {isAr ? 'تسوق الآن' : 'Shop Now'}
          </Link>
        </div>

      </div>
    </div>
  )
}