import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCollection } from '../hooks/useFirestore'
import { useCurrency } from '../context/CurrencyContext'
import { useCart } from '../context/CartContext'
import { FiShoppingCart, FiCheck, FiArrowLeft, FiStar } from 'react-icons/fi'

const LOGO = 'https://res.cloudinary.com/dvt0nntn7/image/upload/v1775408607/02_fwrhni.png'
const CHEF_PHOTO = 'https://res.cloudinary.com/dvt0nntn7/image/upload/v1775408607/02_fwrhni.png'

// ═══ Hook للـ Intersection Observer ═══
function useVisible(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

// ═══ مكوّن الكارد المنتج ═══
function ProductCard({ p, isAr, formatPrice, addItem, t }) {
  const [added, setAdded] = useState(false)
  const [ref, visible] = useVisible()
  const name = isAr ? p.name_ar : p.name_en
  const firstSize = p.sizes?.[0] || Object.entries(p.prices || {})[0]
  const price = firstSize?.price || firstSize?.[1] || 0

  function handleAdd() {
    if (!firstSize) return
    addItem({ id: `${p.slug}_${firstSize.label || firstSize[0]}`, productId: p.slug, name, size: firstSize.label || firstSize[0], price, image: p.images?.[0] || p.image || null })
    setAdded(true); setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div ref={ref} style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(244,190,105,0.2)', boxShadow: '0 8px 32px rgba(26,6,16,0.12)', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(40px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }}>
      <div style={{ height: 180, overflow: 'hidden', background: `linear-gradient(135deg, ${p.color || '#7b192c'}18, ${p.color || '#7b192c'}35)`, position: 'relative' }}>
        {(p.images?.[0] || p.image)
          ? <img src={p.images?.[0] || p.image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} onMouseEnter={e => e.target.style.transform = 'scale(1.05)'} onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiShoppingCart size={40} color={p.color || '#7b192c'} /></div>
        }
        {p.discount > 0 && <span style={{ position: 'absolute', top: 10, right: 10, background: 'linear-gradient(135deg, #DC2626, #ef4444)', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: 50 }}>-{p.discount}%</span>}
      </div>
      <div style={{ padding: '14px 16px' }}>
        <h3 style={{ color: '#1a0610', fontWeight: 700, fontSize: '0.95rem', marginBottom: 4, fontFamily: 'Amiri, serif' }}>{name}</h3>
        <p style={{ color: '#9C6B4E', fontSize: '0.8rem', marginBottom: 10 }}>{isAr ? p.desc_ar : p.desc_en}</p>
        {price > 0 && <p style={{ color: '#7b192c', fontWeight: 900, fontSize: '1rem', marginBottom: 10, fontFamily: 'Amiri, serif' }}>{formatPrice(price)}</p>}
        <button onClick={handleAdd} style={{ width: '100%', background: added ? '#16A34A' : 'linear-gradient(to left, #7b192c, #a82040)', color: '#f4be69', padding: '10px 0', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'Amiri, serif', transition: 'all 0.3s' }}>
          {added ? <><FiCheck size={14} /> {t('products.added')}</> : <><FiShoppingCart size={14} /> {t('products.add_cart')}</>}
        </button>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const { t, i18n } = useTranslation()
  const isAr = i18n.language === 'ar'
  const { data: products } = useCollection('products')
  const { data: packages } = useCollection('packages')
  const { formatPrice } = useCurrency()
  const { addItem } = useCart()
  const [heroVisible, setHeroVisible] = useState(false)
  const [count, setCount] = useState({ customers: 0, products: 0, countries: 0 })

  useEffect(() => { setTimeout(() => setHeroVisible(true), 100) }, [])

  // عداد الأرقام
  useEffect(() => {
    const targets = { customers: 500, products: 12, countries: 4 }
    const duration = 2000
    const steps = 60
    let step = 0
    const interval = setInterval(() => {
      step++
      setCount({ customers: Math.round((targets.customers * step) / steps), products: Math.round((targets.products * step) / steps), countries: Math.round((targets.countries * step) / steps) })
      if (step >= steps) clearInterval(interval)
    }, duration / steps)
    return () => clearInterval(interval)
  }, [])

  const featured = products.slice(0, 6)
  const [storyRef, storyVisible] = useVisible()
  const [statsRef, statsVisible] = useVisible()

  const keywords = isAr
    ? ['بهارات عربية', 'توابل فاخرة', 'بهارات مندي', 'بهارات كبسة', 'بهارات تركيا', 'بهارات أوروبا', 'بهارات طبيعية', 'توصيل ألمانيا']
    : ['Arab spices', 'halal spices', 'mandi spices', 'kabsa blend', 'Turkish spices', 'natural spices', 'spice delivery Europe']

  return (
    <div style={{ background: '#F5E6D3', minHeight: '100vh', fontFamily: 'Amiri, serif' }}>

      {/* SEO Keywords مخفية */}
      <div style={{ display: 'none' }} aria-hidden="true">
        {keywords.join(' — ')}
        {isAr ? 'أرومينا للبهارات — بهارات أصيلة — شحن لأوروبا والخليج وتركيا — بهارات حلال — توابل عربية فاخرة' : 'Aromena Spices — authentic Arab spices — shipping to Europe Gulf Turkey — halal spices premium'}
      </div>

      {/* ═══ HERO ═══ */}
      <section style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0d0308 0%, #1a0610 30%, #7b192c 70%, #a82040 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '80px 20px' }}>

        {/* زخارف خلفية */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '10%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,190,105,0.06) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: '15%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,32,64,0.3) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', top: '40%', left: '50%', width: 600, height: 1, background: 'linear-gradient(to right, transparent, rgba(244,190,105,0.08), transparent)', transform: 'translateX(-50%)' }} />
          {[...Array(20)].map((_, i) => (
            <div key={i} style={{ position: 'absolute', width: 2, height: 2, borderRadius: '50%', background: 'rgba(244,190,105,0.3)', top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`, animationDelay: `${Math.random() * 3}s` }} />
          ))}
        </div>

        <div style={{ maxWidth: 800, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* اللوغو */}
          <div style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(-20px)', transition: 'all 0.8s ease', marginBottom: 32 }}>
            <img src={LOGO} alt="Aromena Spices" style={{ height: 70, objectFit: 'contain', mixBlendMode: 'screen' }} />
          </div>

          {/* العنوان */}
          <div style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.9s ease 0.2s' }}>
            <p style={{ color: 'rgba(244,190,105,0.6)', fontSize: '0.85rem', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>
              {isAr ? 'بهارات أصيلة — شحن لأوروبا والخليج وتركيا' : 'Premium Spices — Shipping to Europe, Gulf & Turkey'}
            </p>
            <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)', color: '#f4be69', lineHeight: 1.2, marginBottom: 20 }}>
              {isAr ? 'عبق الشرق في كل قرصة بهار' : 'The Essence of the East in Every Pinch'}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
              <div style={{ width: 60, height: 1, background: 'rgba(244,190,105,0.4)' }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f4be69' }} />
              <div style={{ width: 60, height: 1, background: 'rgba(244,190,105,0.4)' }} />
            </div>
            <p style={{ color: 'rgba(244,190,105,0.7)', fontSize: '1.05rem', lineHeight: 1.9, maxWidth: 600, margin: '0 auto 40px' }}>
              {isAr
                ? 'أرومينا — بهارات طبيعية 100% مختارة بعناية من أجود المصادر. نوصّل لألمانيا، هولندا، فرنسا، السعودية، الإمارات، الكويت، قطر، وتركيا.'
                : 'Aromena — 100% natural spices carefully selected from premium sources. We ship to Germany, Netherlands, France, Saudi Arabia, UAE, Kuwait, Qatar, and Turkey.'}
            </p>
          </div>

          {/* الأزرار */}
          <div style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 1s ease 0.4s', display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/products" style={{ background: '#f4be69', color: '#7b192c', padding: '14px 36px', borderRadius: 50, fontWeight: 800, fontSize: '1rem', textDecoration: 'none', display: 'inline-block', boxShadow: '0 8px 28px rgba(244,190,105,0.3)', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {isAr ? 'تسوق الآن ←' : 'Shop Now →'}
            </Link>
            <Link to="/packages" style={{ background: 'transparent', color: '#f4be69', border: '2px solid rgba(244,190,105,0.4)', padding: '12px 32px', borderRadius: 50, fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none', display: 'inline-block', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#f4be69'; e.currentTarget.style.background = 'rgba(244,190,105,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(244,190,105,0.4)'; e.currentTarget.style.background = 'transparent' }}
            >
              {isAr ? 'الباقات الهدايا' : 'Gift Packages'}
            </Link>
          </div>

          {/* سهم للأسفل */}
          <div style={{ marginTop: 60, opacity: heroVisible ? 1 : 0, transition: 'opacity 1s ease 1s', animation: 'bounce 2s ease-in-out infinite' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(244,190,105,0.5)" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
      </section>

      {/* ═══ شريط الكيوردز ═══ */}
      <div style={{ background: 'linear-gradient(to left, #7b192c, #a82040)', padding: '14px 20px', overflow: 'hidden', position: 'relative' }}>
        <div style={{ display: 'flex', gap: 40, animation: 'marquee 20s linear infinite', whiteSpace: 'nowrap' }}>
          {[...keywords, ...keywords].map((kw, i) => (
            <span key={i} style={{ color: '#f4be69', fontSize: '0.82rem', fontWeight: 600, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(244,190,105,0.5)', display: 'inline-block' }} />
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* ═══ الإحصائيات ═══ */}
      <section ref={statsRef} style={{ background: '#EDD9C0', padding: '56px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 0 }}>
          {[
            { num: `${statsVisible ? count.customers : 0}+`, label_ar: 'زبون سعيد', label_en: 'Happy Customers' },
            { num: `${statsVisible ? count.products : 0}+`, label_ar: 'منتج فاخر', label_en: 'Premium Products' },
            { num: `${statsVisible ? count.countries : 0}`, label_ar: 'دول نشحن لها', label_en: 'Countries We Ship To' },
            { num: '100%', label_ar: 'طبيعي وحلال', label_en: 'Natural & Halal' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '28px 16px', borderRight: i < 3 ? '1px solid rgba(123,25,44,0.1)' : 'none', opacity: statsVisible ? 1 : 0, transform: statsVisible ? 'translateY(0)' : 'translateY(30px)', transition: `all 0.6s ease ${i * 0.1}s` }}>
              <div style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: '#7b192c', fontFamily: 'Amiri, serif', marginBottom: 8 }}>{s.num}</div>
              <div style={{ color: '#9C6B4E', fontSize: '0.85rem' }}>{isAr ? s.label_ar : s.label_en}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ المنتجات ═══ */}
      <section style={{ padding: '70px 20px', background: '#F5E6D3' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ color: '#7b192c', fontSize: '0.8rem', letterSpacing: 2, fontWeight: 600, marginBottom: 10, textTransform: 'uppercase' }}>
              {isAr ? 'تشكيلتنا الفاخرة' : 'Our Premium Collection'}
            </p>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', color: '#1a0610', marginBottom: 12 }}>
              {isAr ? 'بهارات مختارة من قلب الشرق' : 'Spices Curated from the Heart of the East'}
            </h2>
            <p style={{ color: '#9C6B4E', fontSize: '0.9rem', maxWidth: 500, margin: '0 auto' }}>
              {isAr ? 'كل منتج مختار بعناية لمنحك أصيل النكهة وعبق التراث' : 'Every product carefully selected to deliver authentic flavor and heritage'}
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
            {featured.map((p, i) => (
              <ProductCard key={p.slug || p.id} p={p} isAr={isAr} formatPrice={formatPrice} addItem={addItem} t={t} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(to left, #7b192c, #a82040)', color: '#f4be69', padding: '14px 40px', borderRadius: 50, fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', boxShadow: '0 8px 24px rgba(123,25,44,0.25)' }}>
              {isAr ? 'عرض كل المنتجات' : 'View All Products'}
              <FiArrowLeft size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ القصة ═══ */}
      <section ref={storyRef} style={{ background: 'linear-gradient(160deg, #1a0610, #7b192c)', padding: '80px 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(244,190,105,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 48, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ opacity: storyVisible ? 1 : 0, transform: storyVisible ? 'translateX(0)' : 'translateX(-40px)', transition: 'all 0.8s ease' }}>
            <div style={{ display: 'inline-block', background: 'rgba(244,190,105,0.12)', border: '1px solid rgba(244,190,105,0.25)', color: '#f4be69', padding: '5px 16px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 600, marginBottom: 20, letterSpacing: 1 }}>
              {isAr ? 'قِصَّة الشِّيف' : "Chef's Story"}
            </div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', color: '#f4be69', marginBottom: 20, lineHeight: 1.3 }}>
              {isAr ? 'الشِّيف غالية صوَّان' : 'Chef Ghalia Sawan'}
            </h2>
            <p style={{ color: 'rgba(244,190,105,0.7)', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: 20 }}>
              Gastronomy culinary arts specialist
            </p>
            <p style={{ color: 'rgba(244,190,105,0.75)', lineHeight: 1.9, fontSize: '0.95rem', marginBottom: 16 }}>
              {isAr
                ? 'أرومينا وُلِدَت مِن شَغَفٍ أصيلٍ في عالَمِ البَهاراتِ — حِكايةٌ بَدَأَت مِن هِوايةٍ في مَطبَخِ المَنزِلِ، وتَحوَّلَت إلى حُلمٍ نَحمِلُهُ إلى كُلِّ بَيتٍ عَرَبِيٍّ في العالَم.'
                : 'Aromena was born from a genuine passion for spices — a story that began as a hobby in a home kitchen and transformed into a dream we carry to every Arab home around the world.'}
            </p>
            <p style={{ color: 'rgba(244,190,105,0.6)', lineHeight: 1.8, fontSize: '0.88rem', marginBottom: 28 }}>
              {isAr
                ? 'خِبرة أكثر من عشر سنوات — بكالوريوس في فُنونِ الطَّهيِ — مُتخصِّصة في تطوير الوصفات والمنتجات الغذائيّة'
                : 'Over 10 years of experience — Bachelor in Culinary Arts — Specialized in recipe development and food products'}
            </p>
            <p style={{ color: '#f4be69', fontWeight: 700, fontStyle: 'italic', fontSize: '1rem' }}>
              {isAr ? '"صِحَّةٌ بِكُلِّ رَشَّة — Aromena"' : '"A Pinch of Health in Every Dash — Aromena"'}
            </p>
          </div>

          {/* مميزات */}
          <div style={{ opacity: storyVisible ? 1 : 0, transform: storyVisible ? 'translateX(0)' : 'translateX(40px)', transition: 'all 0.8s ease 0.2s', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { title_ar: 'بهارات طبيعية 100%', title_en: '100% Natural Spices', desc_ar: 'بدون إضافات أو مواد حافظة صناعية', desc_en: 'No additives or artificial preservatives' },
              { title_ar: 'شحن سريع لأوروبا', title_en: 'Fast Shipping to Europe', desc_ar: 'ألمانيا، هولندا، فرنسا، بلجيكا وأكثر', desc_en: 'Germany, Netherlands, France, Belgium & more' },
              { title_ar: 'شحن للخليج وتركيا', title_en: 'Gulf & Turkey Delivery', desc_ar: 'السعودية، الإمارات، الكويت، قطر، تركيا', desc_en: 'Saudi Arabia, UAE, Kuwait, Qatar, Turkey' },
              { title_ar: 'تغليف هدايا فاخر', title_en: 'Luxury Gift Packaging', desc_ar: 'مثالي للمناسبات والهدايا', desc_en: 'Perfect for occasions and gifts' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, background: 'rgba(244,190,105,0.05)', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(244,190,105,0.1)' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(244,190,105,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FiCheck size={14} color="#f4be69" />
                </div>
                <div>
                  <p style={{ color: '#f4be69', fontWeight: 700, fontSize: '0.88rem', marginBottom: 3 }}>{isAr ? f.title_ar : f.title_en}</p>
                  <p style={{ color: 'rgba(244,190,105,0.55)', fontSize: '0.78rem' }}>{isAr ? f.desc_ar : f.desc_en}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ الباقات ═══ */}
      {packages.length > 0 && (
        <section style={{ padding: '70px 20px', background: '#EDD9C0' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', color: '#1a0610', marginBottom: 10 }}>
                {isAr ? 'باقات الهدايا الفاخرة' : 'Premium Gift Packages'}
              </h2>
              <p style={{ color: '#9C6B4E', fontSize: '0.9rem' }}>
                {isAr ? 'هدية تُعبّر عن الأصالة والذوق الرفيع' : 'A gift that expresses authenticity and refined taste'}
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
              {packages.map((pkg, i) => (
                <div key={pkg.id} style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid #E2C9A8', boxShadow: '0 6px 24px rgba(123,25,44,0.08)' }}>
                  <div style={{ height: 140, background: `linear-gradient(135deg, ${pkg.color || '#7b192c'}18, ${pkg.color || '#7b192c'}35)`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {pkg.images?.[0] || pkg.image
                      ? <img src={pkg.images?.[0] || pkg.image} alt={isAr ? pkg.name_ar : pkg.name_en} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: '3rem' }}>{pkg.emoji || '🎁'}</span>}
                  </div>
                  <div style={{ padding: '16px 18px', textAlign: 'center' }}>
                    <h3 style={{ color: '#1a0610', fontWeight: 700, fontSize: '1rem', fontFamily: 'Amiri, serif', marginBottom: 6 }}>{isAr ? pkg.name_ar : pkg.name_en}</h3>
                    <p style={{ color: '#7b192c', fontWeight: 900, fontSize: '1.1rem', marginBottom: 12 }}>{formatPrice(pkg.price)}</p>
                    <Link to="/packages" style={{ display: 'block', background: 'linear-gradient(to left, #7b192c, #a82040)', color: '#f4be69', padding: '10px 0', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
                      {isAr ? 'اطلب الآن' : 'Order Now'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ CTA نهائي ═══ */}
      <section style={{ background: 'linear-gradient(135deg, #1a0610, #7b192c)', padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 20 }}>
            {[1,2,3,4,5].map(s => <FiStar key={s} size={20} color="#f4be69" fill="#f4be69" />)}
          </div>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', color: '#f4be69', marginBottom: 16, lineHeight: 1.3 }}>
            {isAr ? 'جرّب الفرق اليوم' : 'Experience the Difference Today'}
          </h2>
          <p style={{ color: 'rgba(244,190,105,0.65)', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: 36 }}>
            {isAr
              ? 'انضم لمئات العائلات العربية في أوروبا والخليج وتركيا الذين اختاروا أرومينا لمطبخهم'
              : 'Join hundreds of Arab families across Europe, the Gulf, and Turkey who chose Aromena for their kitchen'}
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/products" style={{ background: '#f4be69', color: '#7b192c', padding: '15px 44px', borderRadius: 50, fontWeight: 800, fontSize: '1.05rem', textDecoration: 'none', boxShadow: '0 8px 28px rgba(244,190,105,0.25)' }}>
              {isAr ? 'ابدأ التسوق' : 'Start Shopping'}
            </Link>
            <a href="https://wa.me/905550044476" target="_blank" rel="noreferrer" style={{ background: 'rgba(37,211,102,0.15)', color: '#25D366', border: '2px solid rgba(37,211,102,0.3)', padding: '13px 36px', borderRadius: 50, fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none' }}>
              {isAr ? 'تحدث معنا' : 'Chat with Us'}
            </a>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes twinkle { 0%,100%{opacity:0.2} 50%{opacity:1} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
      `}</style>
    </div>
  )
}