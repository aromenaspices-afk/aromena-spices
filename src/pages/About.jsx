import { useTranslation } from 'react-i18next'
import { FiInstagram, FiMapPin, FiPhone, FiExternalLink, FiCalendar, FiDroplet, FiGlobe, FiTruck, FiHeart } from 'react-icons/fi'
import { useSettings } from '../hooks/useSettings'
import { useCollection } from '../hooks/useFirestore'

export default function About() {
  const { t, i18n } = useTranslation()
  const isAr = i18n.language === 'ar'
  const { settings } = useSettings()
  const { data: locations } = useCollection('locations')
  const activeLocations = locations.filter(l => l.active !== false)

  const TYPE_CONFIG = {
    agent:    { label_ar: 'وكيل معتمد',     label_en: 'Authorized Agent',   color: '#7b192c', bg: '#fdf0f2' },
    event:    { label_ar: 'فعالية / ماركت', label_en: 'Event / Market',     color: '#1E40AF', bg: '#EFF6FF' },
    delivery: { label_ar: 'نقطة توزيع',     label_en: 'Distribution Point', color: '#065F46', bg: '#F0FDF4' },
  }

  const values = [
    { icon: <FiDroplet size={20} />, title_ar: 'طبيعي 100%',       title_en: '100% Natural',    desc_ar: 'بدون مواد حافظة أو إضافات صناعية',    desc_en: 'No preservatives or artificial additives' },
    { icon: <FiGlobe size={20} />,   title_ar: 'من أجود المصادر',   title_en: 'Premium Sources', desc_ar: 'بهارات مختارة من أفضل مناطق العالم',   desc_en: 'Spices selected from the finest regions' },
    { icon: <FiHeart size={20} />,   title_ar: 'بكل حب',            title_en: 'With Love',       desc_ar: 'كل منتج يُعبّأ بعناية واهتمام',        desc_en: 'Every product packed with care' },
    { icon: <FiTruck size={20} />,   title_ar: 'شحن سريع',          title_en: 'Fast Shipping',   desc_ar: 'توصيل لأوروبا والخليج والأردن وتركيا', desc_en: 'Delivery to Europe, Gulf, Jordan & Turkey' },
  ]

  const origins = [
    { code: 'SY', country_ar: 'سوريا',          country_en: 'Syria',     spice_ar: 'السمّاق والفلفل الأحمر', spice_en: 'Sumac & Red Pepper' },
    { code: 'SA', country_ar: 'الجزيرة العربية', country_en: 'Arabia',    spice_ar: 'الكبسة',                 spice_en: 'Kabsa' },
    { code: 'YE', country_ar: 'اليمن',            country_en: 'Yemen',     spice_ar: 'المندي',                 spice_en: 'Mandi' },
    { code: 'TR', country_ar: 'تركيا',            country_en: 'Turkey',    spice_ar: 'الشيش والعثماني',        spice_en: 'Shish & Ottoman' },
    { code: 'IT', country_ar: 'إيطاليا',          country_en: 'Italy',     spice_ar: 'باستا الريحان والطماطم', spice_en: 'Basil & Tomato Pasta' },
    { code: 'US', country_ar: 'لويزيانا',         country_en: 'Louisiana', spice_ar: 'الكيجن',                 spice_en: 'Cajun' },
  ]

  const now = new Date()

  return (
    <div style={{ background: '#F5E6D3', minHeight: '100vh' }}>

      {/* ═══ HERO ═══ */}
      <div style={{ background: 'linear-gradient(135deg, #1a0610 0%, #7b192c 60%, #a82040 100%)', padding: '56px 20px 64px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(244,190,105,0.06) 0%, transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(244,190,105,0.12)', border: '1px solid rgba(244,190,105,0.25)', color: '#f4be69', padding: '5px 18px', borderRadius: 50, fontSize: '0.78rem', fontWeight: 600, letterSpacing: 1, marginBottom: 16 }}>
            Aromena Spices
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: '#f4be69', fontFamily: 'Amiri, serif', marginBottom: 12 }}>
            {t('about.title')}
          </h1>
          <p style={{ color: 'rgba(244,190,105,0.65)', fontSize: '0.9rem', lineHeight: 1.8 }}>
            {isAr ? 'رحلة بدأت من شغف حقيقي بعالم البهارات الأصيلة' : 'A journey born from a true passion for authentic spices'}
          </p>
        </div>
      </div>

      
      <section style={{ padding: '56px 16px', background: '#F5E6D3' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40, alignItems: 'center' }}>

            
            <div style={{ background: '#fff', borderRadius: 24, padding: '36px 24px', textAlign: 'center', border: '1px solid #E2C9A8', boxShadow: '0 8px 32px rgba(123,25,44,0.08)' }}>
              <div style={{ width: 110, height: 110, borderRadius: '50%', background: 'linear-gradient(135deg, #7b192c, #a82040)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(123,25,44,0.25)' }}>
                <img src="/aromena-founder.webp" alt="Ghalia" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <h3 style={{ color: '#3E1C00', fontSize: '1.15rem', fontWeight: 700, marginBottom: 5, fontFamily: 'Amiri, serif' }}>
                {t('about.owner')}
              </h3>
              <p style={{ color: '#7b192c', fontSize: '0.82rem', fontWeight: 600, marginBottom: 14 }}>
                {isAr ? 'مؤسّسة Aromena' : 'Founder of Aromena'}
              </p>
              <p style={{ color: '#9C6B4E', fontSize: '0.86rem', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {t('about.owner_desc')}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
                <a href="https://www.instagram.com/aromena.official?igsh=eTU3bWcycmI3djRt" target="_blank" rel="noreferrer" style={{ width: 38, height: 38, borderRadius: 10, background: '#fdf0f2', border: '1px solid rgba(123,25,44,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7b192c', textDecoration: 'none', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#E1306C'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fdf0f2'; e.currentTarget.style.color = '#7b192c' }}
                >
                  <FiInstagram size={16} />
                </a>
              </div>
            </div>

            
            <div>
              <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', color: '#3E1C00', fontFamily: 'Amiri, serif', marginBottom: 16, lineHeight: 1.3 }}>
                {t('about.story_title')}
              </h2>
              <p style={{ color: '#6B3A2A', lineHeight: 2, fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
                {isAr ? `أرومينا ولِدت من شغف أصيل في عالم البهارات والنّكهات الغنيّة
حكاية بدأت من هواية في مطبخ المنزل لـ شيف مُحترفة وخبرة على مدار سنين
وتحوّلت إلى حلم بـ جودة استثنائيّة نحملهُ معاً إلى كُلِّ بيت عربي في العالم

في أرومينا نؤمنُ بأنّ الطّعام الشّهي يبدأ من بهار مُتقن الخلطة
كُل مُنتج مُختار بعناية من أجود المصادر حول العالم لمنحك مذاقاً لايُنسى` : `Aromena was born from a genuine passion for spices and rich flavors — a story that began as a hobby in a home kitchen, guided by a professional chef with years of expertise, and transformed into a dream of exceptional quality brought to every Arab home around the world.

At Aromena, we believe delicious food starts with a perfectly crafted spice blend — every product is carefully sourced from the finest origins to give you an unforgettable taste.`}
              </p>
              <p style={{ color: '#7b192c', fontWeight: 700, fontSize: '0.95rem', fontStyle: 'italic', marginTop: 16 }}>
                {isAr ? 'Aromena صحّة بكل رشّة' : 'Aromena — A Pinch of Health in Every Dash'}
              </p>
            </div>
          </div>
        </div>
      </section>

      
      <section style={{ background: '#EDD9C0', padding: '50px 16px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', color: '#3E1C00', fontFamily: 'Amiri, serif', marginBottom: 32 }}>
            {isAr ? 'قيمنا:' : 'Our Values'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {values.map((v, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, padding: '22px 18px', border: '1px solid #E2C9A8', boxShadow: '0 2px 12px rgba(123,25,44,0.05)', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: 'linear-gradient(135deg, #7b192c, #a82040)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f4be69', flexShrink: 0 }}>
                  {v.icon}
                </div>
                <div>
                  <h3 style={{ color: '#3E1C00', fontWeight: 700, marginBottom: 5, fontSize: '0.92rem' }}>{isAr ? v.title_ar : v.title_en}</h3>
                  <p style={{ color: '#9C6B4E', fontSize: '0.78rem', lineHeight: 1.6 }}>{isAr ? v.desc_ar : v.desc_en}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section style={{ padding: '50px 16px', background: '#F5E6D3' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', color: '#3E1C00', fontFamily: 'Amiri, serif', marginBottom: 32 }}>
            {isAr ? 'مصادر بهاراتنا' : 'Our Spice Origins'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
            {origins.map((o, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '18px 14px', textAlign: 'center', border: '1px solid #E2C9A8', boxShadow: '0 2px 8px rgba(123,25,44,0.05)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #7b192c18, #a8204018)', border: '1px solid #E2C9A8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                  <img src={`https://flagcdn.com/w40/${o.code.toLowerCase()}.png`} alt={o.country_en} style={{ width: 28, height: 20, objectFit: 'cover', borderRadius: 3 }} />
                </div>
                <h4 style={{ color: '#3E1C00', fontWeight: 700, fontSize: '0.88rem', marginBottom: 4 }}>{isAr ? o.country_ar : o.country_en}</h4>
                <p style={{ color: '#9C6B4E', fontSize: '0.75rem', lineHeight: 1.5 }}>{isAr ? o.spice_ar : o.spice_en}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      {activeLocations.length > 0 && (
        <section style={{ background: '#EDD9C0', padding: '50px 16px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', color: '#3E1C00', fontFamily: 'Amiri, serif', marginBottom: 10 }}>
              {isAr ? 'نقاط البيع والفعاليات' : 'Sales Points & Events'}
            </h2>
            <p style={{ textAlign: 'center', color: '#9C6B4E', fontSize: '0.88rem', marginBottom: 32 }}>
              {isAr ? 'اعثر علينا بالقرب منك' : 'Find us near you'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
              {activeLocations.map((loc, i) => {
                const cfg = TYPE_CONFIG[loc.type] || TYPE_CONFIG.agent
                const isExpired = loc.type === 'event' && loc.dateTo && new Date(loc.dateTo) < now
                return (
                  <div key={loc.id || i} style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', border: '1px solid #E2C9A8', boxShadow: '0 4px 16px rgba(123,25,44,0.07)', opacity: isExpired ? 0.6 : 1 }}>
                    {loc.image ? (
                      <div style={{ height: 160, overflow: 'hidden' }}>
                        <img src={loc.image} alt={isAr ? loc.name_ar : loc.name_en} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <div style={{ height: 90, background: `linear-gradient(135deg, ${cfg.bg}, ${cfg.color}15)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiMapPin size={32} color={cfg.color} />
                      </div>
                    )}
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <span style={{ background: cfg.bg, color: cfg.color, fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 50 }}>
                          {isAr ? cfg.label_ar : cfg.label_en}
                        </span>
                        {isExpired && (
                          <span style={{ background: '#F5F5F5', color: '#9C6B4E', fontSize: '0.68rem', fontWeight: 600, padding: '3px 8px', borderRadius: 50 }}>
                            {isAr ? 'انتهت' : 'Ended'}
                          </span>
                        )}
                      </div>
                      <h3 style={{ color: '#3E1C00', fontSize: '0.97rem', fontWeight: 700, fontFamily: 'Amiri, serif', marginBottom: 6 }}>
                        {isAr ? loc.name_ar : loc.name_en}
                      </h3>
                      {(loc.address || loc.city) && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 5, marginBottom: 5 }}>
                          <FiMapPin size={12} color="#9C6B4E" style={{ marginTop: 2, flexShrink: 0 }} />
                          <p style={{ color: '#9C6B4E', fontSize: '0.8rem', lineHeight: 1.5 }}>
                            {[loc.address, loc.city, isAr ? loc.country_ar : loc.country_en].filter(Boolean).join(' — ')}
                          </p>
                        </div>
                      )}
                      {loc.type === 'event' && loc.dateFrom && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                          <FiCalendar size={12} color="#9C6B4E" />
                          <p style={{ color: '#9C6B4E', fontSize: '0.8rem' }}>
                            {new Date(loc.dateFrom).toLocaleDateString(isAr ? 'ar-SA' : 'en-GB')}
                            {loc.dateTo && ` — ${new Date(loc.dateTo).toLocaleDateString(isAr ? 'ar-SA' : 'en-GB')}`}
                          </p>
                        </div>
                      )}
                      {(isAr ? loc.desc_ar : loc.desc_en) && (
                        <p style={{ color: '#6B3A2A', fontSize: '0.8rem', lineHeight: 1.6, margin: '8px 0' }}>
                          {isAr ? loc.desc_ar : loc.desc_en}
                        </p>
                      )}
                      {(loc.whatsapp || loc.maps_url) && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                          {loc.whatsapp && (
                            <a href={`https://wa.me/${loc.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: '#E7FAF0', color: '#16A34A', border: '1px solid #BBF7D0', borderRadius: 10, padding: '7px 0', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>
                              <FiPhone size={12} /> {isAr ? 'واتساب' : 'WhatsApp'}
                            </a>
                          )}
                          {loc.maps_url && (
                            <a href={loc.maps_url} target="_blank" rel="noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE', borderRadius: 10, padding: '7px 0', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>
                              <FiExternalLink size={12} /> {isAr ? 'الخريطة' : 'Maps'}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

    </div>
  )
}