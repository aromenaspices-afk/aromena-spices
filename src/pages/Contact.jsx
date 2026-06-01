import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiMail, FiPhone, FiSend } from 'react-icons/fi'
import { SiWhatsapp, SiInstagram, SiTiktok, SiFacebook } from 'react-icons/si'

export default function Contact() {
  const { t, i18n } = useTranslation()
  const isAr = i18n.language === 'ar'

  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  function handleSubmit() {
    if (!form.name || !form.email || !form.message) return
    setSent(true)
    setForm({ name: '', email: '', message: '' })
    setTimeout(() => setSent(false), 4000)
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    borderRadius: 12, border: '2px solid #E2C9A8',
    fontSize: '0.9rem', color: '#3E1C00',
    fontFamily: 'Amiri, serif', outline: 'none',
    background: '#FFFBF5', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  }

  const contactItems = [
    {
      href: 'https://wa.me/905550044476',
      icon: <SiWhatsapp size={20} />,
      iconColor: '#25D366', iconBg: '#E7FAF0',
      title: 'WhatsApp',
      value: '+90 555 004 4476',
    },
    {
      href: 'mailto:aromena.official@gmail.com',
      icon: <FiMail size={20} />,
      iconColor: '#7b192c', iconBg: '#fdf0f2',
      title: isAr ? 'البريد الإلكتروني' : 'Email',
      value: 'aromena.official@gmail.com',
    },
    {
      href: 'tel:+905550044476',
      icon: <FiPhone size={20} />,
      iconColor: '#7b192c', iconBg: '#fdf0f2',
      title: isAr ? 'الهاتف' : 'Phone',
      value: '+90 555 004 4476',
    },
    {
      href: 'https://www.instagram.com/aromena.official?igsh=eTU3bWcycmI3djRt',
      icon: <SiInstagram size={20} />,
      iconColor: '#E1306C', iconBg: '#FDF0F6',
      title: 'Instagram',
      value: '@aromena.official',
    },
    {
      href: 'https://www.tiktok.com/@aromena.official?lang=en',
      icon: <SiTiktok size={20} />,
      iconColor: '#1a0610', iconBg: '#F0F0F0',
      title: 'TikTok',
      value: '@aromena.official',
    },
    {
      href: 'https://www.facebook.com/share/1FThc3cWgo/?mibextid=wwXIfr',
      icon: <SiFacebook size={20} />,
      iconColor: '#1877F2', iconBg: '#EAF2FF',
      title: 'Facebook',
      value: 'aromena.official',
    },
  ]

  return (
    <div style={{ background: '#F5E6D3', minHeight: '100vh' }}>

      {/* Hero — متناسق مع باقي الصفحات */}
      <div style={{ background: 'linear-gradient(135deg, #1a0610 0%, #7b192c 60%, #a82040 100%)', padding: '52px 20px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(244,190,105,0.06) 0%, transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(244,190,105,0.12)', border: '1px solid rgba(244,190,105,0.25)', color: '#f4be69', padding: '5px 18px', borderRadius: 50, fontSize: '0.78rem', fontWeight: 600, letterSpacing: 1, marginBottom: 16 }}>
            Aromena Spices
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: '#f4be69', fontFamily: 'Amiri, serif', marginBottom: 10 }}>
            {t('contact.title')}
          </h1>
          {/* فاصل ذهبي */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 40, height: 1, background: 'rgba(244,190,105,0.4)' }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f4be69' }} />
            <div style={{ width: 40, height: 1, background: 'rgba(244,190,105,0.4)' }} />
          </div>
          <p style={{ color: 'rgba(244,190,105,0.65)', fontSize: '0.9rem', lineHeight: 1.8 }}>
            {isAr ? 'نحن هنا للمساعدة في أيِّ وقت' : 'We are here to help anytime'}
          </p>
        </div>
      </div>

      <section style={{ padding: '40px 16px 60px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>

            {/* معلومات التواصل */}
            <div>
              <h2 style={{ fontSize: '1.15rem', color: '#3E1C00', fontFamily: 'Amiri, serif', marginBottom: 18 }}>
                {isAr ? 'تواصل معنا' : 'Get in Touch'}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {contactItems.map((item, i) => (
                  <a key={i} href={item.href} target="_blank" rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 14, padding: '12px 16px', textDecoration: 'none', border: '1px solid #E2C9A8', boxShadow: '0 2px 8px rgba(123,25,44,0.05)', transition: 'transform 0.15s, box-shadow 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(123,25,44,0.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(123,25,44,0.05)' }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: item.iconBg, border: `1.5px solid ${item.iconColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: item.iconColor }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: '#3E1C00', fontWeight: 700, fontSize: '0.88rem', marginBottom: 2 }}>{item.title}</p>
                      <p style={{ color: '#9C6B4E', fontSize: '0.82rem', direction: 'ltr', textAlign: isAr ? 'right' : 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.value}
                      </p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E2C9A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: isAr ? 'rotate(180deg)' : 'none' }}>
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* الفورم */}
            <div style={{ background: '#fff', borderRadius: 20, padding: '24px 20px', border: '1px solid #E2C9A8', boxShadow: '0 4px 20px rgba(123,25,44,0.07)' }}>
              <h2 style={{ fontSize: '1.15rem', color: '#3E1C00', fontFamily: 'Amiri, serif', marginBottom: 20 }}>
                {isAr ? 'أرسل لنا رسالة' : 'Send us a message'}
              </h2>

              {sent ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', border: '2px solid #16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <h3 style={{ color: '#16A34A', marginBottom: 8, fontSize: '1rem', fontFamily: 'Amiri, serif' }}>
                    {isAr ? 'تم الإرسال!' : 'Message Sent!'}
                  </h3>
                  <p style={{ color: '#9C6B4E', fontSize: '0.88rem' }}>
                    {isAr ? 'سنتواصل معك قريباً' : 'We will contact you soon'}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ color: '#3E1C00', fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>{t('contact.name')}</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#7b192c'} onBlur={e => e.target.style.borderColor = '#E2C9A8'} />
                  </div>
                  <div>
                    <label style={{ color: '#3E1C00', fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>{t('contact.email')}</label>
                    <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} type="email" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#7b192c'} onBlur={e => e.target.style.borderColor = '#E2C9A8'} />
                  </div>
                  <div>
                    <label style={{ color: '#3E1C00', fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 6 }}>{t('contact.message')}</label>
                    <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={5}
                      style={{ ...inputStyle, resize: 'vertical' }}
                      onFocus={e => e.target.style.borderColor = '#7b192c'} onBlur={e => e.target.style.borderColor = '#E2C9A8'} />
                  </div>
                  <button onClick={handleSubmit} style={{ background: 'linear-gradient(to left, #7b192c, #a82040)', color: '#f4be69', padding: '13px 0', borderRadius: 12, fontWeight: 700, fontSize: '0.92rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Amiri, serif', boxShadow: '0 4px 14px rgba(123,25,44,0.25)', transition: 'transform 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <FiSend size={15} />{t('contact.send')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}