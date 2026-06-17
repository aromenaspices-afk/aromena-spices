import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiMail, FiPhone, FiFileText, FiBriefcase } from 'react-icons/fi'
import { SiWhatsapp, SiInstagram, SiTiktok, SiFacebook } from 'react-icons/si'

const LOGO        = 'https://res.cloudinary.com/dvt0nntn7/image/upload/v1775408607/02_fwrhni.png'
const IYZICO_BAND = 'https://res.cloudinary.com/dvt0nntn7/image/upload/v1776690519/logo_band_colored_1X_wblz2l.png'
const IYZICO_ODE  = 'https://res.cloudinary.com/dvt0nntn7/image/upload/v1776690595/iyzico_ile_ode_colored_cfovyz.png'

export default function Footer() {
  const { t, i18n } = useTranslation()
  const isAr = i18n.language === 'ar'

  const links = [
    { to: '/',          label: t('nav.home') },
    { to: '/products',  label: t('nav.products') },
    { to: '/packages',  label: t('nav.packages') },
    { to: '/wholesale', label: t('nav.wholesale') },
    { to: '/about',     label: t('nav.about') },
    { to: '/contact',   label: t('nav.contact') },
  ]

  const socials = [
    { href: 'https://www.instagram.com/aromena.official?igsh=eTU3bWcycmI3djRt',   icon: <SiInstagram size={15} />, label: 'Instagram', hoverBg: 'rgba(225,48,108,0.2)',  hoverColor: '#E1306C' },
    { href: 'https://wa.me/905550044476',             icon: <SiWhatsapp size={15} />,  label: 'WhatsApp',  hoverBg: 'rgba(37,211,102,0.2)',  hoverColor: '#25D366' },
    { href: 'https://www.tiktok.com/@aromena.official?lang=en', icon: <SiTiktok size={15} />,    label: 'TikTok',    hoverBg: 'rgba(244,190,105,0.2)', hoverColor: '#f4be69' },
    { href: 'https://www.facebook.com/share/1FThc3cWgo/?mibextid=wwXIfr',     icon: <SiFacebook size={15} />,  label: 'Facebook',  hoverBg: 'rgba(24,119,242,0.2)',  hoverColor: '#1877F2' },
  ]

  const legal = [
    { to: '/privacy',         label_ar: 'سياسة الخصوصية',        label_en: 'Privacy Policy' },
    { to: '/shipping-policy', label_ar: 'شروط التسليم والإرجاع', label_en: 'Shipping & Returns' },
    { to: '/sales-contract',  label_ar: 'عقد البيع عن بُعد',     label_en: 'Sales Contract' },
  ]

  const linkStyle = { color: 'rgba(244,190,105,0.5)', textDecoration: 'none', fontSize: '0.8rem', transition: 'color 0.15s', whiteSpace: 'nowrap' }
  const socialBtn = { width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(244,190,105,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(244,190,105,0.6)', textDecoration: 'none', transition: 'all 0.2s', flexShrink: 0 }

  return (
    <footer style={{ background: 'linear-gradient(180deg, #7b192c 0%, #1a0610 100%)', marginTop: 60 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 16px' }}>

        {/* ═══ الصف 1: لوغو في الوسط ═══ */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <img src={LOGO} alt="Aromena Spices" style={{ height: 40, objectFit: 'contain' }} />
          <p style={{ color: 'rgba(244,190,105,0.45)', fontSize: '0.72rem', fontStyle: 'italic' }}>
            {isAr ? 'صحّة بكُلّ رشّة' : 'A Pinch of Health in Every Dash'}
          </p>
          {/* سوشل ميديا */}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            {socials.map((s, i) => (
              <a key={i} href={s.href} target="_blank" rel="noreferrer" title={s.label} style={socialBtn}
                onMouseEnter={e => { e.currentTarget.style.background = s.hoverBg; e.currentTarget.style.color = s.hoverColor }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(244,190,105,0.6)' }}
              >
                {s.icon}
              </a>
            ))}
            <a href="mailto:aromena.official@gmail.com" title="aromena.official@gmail.com" style={socialBtn}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,190,105,0.15)'; e.currentTarget.style.color = '#f4be69' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(244,190,105,0.6)' }}
            >
              <FiMail size={14} />
            </a>
            <a href="tel:+905550044476" title="+90 555 075 4476" style={socialBtn}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,190,105,0.15)'; e.currentTarget.style.color = '#f4be69' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(244,190,105,0.6)' }}
            >
              <FiPhone size={14} />
            </a>
          </div>
        </div>

        {/* ═══ الصف 2: روابط التنقل ═══ */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px 20px', marginBottom: 20 }}>
          {links.map(link => (
            <Link key={link.to} to={link.to} style={linkStyle}
              onMouseEnter={e => e.currentTarget.style.color = '#f4be69'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(244,190,105,0.5)'}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* ═══ السجلّات الرسميّة: ضريبيّ + تجاريّ ═══ */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
          {[
            { icon: <FiFileText size={15} />, label: isAr ? 'الرقم الضريبيّ' : 'Tax No', value: '3851825173' },
            { icon: <FiBriefcase size={15} />, label: isAr ? 'السجلّ التجاريّ' : 'Trade Reg. No', value: '379102-5' },
          ].map((it, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 9,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(244,190,105,0.24)',
              borderRadius: 12, padding: '9px 16px',
              boxShadow: 'inset 0 1px 0 rgba(244,190,105,0.08)',
            }}>
              <span style={{ color: 'rgba(244,190,105,0.7)', display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>{it.icon}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <span style={{ color: 'rgba(244,190,105,0.7)', fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.2 }}>{it.label}</span>
                <bdi dir="ltr" style={{ color: '#f7c873', fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.5px', lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>{it.value}</bdi>
              </span>
            </div>
          ))}
        </div>

        {/* فاصل */}
        <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(244,190,105,0.12), transparent)', marginBottom: 16 }} />

        {/* ═══ الصف 3: دفع + قانوني + copyright ═══ */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>

          {/* لوغو الدفع */}
          <div style={{ background: '#fff', borderRadius: 7, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 7 }}>
            <img src={IYZICO_BAND} alt="Visa Mastercard" style={{ height: 20, objectFit: 'contain' }} />
            <div style={{ width: 1, height: 14, background: '#ddd' }} />
            <img src={IYZICO_ODE} alt="iyzico" style={{ height: 17, objectFit: 'contain' }} />
          </div>

          {/* روابط قانونية */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {legal.map((l, i) => (
              <Link key={i} to={l.to}
                style={{ color: 'rgba(244,190,105,0.3)', textDecoration: 'none', fontSize: '0.7rem', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(244,190,105,0.65)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(244,190,105,0.3)'}
              >
                {isAr ? l.label_ar : l.label_en}
              </Link>
            ))}
          </div>

          {/* copyright */}
          <p style={{ color: 'rgba(244,190,105,0.25)', fontSize: '0.7rem' }}>
            Aromena Spices &copy; 2026
          </p>
        </div>

      </div>
    </footer>
  )
}