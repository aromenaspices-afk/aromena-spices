import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useCollection } from '../hooks/useFirestore'
import { useSettings } from '../hooks/useSettings'
import Ticker from '../components/Ticker'
import {
  FiShoppingCart, FiArrowLeft, FiArrowRight,
  FiChevronLeft, FiChevronRight,
  FiDroplet, FiGlobe, FiTruck, FiHeart
} from 'react-icons/fi'
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useCurrency } from '../context/CurrencyContext'

const WHY = [
  { icon: <FiDroplet size={22} />, title_ar: '100% طبيعي', title_en: '100% Natural', desc_ar: 'بدون مواد حافظة أو إضافات صناعّية', desc_en: 'No preservatives or artificial additives' },
  { icon: <FiGlobe size={22} />, title_ar: 'من أجود المصادر', title_en: 'Premium Sources', desc_ar: 'بهارات مختارة من أفضل مناطق العالم', desc_en: 'Spices from the finest regions worldwide' },
  { icon: <FiTruck size={22} />, title_ar: 'شحن سريع', title_en: 'Fast Shipping', desc_ar: 'توصيل لأوروبا والخليج وتركيّا', desc_en: 'Delivery to Europe, Gulf & Turkey' },
  { icon: <FiHeart size={22} />, title_ar: 'بكلّ حب', title_en: 'Made with Love', desc_ar: 'كل منتج يُعبّأ بعناية واهتمام', desc_en: 'Every product packed with care' },
]

const STATS = [
  { num: '12+', label_ar: 'منتج فاخر', label_en: 'Premium Products' },
  { num: '500+', label_ar: 'زبون سعيد', label_en: 'Happy Customers' },
  { num: '4', label_ar: 'دول نوصلها', label_en: 'Countries' },
  { num: '100%', label_ar: 'طبيعي', label_en: 'Natural' },
]

export default function Home() {
  const { t, i18n } = useTranslation()
  const { addItem } = useCart()
  const { formatPrice } = useCurrency()
  const isAr = i18n.language === 'ar'
  const { data: products } = useCollection('products')
  const { data: packages } = useCollection('packages')
  const { settings } = useSettings()
  const featured = products.slice(0, 8)
  const [visible, setVisible] = useState(false)
  const [sliderIdx, setSliderIdx] = useState(0)
  const sliderRef = useRef(null)
  const touchStartX = useRef(null)
  const sliderImages = settings?.slider_images || []

  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  useEffect(() => {
    if (sliderImages.length <= 1) return
    const interval = setInterval(() => setSliderIdx(i => (i + 1) % sliderImages.length), 4000)
    return () => clearInterval(interval)
  }, [sliderImages.length])

  function sliderPrev() { setSliderIdx(i => (i - 1 + sliderImages.length) % sliderImages.length) }
  function sliderNext() { setSliderIdx(i => (i + 1) % sliderImages.length) }
  function handleTouchStart(e) { touchStartX.current = e.touches[0].clientX }
  function handleTouchEnd(e) {
    if (!touchStartX.current) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) { diff > 0 ? sliderNext() : sliderPrev() }
    touchStartX.current = null
  }

  return (
    <div style={{ background: '#F5E6D3', overflow: 'hidden' }}>

      {/* ═══ HERO ═══ */}
      <section style={{ background: 'linear-gradient(135deg, #1a0610 0%, #7b192c 50%, #a82040 100%)', padding: '60px 20px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(244,190,105,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(244,190,105,0.05) 0%, transparent 40%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40, alignItems: 'center' }}>

            {/* النص */}
            <div style={{ order: isAr ? 2 : 1, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.7s ease' }}>
              <div style={{ display: 'inline-block', background: 'rgba(244,190,105,0.12)', border: '1px solid rgba(244,190,105,0.25)', color: '#f4be69', padding: '6px 18px', borderRadius: 50, fontSize: '0.82rem', fontWeight: 600, marginBottom: 20, letterSpacing: 1 }}>
                Aromena Spices
              </div>
              <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)', fontWeight: 900, color: '#fff', lineHeight: 1.25, marginBottom: 16, fontFamily: 'Amiri, serif' }}>
                {t('home.hero_title')}<br />
                <span style={{ color: '#f4be69' }}>Aromena</span>
              </h1>
              <p style={{ fontSize: '1rem', color: 'rgba(244,190,105,0.75)', marginBottom: 32, lineHeight: 1.8 }}>
                {t('home.hero_subtitle')}
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 44 }}>
                <Link to="/products" style={{
                  background: '#f4be69', color: '#7b192c',
                  padding: '13px 32px', borderRadius: 50,
                  fontSize: '0.95rem', fontWeight: 800, textDecoration: 'none',
                  display: 'inline-block', transition: 'all 0.2s',
                }}>
                  {t('home.hero_btn')}
                </Link>
                <Link to="/about" style={{
                  background: 'transparent', color: 'rgba(244,190,105,0.85)',
                  border: '2px solid rgba(244,190,105,0.4)',
                  padding: '11px 30px', borderRadius: 50,
                  fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none',
                  display: 'inline-block', transition: 'all 0.2s',
                }}>
                  {isAr ? 'عن أرومينا' : 'About Us'}
                </Link>
              </div>

              {/* إحصائيات الهيرو */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
                {STATS.map((s, i) => (
                  <div key={i} style={{
                    paddingRight: i > 0 ? 0 : 0,
                    borderRight: isAr && i < STATS.length - 1 ? '1px solid rgba(244,190,105,0.2)' : 'none',
                    borderLeft: !isAr && i > 0 ? '1px solid rgba(244,190,105,0.2)' : 'none',
                    textAlign: 'center', paddingTop: 4, paddingBottom: 4,
                  }}>
                    <div style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.5rem)', fontWeight: 900, color: '#f4be69' }}>{s.num}</div>
                    <div style={{ color: 'rgba(244,190,105,0.55)', fontSize: 'clamp(0.6rem, 1.8vw, 0.75rem)' }}>{isAr ? s.label_ar : s.label_en}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* السلايدر */}
            <div style={{ order: isAr ? 1 : 2, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.9s ease' }}>
              <div ref={sliderRef} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
                style={{ width: '100%', maxWidth: 380, aspectRatio: '1', borderRadius: 28, overflow: 'hidden', background: 'rgba(244,190,105,0.06)', border: '1px solid rgba(244,190,105,0.12)', boxShadow: '0 30px 80px rgba(0,0,0,0.4)', position: 'relative', margin: '0 auto' }}>
                {sliderImages.length > 0 ? (
                  <>
                    {sliderImages.map((img, idx) => (
                      <img key={idx} src={img} alt={`slide-${idx}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: idx === sliderIdx ? 1 : 0, transition: 'opacity 0.6s ease' }} />
                    ))}
                    {sliderImages.length > 1 && (
                      <>
                        <button onClick={sliderPrev} style={{ position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)', background: 'rgba(123,25,44,0.7)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: '#f4be69', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}><FiChevronRight size={16} /></button>
                        <button onClick={sliderNext} style={{ position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)', background: 'rgba(123,25,44,0.7)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: '#f4be69', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}><FiChevronLeft size={16} /></button>
                        <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 2 }}>
                          {sliderImages.map((_, idx) => (
                            <button key={idx} onClick={() => setSliderIdx(idx)} style={{ width: idx === sliderIdx ? 20 : 7, height: 7, borderRadius: 50, background: idx === sliderIdx ? '#f4be69' : 'rgba(244,190,105,0.35)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <FiShoppingCart size={48} color="rgba(244,190,105,0.4)" />
                    <p style={{ color: 'rgba(244,190,105,0.5)', fontSize: '0.8rem', textAlign: 'center', padding: '0 20px' }}>
                      {isAr ? 'أضف صور المعرض من لوحة التحكم' : 'Add slider images from admin panel'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WHY AROMENA ═══ */}
      <section style={{ background: '#fff', padding: '48px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {WHY.map((w, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '22px 20px', borderRadius: 16, background: '#FFFBF5', border: '1px solid #E2C9A8' }}>
                <div style={{ width: 48, height: 48, borderRadius: 13, background: 'linear-gradient(135deg, #7b192c, #a82040)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f4be69', flexShrink: 0 }}>
                  {w.icon}
                </div>
                <div>
                  <p style={{ color: '#3E1C00', fontWeight: 700, fontSize: '0.92rem', marginBottom: 5 }}>{isAr ? w.title_ar : w.title_en}</p>
                  <p style={{ color: '#9C6B4E', fontSize: '0.78rem', lineHeight: 1.7 }}>{isAr ? w.desc_ar : w.desc_en}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STORY ═══ */}
      <section style={{ background: '#EDD9C0', padding: '70px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 50, alignItems: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 280, height: 280, borderRadius: '50%', background: 'linear-gradient(135deg, #7b192c, #a82040)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 60px rgba(123,25,44,0.25)', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
                  {settings?.owner_photo_url
                    ? <img src={settings.owner_photo_url} alt="Ghalia" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(244,190,105,0.2)' }} />
                  }
                </div>
                <div style={{ position: 'absolute', inset: -12, borderRadius: '50%', border: '3px dashed rgba(123,25,44,0.3)', animation: 'spin 20s linear infinite' }} />
                <div style={{ position: 'absolute', bottom: 10, right: -10, background: '#fff', borderRadius: 16, padding: '10px 16px', boxShadow: '0 8px 24px rgba(62,28,0,0.12)', zIndex: 2 }}>
                  <p style={{ color: '#7b192c', fontWeight: 700, fontSize: '0.85rem', marginBottom: 2 }}>Ghalia Sawan</p>
                  <p style={{ color: '#9C6B4E', fontSize: '0.75rem' }}>{isAr ? 'مؤسسة أرومينا' : 'Founder of Aromena'}</p>
                </div>
              </div>
            </div>
            <div>
              <div style={{ display: 'inline-block', background: 'rgba(123,25,44,0.1)', border: '1px solid rgba(123,25,44,0.2)', color: '#7b192c', padding: '5px 16px', borderRadius: 50, fontSize: '0.8rem', fontWeight: 600, marginBottom: 16 }}>
                {isAr ? 'قِصَّة الشِّيف' : 'Chef\'s Story'}
              </div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: '#3E1C00', fontFamily: 'Amiri, serif', marginBottom: 6, lineHeight: 1.3 }}>
                {isAr ? 'الشِّيف غالية صوَّان' : 'Chef Ghalia Sawan'}
              </h2>
              <p style={{ color: '#7b192c', fontWeight: 600, fontSize: '0.88rem', marginBottom: 6, fontStyle: 'italic' }}>
                Gastronomy culinary arts specialist
              </p>
              <div style={{ marginBottom: 18 }}>
                <p style={{ color: '#6B3A2A', fontSize: '0.83rem', lineHeight: 1.9 }}>
                  {isAr
                    ? 'بكالوريوس في فُنونِ الطَّهيِ الحَديثة'
                    : 'Bachelor in Modern Culinary Arts'}
                </p>
                <p style={{ color: '#6B3A2A', fontSize: '0.83rem', lineHeight: 1.9 }}>
                  {isAr
                    ? 'خِبرة أكثر من عشر سنوات في مجال تاريخ الأطعمة والثقافات الغذائيّة وعلوم الغذاء'
                    : 'Over ten years of experience in food history, culinary cultures and food science'}
                </p>
                <p style={{ color: '#6B3A2A', fontSize: '0.83rem', lineHeight: 1.9 }}>
                  {isAr
                    ? 'مُتخصِّصة في تطوير الوصفات والمُنتجات الغذائيَّة والتَّدريب الأكاديمي في مجال الطَّهي'
                    : 'Specialized in recipe development, food products and academic culinary training'}
                </p>
              </div>
              <p style={{ color: '#6B3A2A', lineHeight: 2, fontSize: '0.95rem', marginBottom: 20 }}>
                {isAr ? (
                  <>
                    أرومينا وُلِدت من شغف أصيل في عالم البهارات والنّكهات الغنيّة
                     
                    <br />
                    حكاية بدأت من هواية في مطبخ المنزل لـ شيف مُحترفة وخبرة على مدار سنين
                    <br />
                    وتحوّلت إلى حلم بـ جودة استثنائيّة نحملُها معاً إلى كُلِّ بيت عربي في العالم.
                  </>
                ) : (
                  <>
                    Aromena was born from a genuine passion for spices and rich flavors —
                    a story that began as a hobby in a home kitchen, guided by a professional chef
                    with years of expertise, and transformed into a dream of exceptional quality
                    brought to every Arab home around the world.
                  </>
                )}
              </p>
              <p style={{ color: '#9C6B4E', lineHeight: 1.9, fontSize: '0.92rem', marginBottom: 10 }}>
                {isAr
                  ? <>في أرومينا نؤمنُ بأنّ الطّعام الشّهي يبدأ من بهار مُتقن الخلطة<br />كُل مُنتج مُختار بعناية من أجود المصادر حول العالم لمنحك مذاقاً لا يُنسى.</>
                  : 'At Aromena, we believe delicious food starts with a perfectly crafted spice blend — every product is carefully sourced from the finest origins around the world to give you an unforgettable taste.'}
              </p>
              <p style={{ color: '#7b192c', fontWeight: 700, fontSize: '0.95rem', fontStyle: 'italic', marginBottom: 28 }}>
                {isAr ? 'Aromena — صحّة بكل رشّة' : 'Aromena — A Pinch of Health in Every Dash'}
              </p>
              <Link to="/about" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#EDD9C0', color: '#7b192c',
                border: '1px solid #7b192c', borderBottom: '4px solid #7b192c',
                padding: '11px 28px', borderRadius: 50,
                fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
                transition: 'all 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(0.9)'; e.currentTarget.style.borderTop = '4px solid #7b192c'; e.currentTarget.style.borderBottom = '1px solid #7b192c' }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.borderTop = '1px solid #7b192c'; e.currentTarget.style.borderBottom = '4px solid #7b192c' }}
              >
                {isAr ? 'اقرأ المزيد' : 'Read More'}
                {isAr ? <FiArrowLeft size={16} /> : <FiArrowRight size={16} />}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Ticker isAr={isAr} />

      {/* ═══ PRODUCTS ═══ */}
      <section style={{ padding: '70px 20px', background: '#F5E6D3' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: '#3E1C00', fontFamily: 'Amiri, serif', marginBottom: 4 }}>{t('home.featured')}</h2>
              <p style={{ color: '#9C6B4E', fontSize: '0.88rem' }}>{isAr ? 'اختر من مجموعتنا الفاخرة' : 'Choose from our premium collection'}</p>
            </div>
            <Link to="/products" style={{ color: '#7b192c', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem', border: '2px solid #7b192c', padding: '7px 20px', borderRadius: 50 }}>
              {isAr ? 'عرض الكل ←' : 'View All →'}
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 18 }}>
            {featured.map((p, idx) => (
              <ProductCard key={p.slug || p.id} product={p} isAr={isAr} t={t} addItem={addItem} delay={idx * 60} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section style={{ background: 'linear-gradient(135deg, #1a0610, #7b192c)', padding: '32px 16px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
            {STATS.map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '20px 8px', borderRight: i < STATS.length - 1 ? '1px solid rgba(244,190,105,0.1)' : 'none' }}>
                <div style={{ fontSize: 'clamp(1.4rem, 4vw, 2.4rem)', fontWeight: 900, color: '#f4be69', marginBottom: 4, fontFamily: 'Amiri, serif' }}>{s.num}</div>
                <div style={{ color: 'rgba(244,190,105,0.6)', fontSize: 'clamp(0.65rem, 2vw, 0.85rem)', fontWeight: 500 }}>{isAr ? s.label_ar : s.label_en}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PACKAGES ═══ */}
      <section style={{ background: '#EDD9C0', padding: '70px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: '#3E1C00', fontFamily: 'Amiri, serif', marginBottom: 10 }}>
              {isAr ? 'باقاتنا المميزة' : 'Our Packages'}
            </h2>
            <p style={{ color: '#9c6b4e', fontSize: '0.95rem' }}>
              {isAr ? '3 باقات جاهزة أو صمّم باقتك الخاصة' : '3 ready packages or build your own'}
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 20 }}>
            {packages.map((pkg, i) => (
              <div key={pkg.id || i} style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid #E2C9A8', boxShadow: '0 4px 20px rgba(62,28,0,0.07)', position: 'relative' }}>
                {pkg.tag_ar && (
                  <div style={{ position: 'absolute', top: 12, right: isAr ? 'auto' : 12, left: isAr ? 12 : 'auto', background: pkg.color, color: '#fff', fontSize: '0.7rem', padding: '3px 12px', borderRadius: 50, fontWeight: 700, zIndex: 1 }}>
                    {isAr ? pkg.tag_ar : pkg.tag_en}
                  </div>
                )}
                <div style={{ background: `linear-gradient(135deg, ${pkg.color}18, ${pkg.color}30)`, padding: '30px 20px', textAlign: 'center', minHeight: 130, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  {pkg.image
                    ? <img src={pkg.image} alt={pkg.name_ar} style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 12, marginBottom: 8 }} />
                    : <div style={{ fontSize: '3rem', marginBottom: 8 }}>{pkg.emoji}</div>
                  }
                  <h3 style={{ color: '#3E1C00', fontWeight: 700, fontFamily: 'Amiri, serif', fontSize: '1.1rem' }}>{isAr ? pkg.name_ar : pkg.name_en}</h3>
                </div>
                <div style={{ padding: '16px 20px', textAlign: 'center' }}>
                  <p style={{ color: '#9C6B4E', fontSize: '0.85rem', marginBottom: 10 }}>{isAr ? pkg.desc_ar : pkg.desc_en}</p>
                  <p style={{ color: '#7b192c', fontWeight: 900, fontSize: '1.3rem', marginBottom: 14 }}>{formatPrice(pkg.price)}</p>
                  <Link to="/packages" style={{ display: 'block', background: 'linear-gradient(to left, #7b192c, #a82040)', color: '#f4be69', padding: '10px 0', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
                    {isAr ? 'اطلب الآن' : 'Order Now'}
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

function ProductCard({ product, isAr, t, addItem, delay }) {
  const [added, setAdded] = useState(false)
  const [visible, setVisible] = useState(false)
  const { formatPrice } = useCurrency()
  const name = isAr ? product.name_ar : product.name_en
  const origin = isAr ? product.origin_ar : product.origin_en

  const productSizes = product?.sizes?.length
    ? product.sizes
    : product?.prices
      ? Object.entries(product.prices).filter(([, v]) => v > 0).map(([k, v]) => ({ label: k, price: v }))
      : []

  const firstSize = productSizes[0]

  useEffect(() => { setTimeout(() => setVisible(true), delay) }, [delay])

  function handleAdd() {
    if (!firstSize) return
    addItem({
      id: `${product.slug || product.id}_${firstSize.label}`,
      productId: product.slug || product.id,
      name, size: firstSize.label, price: firstSize.price,
      image: product.images?.[0] || product.image || null,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid #E2C9A8', boxShadow: '0 4px 18px rgba(62,28,0,0.07)', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
      <Link to={`/products/${product.slug}`}>
        <div style={{ height: 155, overflow: 'hidden', background: `linear-gradient(135deg, ${product.color}18, ${product.color}38)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {(product.images?.[0] || product.image)
            ? <img src={product.images?.[0] || product.image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <FiShoppingCart size={40} color={product.color || '#E2C9A8'} />
          }
        </div>
      </Link>
      <div style={{ padding: '14px 12px' }}>
        <Link to={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
          <h3 style={{ color: '#3E1C00', fontSize: '0.95rem', fontWeight: 700, marginBottom: 4 }}>{name}</h3>
        </Link>
        <p style={{ color: '#9C6B4E', fontSize: '0.75rem', marginBottom: 4 }}>{origin}</p>
        {firstSize && (
          <p style={{ color: '#7b192c', fontWeight: 700, fontSize: '0.85rem', marginBottom: 10 }}>
            {isAr ? 'من' : 'from'} {formatPrice(firstSize.price)}
          </p>
        )}
        <button onClick={handleAdd} style={{ width: '100%', background: added ? '#16A34A' : 'linear-gradient(to left, #7b192c, #a82040)', color: added ? '#fff' : '#f4be69', padding: '9px 0', borderRadius: 10, fontWeight: 700, fontSize: '0.8rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: 'Amiri, serif', transition: 'background 0.3s' }}>
          {added ? t('products.added') : <><FiShoppingCart size={13} /> {t('products.add_cart')}</>}
        </button>
      </div>
    </div>
  )
}