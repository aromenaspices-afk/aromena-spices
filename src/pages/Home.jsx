import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useCollection } from '../hooks/useFirestore'
import { useSettings } from '../hooks/useSettings'
import Ticker from '../components/Ticker'
import ShareButton from '../components/ShareButton'
import ImageLightbox from '../components/ImageLightbox'
import {
  FiShoppingCart, FiArrowLeft, FiArrowRight,
  FiChevronLeft, FiChevronRight,
  FiDroplet, FiGlobe, FiTruck, FiHeart,
  FiPackage, FiCheck
} from 'react-icons/fi'
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useCurrency } from '../context/CurrencyContext'

const WHY = [
  { icon: <FiDroplet size={22} />, title_ar: '100% طبيعي', title_en: '100% Natural', desc_ar: 'بدون مواد حافظة أو إضافات صناعّية', desc_en: 'No preservatives or artificial additives' },
  { icon: <FiGlobe size={22} />, title_ar: 'من أجود المصادر', title_en: 'Premium Sources', desc_ar: 'بهارات مختارة من أفضل مناطق العالم', desc_en: 'Spices from the finest regions worldwide' },
  { icon: <FiTruck size={22} />, title_ar: 'شحن سريع', title_en: 'Fast Shipping', desc_ar: 'توصيل لأوروبّا والخليج وتركيّا', desc_en: 'Delivery to Europe, Gulf & Turkey' },
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
  const [addedPkg, setAddedPkg] = useState(null)
  const [lightbox, setLightbox] = useState(null) // { images, index }
  const packagesUrl = `${window.location.origin}/packages`

  function handleAddPackage(pkg) {
    const pd = calcDiscount(pkg.price, pkg.discount, pkg.discountExpiry)
    const pkgProducts = (pkg.items || []).map(slug => products.find(p => p.slug === slug)).filter(Boolean)
    addItem({
      id:          `pkg_${pkg.id}`,
      productId:   pkg.id,
      isPackage:   true,
      name:        isAr ? pkg.name_ar : pkg.name_en,
      size:        isAr ? `${pkgProducts.length} منتج` : `${pkgProducts.length} items`,
      price:       pd.final,
      image:       pkg.images?.[0] || pkg.image || null,
      weightKg:    pkg.weightKg || 0.6,
      pkgItems:    pkgProducts.map(p => ({
        name:  isAr ? p.name_ar : p.name_en,
        image: p.images?.[0] || p.image || null,
      })),
    })
    setAddedPkg(pkg.id)
    setTimeout(() => setAddedPkg(null), 2000)
  }
  const [sliderIdx, setSliderIdx] = useState(0)
  const sliderRef = useRef(null)
  const touchStartX = useRef(null)
  const sliderImages = settings?.slider_images || []

  const [banIdx, setBanIdx] = useState(0)
  const banTouchX = useRef(null)
  const BANNER_COUNT = 4

  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  useEffect(() => {
    if (sliderImages.length <= 1) return
    const interval = setInterval(() => setSliderIdx(i => (i + 1) % sliderImages.length), 4000)
    return () => clearInterval(interval)
  }, [sliderImages.length])

  useEffect(() => {
    const interval = setInterval(() => setBanIdx(i => (i + 1) % BANNER_COUNT), 5500)
    return () => clearInterval(interval)
  }, [])

  function sliderPrev() { setSliderIdx(i => (i - 1 + sliderImages.length) % sliderImages.length) }
  function sliderNext() { setSliderIdx(i => (i + 1) % sliderImages.length) }
  function handleTouchStart(e) { touchStartX.current = e.touches[0].clientX }
  function handleTouchEnd(e) {
    if (!touchStartX.current) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) { diff > 0 ? sliderNext() : sliderPrev() }
    touchStartX.current = null
  }

  function banPrev() { setBanIdx(i => (i - 1 + BANNER_COUNT) % BANNER_COUNT) }
  function banNext() { setBanIdx(i => (i + 1) % BANNER_COUNT) }
  function banTouchStart(e) { banTouchX.current = e.touches[0].clientX }
  function banTouchEnd(e) {
    if (!banTouchX.current) return
    const diff = banTouchX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) { diff > 0 ? banNext() : banPrev() }
    banTouchX.current = null
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
              <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)', fontWeight: 900, color: '#fff', lineHeight: 1.25, marginBottom: 16, fontFamily: 'Tajawal, sans-serif' }}>
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

      {/* ═══ بنرات إعلانية ═══ */}
      <section style={{ background: '#F5E6D3', padding: 'clamp(28px, 4vw, 48px) 20px' }}>
        <div
          onTouchStart={banTouchStart}
          onTouchEnd={banTouchEnd}
          className="ban-track"
          dir={isAr ? 'rtl' : 'ltr'}
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.7s ease' }}
        >

          {/* البنر الرابع — صمّم باقتك الخاصّة */}
          <div className={`banner b4 ${banIdx === 3 ? 'active' : ''}`} id="b4">
            <div className="ornament-corner ornament-tl"></div>
            <div className="ornament-corner ornament-br"></div>
            <div className="ban-content">
              <div className="layout">
                <div className="left">
                  <span className="small-tag">{isAr ? '— باقة مخصّصة' : '— Custom Box'}</span>
                  <h2>{isAr ? <>صمّم باقتكَ <span className="accent">الخاصّة</span></> : <>Build Your <span className="accent">Own Box</span></>}</h2>
                  <p>{isAr ? 'اختر 4 خلطات بهارات من تشكيلتنا الفاخرة، نغلّفها لك بعناية في تغليفٍ أنيق — هديّة مثاليّة لمن تحبّ.' : 'Choose 4 spice blends from our premium collection, carefully wrapped in elegant packaging — a perfect gift for someone you love.'}</p>
                  <div className="boxes">
                    <div className="box-item">{isAr ? '4 خلطات مختارة' : '4 Selected Blends'}</div>
                    <div className="box-item">{isAr ? 'تغليف فاخر' : 'Luxury Packaging'}</div>
                    <div className="box-item">{isAr ? 'هديّة مثاليّة' : 'Perfect Gift'}</div>
                  </div>
                </div>
                <div className="right-vase">
                  <div className="vase-content">
                    <div className="num">4</div>
                    <div className="lbl">{isAr ? 'خلطات' : 'Blends'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* البنر الأول — افتتاح المتجر */}
          <div className={`banner b1 ${banIdx === 0 ? 'active' : ''}`} id="b1">
            <div className="ornament-corner ornament-tl"></div>
            <div className="ornament-corner ornament-br"></div>
            <div className="ban-content">
              <div className="top-row">
                <div className="ar-brand">
                  <svg className="ar-brand-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2 C 8 8, 8 14, 12 18 C 16 14, 16 8, 12 2 Z" fill="#c9a961" opacity="0.9"></path>
                    <path d="M7 12 C 5 16, 5 19, 7 21 C 9 19, 9 16, 7 12 Z" fill="#c9a961" opacity="0.7"></path>
                    <path d="M17 12 C 15 16, 15 19, 17 21 C 19 19, 19 16, 17 12 Z" fill="#c9a961" opacity="0.7"></path>
                  </svg>
                  <span className="ar-brand-name">AROMENA</span>
                  <span className="ar-brand-tag">SPICES</span>
                </div>
                <div className="opening-badge">{isAr ? 'افتتاح المتجر' : 'Store Opening'}</div>
              </div>
              <div className="main-row">
                <div className="text-block">
                  <h2>{isAr ? <>النّكهة الأصلية<br /><span className="accent">أصبحت بين يديك</span></> : <>Authentic Flavor<br /><span className="accent">Now in Your Hands</span></>}</h2>
                  <p>{isAr ? 'تشكيلة فاخرة من خلطات البهارات الأصلية، تُحضّر بعناية واحترافية' : 'A premium collection of authentic spice blends, crafted with care and expertise'}</p>
                  <div className="promo-tag">
                    <strong>15%</strong>
                    <span>{isAr ? <>خصم ترحيبي<br />كوبون WELCOME15</> : <>Welcome Discount<br />Coupon WELCOME15</>}</span>
                  </div>
                </div>
                <div className="right-mark">
                  <div className="digit">12</div>
                  <div className="digit-label">{isAr ? 'خلطة أصيلة' : 'Authentic Blends'}</div>
                  <div className="gold-line"></div>
                  <div className="url-mini">aromena.com.tr</div>
                </div>
              </div>
            </div>
          </div>

          {/* البنر الثاني — لماذا أرومينا */}
          <div className={`banner b2 ${banIdx === 1 ? 'active' : ''}`} id="b2">
            <div className="ornament-corner ornament-tl"></div>
            <div className="ornament-corner ornament-br"></div>
            <div className="ban-content">
              <div className="layout">
                <div className="left">
                  <span className="small-tag">{isAr ? '— لماذا أرومينا' : '— Why Aromena'}</span>
                  <h2>{isAr ? <>الجّودة في <span className="accent">كلّ رشّة</span></> : <>Quality in <span className="accent">Every Pinch</span></>}</h2>
                  <p>{isAr ? 'مكوّنات طبيعيّة من مصادرها الأصليّة، خلطات مُتقنة بوصفات مدروسة، وتنوّع استثنائي من المطبخ الخليجي إلى التّركي والإيطالي.' : 'Natural ingredients from their origins, expertly crafted recipes, and an exceptional variety from Gulf to Turkish and Italian cuisine.'}</p>
                  <div className="boxes">
                    <div className="box-item">{isAr ? 'طبيعي 100%' : '100% Natural'}</div>
                    <div className="box-item">{isAr ? 'بدون حافظ' : 'No Preservatives'}</div>
                    <div className="box-item">{isAr ? 'شحن سريع' : 'Fast Shipping'}</div>
                  </div>
                </div>
                <div className="right-vase">
                  <div className="vase-content">
                    <div className="num">100%</div>
                    <div className="lbl">{isAr ? 'طبيعي' : 'Natural'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* البنر الثالث — المجموعة الكاملة */}
          <div className={`banner b3 ${banIdx === 2 ? 'active' : ''}`} id="b3">
            <div className="ornament-corner ornament-tl"></div>
            <div className="ornament-corner ornament-br"></div>
            <div className="ban-content">
              <div className="layout">
                <div className="bottles-mock">
                  <div className="bottle"></div>
                  <div className="bottle"></div>
                  <div className="bottle"></div>
                  <div className="bottle"></div>
                </div>
                <div className="right-content">
                  <span className="new-pill">{isAr ? 'جديد · 2026' : 'New · 2026'}</span>
                  <h2>{isAr ? <>مجموعة <span className="gold">أرومينا</span> الكاملة</> : <>The Complete <span className="gold">Aromena</span> Collection</>}</h2>
                  <p className="desc">{isAr ? '12 خلطة بهارات أصيلة + 3 بوكسات هدايا فاخرة — تشكيلة بهارات مختلفة حول العالم.' : '12 authentic spice blends + 3 premium gift boxes — a diverse spice selection from around the world.'}</p>
                  <div className="num-row">
                    <div><strong>12</strong><span>{isAr ? 'خلطة' : 'Blends'}</span></div>
                    <div><strong>3</strong><span>{isAr ? 'بوكسات' : 'Boxes'}</span></div>
                    <div><strong>$4+</strong><span>{isAr ? 'تبدأ من' : 'Starts at'}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* أزرار التنقل */}
          <button onClick={banPrev} className="ban-nav ban-nav-next" aria-label="prev"><FiChevronRight size={18} /></button>
          <button onClick={banNext} className="ban-nav ban-nav-prev" aria-label="next"><FiChevronLeft size={18} /></button>
          <div className="ban-dots">
            {[0, 1, 2, 3].map(idx => (
              <button key={idx} onClick={() => setBanIdx(idx)} className={banIdx === idx ? 'dot active' : 'dot'} aria-label={`banner ${idx + 1}`} />
            ))}
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
                  <p style={{ color: '#9C6B4E', fontSize: '0.75rem' }}>{isAr ? 'مؤسِّسة أرومينا' : 'Founder of Aromena'}</p>
                </div>
              </div>
            </div>
            <div>
              <div style={{ display: 'inline-block', background: 'rgba(123,25,44,0.1)', border: '1px solid rgba(123,25,44,0.2)', color: '#7b192c', padding: '5px 16px', borderRadius: 50, fontSize: '0.8rem', fontWeight: 600, marginBottom: 16 }}>
                {isAr ? 'قِصَّة الشِّيف' : 'Chef\'s Story'}
              </div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: '#3E1C00', fontFamily: 'Tajawal, sans-serif', marginBottom: 6, lineHeight: 1.3 }}>
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
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: '#3E1C00', fontFamily: 'Tajawal, sans-serif', marginBottom: 4 }}>{t('home.featured')}</h2>
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
                <div style={{ fontSize: 'clamp(1.4rem, 4vw, 2.4rem)', fontWeight: 900, color: '#f4be69', marginBottom: 4, fontFamily: 'Tajawal, sans-serif' }}>{s.num}</div>
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
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: '#3E1C00', fontFamily: 'Tajawal, sans-serif', marginBottom: 10 }}>
              {isAr ? 'باقاتنا المُميّزة' : 'Our Packages'}
            </h2>
            <p style={{ color: '#9c6b4e', fontSize: '0.95rem' }}>
              {isAr ? '3 باقات جاهزة أو صمّم باقتك الخاصّة' : '3 ready packages or build your own'}
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'stretch', marginBottom: 24 }}>
            {packages.map((pkg, i) => {
              const pkgProducts = (pkg.items || []).map(slug => products.find(p => p.slug === slug)).filter(Boolean)
              const isAdded     = addedPkg === pkg.id
              const pkgName     = isAr ? pkg.name_ar : pkg.name_en
              const pkgImg      = pkg.images?.[0] || pkg.image || null
              const pkgImgs     = pkg.images?.length ? pkg.images : (pkg.image ? [pkg.image] : [])
              const pd          = calcDiscount(pkg.price, pkg.discount, pkg.discountExpiry)

              return (
                <div key={pkg.id || i} style={{
                  background: '#fff', borderRadius: 22, border: '1px solid #E2C9A8',
                  boxShadow: '0 4px 24px rgba(123,25,44,0.07)', overflow: 'hidden',
                  transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease',
                  display: 'flex', flexDirection: 'column',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 48px rgba(123,25,44,0.15)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(123,25,44,0.07)' }}
                >
                  {/* الصورة */}
                  <div style={{ position: 'relative', height: 260, flexShrink: 0, overflow: 'hidden', borderRadius: '22px 22px 0 0', background: '#fdf0f2' }}>
                    {pkgImg
                      ? <img src={pkgImg} alt={pkgName} onClick={() => setLightbox({ images: pkgImgs, index: 0 })} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>{pkg.emoji || '🎁'}</div>
                    }
                    {pd.has && (
                      <div style={{
                        position: 'absolute', top: 14, right: isAr ? 'auto' : 14, left: isAr ? 14 : 'auto',
                        width: 54, height: 54, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f4be69, #e09d30)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.25)', zIndex: 3, border: '2px solid rgba(255,255,255,0.4)',
                      }}>
                        <span style={{ color: '#7b192c', fontSize: '0.6rem', fontWeight: 800, lineHeight: 1 }}>{isAr ? 'خصم' : 'SALE'}</span>
                        <span style={{ color: '#7b192c', fontSize: '0.85rem', fontWeight: 900, lineHeight: 1 }}>{pd.pct}%</span>
                      </div>
                    )}
                    {pkg.tag_ar && (
                      <div style={{
                        position: 'absolute', top: 14, left: isAr ? 'auto' : 14, right: isAr ? 14 : 'auto',
                        background: 'linear-gradient(to left, #7b192c, #a82040)',
                        color: '#f4be69', fontSize: '0.68rem', fontWeight: 700,
                        padding: '4px 12px', borderRadius: 50, zIndex: 3,
                      }}>
                        {isAr ? pkg.tag_ar : pkg.tag_en}
                      </div>
                    )}
                  </div>

                  {/* المحتوى */}
                  <div style={{ padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ color: '#3E1C00', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Tajawal, sans-serif', margin: 0, marginBottom: 2 }}>{pkgName}</h3>
                        {pkg.name_en && isAr && <p style={{ color: '#9C6B4E', fontSize: '0.75rem', margin: 0 }}>{pkg.name_en}</p>}
                      </div>
                      <ShareButton url={`${packagesUrl}#${pkg.id}`} title={isAr ? `${pkgName} — أرومينا` : `${pkgName} — Aromena`} isAr={isAr} size="small" />
                    </div>

                    {(isAr ? pkg.desc_ar : pkg.desc_en) && <p style={{ color: '#6B3A2A', fontSize: '0.83rem', lineHeight: 1.7, marginBottom: 14 }}>{isAr ? pkg.desc_ar : pkg.desc_en}</p>}

                    <div style={{ height: 1, background: 'linear-gradient(to right, #E2C9A8, transparent)', marginBottom: 14 }} />

                    {pkgProducts.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <p style={{ color: '#3E1C00', fontWeight: 700, fontSize: '0.82rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <FiPackage size={12} color="#7b192c" />
                          {isAr ? `المحتوى (${pkgProducts.length} منتج)` : `Contents (${pkgProducts.length} items)`}
                        </p>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                          {pkgProducts.map(p => (
                            <div key={p.slug} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 70 }}>
                              <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', border: '2px solid #E2C9A8', background: '#fdf0f2', flexShrink: 0 }}>
                                {(p.images?.[0] || p.image)
                                  ? <img src={p.images?.[0] || p.image} alt={isAr ? p.name_ar : p.name_en} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiPackage size={22} color="#9C6B4E" /></div>
                                }
                              </div>
                              <span style={{ fontSize: '0.7rem', color: '#6B3A2A', fontWeight: 600, textAlign: 'center', width: '100%', lineHeight: 1.4, wordBreak: 'break-word' }}>
                                {isAr ? p.name_ar : p.name_en}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ marginBottom: 14, marginTop: 'auto' }}>
                      {pd.has ? (
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                          <span style={{ color: '#DC2626', fontWeight: 900, fontSize: '1.6rem', fontFamily: 'Tajawal, sans-serif' }}>{formatPrice(pd.final)}</span>
                          <span style={{ color: '#9C6B4E', textDecoration: 'line-through', fontSize: '0.92rem' }}>{formatPrice(pkg.price)}</span>
                        </div>
                      ) : (
                        <span style={{ color: '#7b192c', fontWeight: 900, fontSize: '1.6rem', fontFamily: 'Tajawal, sans-serif' }}>{formatPrice(pkg.price)}</span>
                      )}
                      <p style={{ color: '#9C6B4E', fontSize: '0.72rem', marginTop: 2 }}>{isAr ? 'شامل الشّحن' : 'incl. shipping'}</p>
                    </div>

                    <button onClick={() => handleAddPackage(pkg)} style={{
                      width: '100%', background: isAdded ? '#16A34A' : 'linear-gradient(to left, #7b192c, #a82040)',
                      color: '#f4be69', padding: '13px 0', borderRadius: 12, fontWeight: 700, fontSize: '0.92rem',
                      border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      fontFamily: 'Tajawal, sans-serif', transition: 'all 0.3s',
                      boxShadow: isAdded ? 'none' : '0 4px 16px rgba(123,25,44,0.25)',
                    }}>
                      {isAdded
                        ? <><FiCheck size={16} /> {isAr ? 'تمت الإضافة!' : 'Added!'}</>
                        : <><FiShoppingCart size={16} /> {isAr ? 'أضف للسّلّة' : 'Add to Cart'}</>
                      }
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ═══ بنر تصميم الباقة الخاصّة (تحت الباقات) ═══ */}
          <Link
            to="/packages#custom-box"
            dir={isAr ? 'rtl' : 'ltr'}
            className="custom-box-banner"
          >
            <div className="cbb-glow" />
            <div className="cbb-text">
              <span className="cbb-eyebrow">{isAr ? 'باقة مخصّصة' : 'Custom Box'}</span>
              <h3 className="cbb-title">{isAr ? 'صمّم باقتكَ الخاصّة' : 'Build Your Own Box'}</h3>
              <p className="cbb-desc">
                {isAr
                  ? 'اختر 4 خلطات من تشكيلتنا الفاخرة، بتغليف أنيق وهديّة مثاليّة لمن تحبّ.'
                  : 'Pick 4 blends from our premium selection, in elegant packaging — a perfect gift.'}
              </p>
              <div className="cbb-features">
                <span>{isAr ? '4 خلطات مختارة' : '4 Selected Blends'}</span>
                <span>{isAr ? 'تغليف فاخر' : 'Luxury Packaging'}</span>
                <span>{isAr ? 'هديّة مثاليّة' : 'Perfect Gift'}</span>
              </div>
            </div>
            <span className="cbb-cta">
              {isAr ? 'اطلب الآن' : 'Order Now'}
              <span className="cbb-arrow">{isAr ? '←' : '→'}</span>
            </span>
          </Link>

        </div>
      </section>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* ===== Custom box CTA banner (under packages) ===== */
        .custom-box-banner {
          display: flex; align-items: center; justify-content: space-between; gap: 28px;
          width: 100%; margin-top: 24px; padding: clamp(26px, 3.4vw, 40px) clamp(28px, 4vw, 52px);
          position: relative; overflow: hidden; text-decoration: none;
          border-radius: 22px;
          background:
            radial-gradient(60% 80% at 78% 50%, rgba(168,32,64,0.55) 0%, transparent 60%),
            linear-gradient(105deg, #3d0d18 0%, #5e1322 48%, #7a1a2e 100%);
          border: 1px solid rgba(201,169,97,0.22);
          box-shadow: 0 24px 60px rgba(0,0,0,0.4);
          transition: transform 0.35s ease, box-shadow 0.35s ease;
        }
        .custom-box-banner:hover { transform: translateY(-4px); box-shadow: 0 30px 70px rgba(0,0,0,0.5); }
        .cbb-glow {
          position: absolute; inset-inline-end: -60px; top: -60px; width: 260px; height: 260px;
          background: radial-gradient(circle, rgba(201,169,97,0.22) 0%, transparent 70%);
          pointer-events: none;
        }
        .cbb-text { position: relative; z-index: 1; text-align: start; }
        .cbb-eyebrow {
          display: inline-block; font-family: 'Tajawal', sans-serif; font-size: 0.78rem; font-weight: 700;
          color: #c9a961; background: rgba(201,169,97,0.14); border: 1px solid rgba(201,169,97,0.35);
          padding: 4px 14px; border-radius: 50px; margin-bottom: 12px; letter-spacing: 0.3px;
        }
        .cbb-title {
          font-family: 'Tajawal', sans-serif; font-size: clamp(1.4rem, 3vw, 2rem); font-weight: 800;
          color: #fdf3e3; margin: 0 0 10px;
        }
        .cbb-desc {
          font-family: 'Tajawal', sans-serif; color: #e8cfa6; font-size: clamp(0.9rem, 1.5vw, 1.02rem);
          line-height: 1.7; max-width: 560px; margin: 0 0 16px;
        }
        .cbb-features { display: flex; flex-wrap: wrap; gap: 10px; }
        .cbb-features span {
          font-family: 'Tajawal', sans-serif; font-size: 0.82rem; font-weight: 700; color: #f3dcb4;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(201,169,97,0.30);
          padding: 6px 16px; border-radius: 50px;
        }
        .cbb-cta {
          position: relative; z-index: 1; flex-shrink: 0;
          display: inline-flex; align-items: center; gap: 10px;
          font-family: 'Tajawal', sans-serif; font-size: 1.02rem; font-weight: 800; color: #5e1322;
          background: linear-gradient(135deg, #e6cd92, #c9a961);
          padding: 15px 34px; border-radius: 14px; white-space: nowrap;
          box-shadow: 0 8px 22px rgba(0,0,0,0.30);
          transition: gap 0.3s ease;
        }
        .custom-box-banner:hover .cbb-cta { gap: 16px; }
        .cbb-arrow { font-size: 1.15rem; line-height: 1; }
        @media (max-width: 720px) {
          .custom-box-banner { flex-direction: column; align-items: stretch; text-align: center; gap: 20px; }
          .cbb-text { text-align: center; }
          .cbb-desc { max-width: none; }
          .cbb-features { justify-content: center; }
          .cbb-cta { justify-content: center; }
        }

        /* ===== Advertising banner slider ===== */
        .ban-track { position: relative; width: 100%; max-width: 1180px; margin: 0 auto; height: clamp(380px, 44vw, 440px); }
        .banner {
          position: absolute; inset: 0; opacity: 0; pointer-events: none;
          transition: opacity 0.8s ease;
          border-radius: 24px; overflow: hidden;
          background:
            radial-gradient(60% 80% at 78% 50%, rgba(168,32,64,0.55) 0%, transparent 60%),
            linear-gradient(105deg, #3d0d18 0%, #5e1322 48%, #7a1a2e 100%);
          border: 1px solid rgba(201,169,97,0.22);
          box-shadow: 0 24px 60px rgba(0,0,0,0.4);
        }
        .banner.active { opacity: 1; pointer-events: auto; }
        /* زخارف الأوراق الخافتة في الخلفية */
        .banner::before, .banner::after {
          content: ''; position: absolute; z-index: 0; border-radius: 50% 0 50% 50%;
          background: rgba(201,169,97,0.05);
        }
        .banner::before { width: 130px; height: 130px; top: 30%; right: 30%; transform: rotate(35deg); }
        .banner::after { width: 90px; height: 90px; bottom: 18%; right: 44%; transform: rotate(-20deg); }

        .ornament-corner { position: absolute; width: 50px; height: 50px; border: 2px solid rgba(201,169,97,0.55); z-index: 3; }
        .ornament-tl { top: 18px; right: 18px; border-left: none; border-bottom: none; border-top-right-radius: 8px; }
        .ornament-br { bottom: 18px; left: 18px; border-right: none; border-top: none; border-bottom-left-radius: 8px; }

        .ban-content { position: relative; z-index: 2; height: 100%; padding: clamp(22px, 3.6vw, 40px) clamp(58px, 6vw, 72px); display: flex; flex-direction: column; color: #f3e3cf; }

        /* Banner 1 */
        .top-row { display: flex; justify-content: space-between; align-items: flex-start; }
        .ar-brand { display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .ar-brand-icon { width: 22px; height: 22px; margin-bottom: 2px; }
        .ar-brand-name { font-family: 'Tajawal', sans-serif; font-weight: 900; letter-spacing: 5px; color: #d6b36a; font-size: 1.05rem; }
        .ar-brand-tag { font-size: 0.52rem; letter-spacing: 5px; color: rgba(214,179,106,0.65); }
        .opening-badge { background: #c9a961; color: #5e1322; padding: 8px 20px; border-radius: 8px; font-size: 0.82rem; font-weight: 800; box-shadow: 0 4px 14px rgba(201,169,97,0.3); }
        .main-row { flex: 1; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
        .text-block { text-align: start; }
        .text-block h2 { font-family: 'Tajawal', sans-serif; font-size: clamp(1.7rem, 4.2vw, 3rem); font-weight: 900; line-height: 1.25; margin-bottom: 14px; color: #f6ecdc; }
        .text-block .accent { color: #d6b36a; font-style: italic; }
        .text-block p { color: rgba(243,227,207,0.72); font-size: clamp(0.82rem, 1.5vw, 0.98rem); max-width: 430px; margin: 0 0 18px; margin-inline-end: auto; line-height: 1.8; }
        .promo-tag { display: inline-flex; align-items: center; gap: 12px; background: rgba(201,169,97,0.08); border: 1px solid rgba(201,169,97,0.3); padding: 10px 18px; border-radius: 12px; }
        .promo-tag strong { font-size: 1.8rem; font-weight: 900; color: #d6b36a; font-family: 'Tajawal', sans-serif; }
        .promo-tag span { font-size: 0.72rem; color: rgba(243,227,207,0.82); line-height: 1.5; text-align: start; }
        .right-mark { flex-shrink: 0; text-align: center; border: 1px solid rgba(201,169,97,0.35); border-radius: 16px; padding: clamp(18px, 3vw, 30px) clamp(20px, 3.2vw, 34px); }
        .right-mark .digit { font-family: 'Tajawal', sans-serif; font-size: clamp(2.4rem, 6.5vw, 4.2rem); font-weight: 900; color: #d6b36a; line-height: 1; }
        .right-mark .digit-label { color: rgba(243,227,207,0.7); font-size: 0.82rem; margin-top: 6px; }
        .right-mark .gold-line { width: 56px; height: 1px; background: linear-gradient(90deg, transparent, #c9a961, transparent); margin: 14px auto; }
        .right-mark .url-mini { font-size: 0.68rem; letter-spacing: 1px; color: rgba(214,179,106,0.6); }

        /* Banner 2 + 4 */
        .layout { flex: 1; display: flex; align-items: center; gap: 34px; }
        .b2 .left, .b4 .left { flex: 1; text-align: start; }
        .small-tag { color: #d6b36a; font-size: 0.84rem; font-weight: 600; letter-spacing: 1px; }
        .b2 h2, .b4 h2 { font-family: 'Tajawal', sans-serif; font-size: clamp(1.7rem, 4.2vw, 3rem); font-weight: 900; margin: 10px 0 14px; color: #f6ecdc; }
        .b2 .accent, .b4 .accent { color: #d6b36a; }
        .b2 p, .b4 p { color: rgba(243,227,207,0.72); font-size: clamp(0.82rem, 1.5vw, 0.98rem); line-height: 1.9; max-width: 480px; margin-bottom: 22px; }
        .boxes { display: flex; gap: 12px; flex-wrap: wrap; }
        .box-item { background: rgba(201,169,97,0.08); border: 1px solid rgba(201,169,97,0.35); color: #d6b36a; padding: 9px 20px; border-radius: 50px; font-size: 0.82rem; font-weight: 700; }
        .right-vase { flex-shrink: 0; width: clamp(130px, 19vw, 200px); height: clamp(130px, 19vw, 200px); border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, #e6cd92 0%, #cda85f 45%, #b08c45 100%);
          box-shadow: 0 18px 44px rgba(0,0,0,0.35), inset -8px -10px 26px rgba(120,90,30,0.5), inset 6px 8px 22px rgba(255,244,214,0.45);
          display: flex; align-items: center; justify-content: center; }
        .vase-content { text-align: center; }
        .vase-content .num { font-family: 'Tajawal', sans-serif; font-size: clamp(1.9rem, 5vw, 3rem); font-weight: 900; color: #5e1322; }
        .vase-content .lbl { color: rgba(94,19,34,0.8); font-size: 0.92rem; font-weight: 700; }

        /* Banner 3 */
        .b3 .layout { gap: 40px; }
        .bottles-mock { display: flex; gap: 12px; align-items: flex-end; flex-shrink: 0; padding-top: 14px; }
        .bottle { width: clamp(28px, 4.2vw, 50px); border-radius: 6px 6px 4px 4px;
          background: linear-gradient(to top, #b08c45 0%, #d6b36a 55%, #e6cd92 100%);
          box-shadow: inset -4px 0 8px rgba(120,90,30,0.4), inset 4px 0 8px rgba(255,244,214,0.3);
          position: relative; }
        .bottle::before { content: ''; position: absolute; top: -10px; left: 50%; transform: translateX(-50%); width: 70%; height: 10px; background: #2f6b3d; border-radius: 3px 3px 0 0; box-shadow: 0 -2px 0 #245430; }
        .b3 .bottle:nth-child(1) { height: 76px; }
        .b3 .bottle:nth-child(2) { height: 112px; }
        .b3 .bottle:nth-child(3) { height: 94px; }
        .b3 .bottle:nth-child(4) { height: 64px; }
        .right-content { flex: 1; text-align: start; }
        .new-pill { display: inline-block; background: #c9a961; color: #5e1322; padding: 5px 16px; border-radius: 50px; font-size: 0.74rem; font-weight: 800; letter-spacing: 1px; margin-bottom: 12px; }
        .b3 h2 { font-family: 'Tajawal', sans-serif; font-size: clamp(1.7rem, 4.2vw, 3rem); font-weight: 900; margin-bottom: 12px; color: #f6ecdc; }
        .b3 .gold { color: #d6b36a; }
        .b3 .desc { color: rgba(243,227,207,0.72); font-size: clamp(0.82rem, 1.5vw, 0.98rem); line-height: 1.9; max-width: 480px; margin: 0 0 22px; margin-inline-end: auto; }
        .num-row { display: flex; gap: 34px; justify-content: flex-start; }
        .num-row > div { text-align: center; }
        .num-row strong { display: block; font-family: 'Tajawal', sans-serif; font-size: clamp(1.6rem, 4vw, 2.6rem); font-weight: 900; color: #d6b36a; }
        .num-row span { color: rgba(243,227,207,0.7); font-size: 0.8rem; }

        /* Nav + dots */
        .ban-nav { position: absolute; top: 50%; transform: translateY(-50%); width: 38px; height: 38px; border-radius: 50%; background: rgba(26,6,16,0.5); border: 1px solid rgba(201,169,97,0.35); color: #d6b36a; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 5; transition: background 0.2s; }
        .ban-nav:hover { background: rgba(123,25,44,0.9); }
        .ban-nav-next { right: 14px; }
        .ban-nav-prev { left: 14px; }
        .ban-dots { position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); display: flex; gap: 7px; z-index: 5; }
        .ban-dots .dot { width: 8px; height: 8px; border-radius: 50px; background: rgba(201,169,97,0.35); border: none; cursor: pointer; padding: 0; transition: all 0.3s; }
        .ban-dots .dot.active { width: 22px; background: #d6b36a; }

        @media (max-width: 680px) {
          .ban-track { height: 540px; }
          .ban-content { padding: clamp(22px, 4vw, 36px); }
          .ban-nav { display: none; }
          .main-row, .layout { flex-direction: column; align-items: center; gap: 18px; text-align: center; }
          .text-block, .b2 .left, .b4 .left, .right-content { text-align: center; }
          .text-block p, .b3 .desc { margin-left: auto; margin-right: auto; }
          .num-row { justify-content: center; gap: 22px; }
          .b3 .layout { flex-direction: column-reverse; }
        }
      `}</style>

      {lightbox && (
        <ImageLightbox images={lightbox.images} startIndex={lightbox.index} onClose={() => setLightbox(null)} />
      )}
    </div>
  )
}

function calcDiscount(price, discount, expiry) {
  if (!discount || discount <= 0) return { final: price, has: false }
  if (expiry && new Date(expiry) < new Date()) return { final: price, has: false }
  return { final: Math.round(price * (1 - discount / 100) * 100) / 100, has: true, pct: discount }
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
  const disc = firstSize ? calcDiscount(firstSize.price, product.discount, product.discountExpiry) : { final: 0, has: false }

  useEffect(() => { setTimeout(() => setVisible(true), delay) }, [delay])

  function handleAdd() {
    if (!firstSize) return
    addItem({
      id: `${product.slug || product.id}_${firstSize.label}`,
      productId: product.slug || product.id,
      name, size: firstSize.label, price: disc.has ? disc.final : firstSize.price,
      image: product.images?.[0] || product.image || null,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid #E2C9A8', boxShadow: '0 4px 18px rgba(62,28,0,0.07)', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
      <Link to={`/products/${product.slug}`}>
        <div style={{ height: 155, overflow: 'hidden', background: `linear-gradient(135deg, ${product.color}18, ${product.color}38)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {(product.images?.[0] || product.image)
            ? <img src={product.images?.[0] || product.image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <FiShoppingCart size={40} color={product.color || '#E2C9A8'} />
          }
          {disc.has && (
            <span style={{
              position: 'absolute', top: 8,
              left: isAr ? 'auto' : 8, right: isAr ? 8 : 'auto',
              background: '#DC2626', color: '#fff',
              fontSize: '0.65rem', padding: '3px 9px', borderRadius: 50, fontWeight: 700,
            }}>-{disc.pct}%</span>
          )}
        </div>
      </Link>
      <div style={{ padding: '14px 12px' }}>
        <Link to={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
          <h3 style={{ color: '#3E1C00', fontSize: '0.95rem', fontWeight: 700, marginBottom: 4 }}>{name}</h3>
        </Link>
        <p style={{ color: '#9C6B4E', fontSize: '0.75rem', marginBottom: 4 }}>{origin}</p>
        {firstSize && (
          disc.has
            ? <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
                <span style={{ color: '#9C6B4E', textDecoration: 'line-through', fontSize: '0.72rem' }}>{formatPrice(firstSize.price)}</span>
                <span style={{ color: '#DC2626', fontWeight: 900, fontSize: '0.92rem' }}>{formatPrice(disc.final)}</span>
                <span style={{ background: '#DC2626', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '2px 6px', borderRadius: 50 }}>-{disc.pct}%</span>
              </div>
            : <p style={{ color: '#7b192c', fontWeight: 700, fontSize: '0.85rem', marginBottom: 10 }}>
                {isAr ? 'من' : 'from'} {formatPrice(firstSize.price)}
              </p>
        )}
        <button onClick={handleAdd} style={{ width: '100%', background: added ? '#16A34A' : 'linear-gradient(to left, #7b192c, #a82040)', color: added ? '#fff' : '#f4be69', padding: '9px 0', borderRadius: 10, fontWeight: 700, fontSize: '0.8rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: 'Tajawal, sans-serif', transition: 'background 0.3s' }}>
          {added ? t('products.added') : <><FiShoppingCart size={13} /> {t('products.add_cart')}</>}
        </button>
      </div>
    </div>
  )
}