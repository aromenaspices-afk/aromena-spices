import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCart } from '../context/CartContext'
import { useCollection } from '../hooks/useFirestore'
import { useCurrency } from '../context/CurrencyContext'
import { FiShoppingCart, FiCheck, FiPackage, FiStar, FiTruck, FiGift, FiChevronLeft, FiChevronRight, FiShare2 } from 'react-icons/fi'
import ShareButton from '../components/ShareButton'
import CustomBoxBuilder from '../components/CustomBoxBuilder'

function calcDiscount(price, discount, expiry) {
  if (!discount || discount <= 0) return { final: price, has: false }
  if (expiry && new Date(expiry) < new Date()) return { final: price, has: false }
  return { final: Math.round(price * (1 - discount / 100) * 100) / 100, has: true, pct: discount }
}

function ImageSlider({ images, name }) {
  const [idx, setIdx] = useState(0)
  const imgs = images?.length ? images : []

  if (imgs.length === 0) return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #2a0d15, #7b192c)', gap: 12 }}>
      <FiPackage size={48} color="rgba(244,190,105,0.4)" />
      <p style={{ color: 'rgba(244,190,105,0.5)', fontSize: '0.8rem', textAlign: 'center', padding: '0 16px' }}>{name}</p>
    </div>
  )

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {imgs.map((img, i) => (
        <img key={i} src={img} alt={name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: i === idx ? 1 : 0, transition: 'opacity 0.5s ease' }} />
      ))}
      {imgs.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + imgs.length) % imgs.length) }}
            style={{ position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)', width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
            <FiChevronRight size={14} />
          </button>
          <button onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % imgs.length) }}
            style={{ position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)', width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
            <FiChevronLeft size={14} />
          </button>
          <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5, zIndex: 2 }}>
            {imgs.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setIdx(i) }}
                style={{ width: i === idx ? 18 : 6, height: 6, borderRadius: 50, border: 'none', padding: 0, cursor: 'pointer', background: i === idx ? '#f4be69' : 'rgba(255,255,255,0.5)', transition: 'all 0.25s' }} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function Packages() {
  const { t, i18n } = useTranslation()
  const { addItem } = useCart()
  const isAr = i18n.language === 'ar'
  const { data: readyPackages } = useCollection('packages')
  const { data: allProducts }   = useCollection('products')
  const { formatPrice }         = useCurrency()
  const [addedPkg, setAddedPkg] = useState(null)

  function handleAddReady(pkg) {
    const pd = calcDiscount(pkg.price, pkg.discount, pkg.discountExpiry)
    const pkgProducts = (pkg.items || []).map(slug => allProducts.find(p => p.slug === slug)).filter(Boolean)
    // الباقة كوحدة واحدة بالسلة
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

  const packagesUrl = `${window.location.origin}/packages`

  return (
    <div style={{ background: '#F5E6D3', minHeight: '100vh' }}>

      {/* ═══ HERO ═══ */}
      <div style={{ background: 'linear-gradient(160deg, #1a0610 0%, #7b192c 100%)', padding: '52px 20px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(244,190,105,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(244,190,105,0.04) 0%, transparent 40%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(244,190,105,0.12)', border: '1px solid rgba(244,190,105,0.25)', color: '#f4be69', fontSize: '0.78rem', fontWeight: 600, padding: '4px 16px', borderRadius: 50, marginBottom: 16, letterSpacing: 1 }}>
            {isAr ? 'هدايا فاخرة' : 'Luxury Gifts'}
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#f4be69', fontFamily: 'Amiri, serif', marginBottom: 10 }}>
            {t('packages.title')}
          </h1>
          {/* فاصل ذهبي */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 40, height: 1, background: 'rgba(244,190,105,0.4)' }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f4be69' }} />
            <div style={{ width: 40, height: 1, background: 'rgba(244,190,105,0.4)' }} />
          </div>
          <p style={{ color: 'rgba(244,190,105,0.65)', fontSize: '0.92rem', lineHeight: 1.8, maxWidth: 480, margin: '0 auto 28px' }}>
            {isAr ? 'منتقاة بعناية، ومغلفة بأناقة' : 'Carefully curated, elegantly packaged'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 28, flexWrap: 'wrap' }}>
            {[
              { icon: <FiStar size={13} />, text: isAr ? '100% طبيعي' : '100% Natural' },
              { icon: <FiTruck size={13} />, text: isAr ? 'شحن سريع' : 'Fast Shipping' },
              { icon: <FiGift size={13} />, text: isAr ? 'تغليف هدايا' : 'Gift Wrapping' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(244,190,105,0.6)', fontSize: '0.8rem' }}>
                {item.icon} {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ PACKAGES GRID — Equal Height Cards ═══ */}
      <section style={{ padding: '48px 16px 60px', background: '#F5E6D3' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', color: '#3E1C00', fontFamily: 'Amiri, serif', marginBottom: 6 }}>
              {isAr ? 'الباقات الجاهزة' : 'Ready Packages'}
            </h2>
            <p style={{ color: '#9C6B4E', fontSize: '0.88rem' }}>
              {isAr ? 'كل باقة مختارة بعناية من أجود البهارات' : 'Each package carefully curated from premium spices'}
            </p>
          </div>

          {/* Grid — equal height بـ align-items: stretch */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'start' }}>
            {readyPackages.map(pkg => {
              const pkgProducts = (pkg.items || []).map(slug => allProducts.find(p => p.slug === slug)).filter(Boolean)
              const isAdded     = addedPkg === pkg.id
              const pkgName     = isAr ? pkg.name_ar : pkg.name_en
              const pkgDesc     = isAr ? pkg.desc_ar : pkg.desc_en
              const imgs        = pkg.images?.length ? pkg.images : (pkg.image ? [pkg.image] : [])
              const pd          = calcDiscount(pkg.price, pkg.discount, pkg.discountExpiry)

              return (
                <div key={pkg.id} style={{
                  background: '#fff',
                  borderRadius: 22,
                  border: '1px solid #E2C9A8',
                  boxShadow: '0 4px 24px rgba(123,25,44,0.07)',
                  overflow: 'hidden',
                  transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease',
                  display: 'flex', flexDirection: 'column',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 48px rgba(123,25,44,0.15)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(123,25,44,0.07)' }}
                >

                  {/* الصورة — ارتفاع ثابت دائماً */}
                  <div style={{ position: 'relative', height: 260, flexShrink: 0, overflow: 'hidden', borderRadius: '22px 22px 0 0' }}>
                    <ImageSlider images={imgs} name={pkgName} />

                    {/* الخصم — ختم ذهبي فوق الصورة فقط */}
                    {pd.has && (
                      <div style={{
                        position: 'absolute', top: 14, right: isAr ? 'auto' : 14, left: isAr ? 14 : 'auto',
                        width: 54, height: 54, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f4be69, #e09d30)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                        zIndex: 3, border: '2px solid rgba(255,255,255,0.4)',
                      }}>
                        <span style={{ color: '#7b192c', fontSize: '0.6rem', fontWeight: 800, lineHeight: 1 }}>{isAr ? 'خصم' : 'SALE'}</span>
                        <span style={{ color: '#7b192c', fontSize: '0.85rem', fontWeight: 900, lineHeight: 1 }}>{pd.pct}%</span>
                      </div>
                    )}

                    {/* الوسم */}
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

                    {/* الاسم + المشاركة */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ color: '#3E1C00', fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Amiri, serif', margin: 0, marginBottom: 2 }}>{pkgName}</h3>
                        {pkg.name_en && isAr && <p style={{ color: '#9C6B4E', fontSize: '0.75rem', margin: 0 }}>{pkg.name_en}</p>}
                      </div>
                      <ShareButton url={`${packagesUrl}#${pkg.id}`} title={isAr ? `${pkgName} — أرومينا` : `${pkgName} — Aromena`} isAr={isAr} size="small" />
                    </div>

                    {pkgDesc && <p style={{ color: '#6B3A2A', fontSize: '0.83rem', lineHeight: 1.7, marginBottom: 14 }}>{pkgDesc}</p>}

                    {/* فاصل ذهبي */}
                    <div style={{ height: 1, background: 'linear-gradient(to right, #E2C9A8, transparent)', marginBottom: 14 }} />

                    {/* المحتويات */}
                    {pkgProducts.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <p style={{ color: '#3E1C00', fontWeight: 700, fontSize: '0.82rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <FiPackage size={12} color="#7b192c" />
                          {isAr ? `المحتوى (${pkgProducts.length} منتج)` : `Contents (${pkgProducts.length} items)`}
                        </p>

                        {/* صور دوائر المنتجات */}
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

                    {/* السعر */}
                    <div style={{ marginBottom: 14, marginTop: 'auto' }}>
                      {pd.has ? (
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                          <span style={{ color: '#DC2626', fontWeight: 900, fontSize: '1.6rem', fontFamily: 'Amiri, serif' }}>{formatPrice(pd.final)}</span>
                          <span style={{ color: '#9C6B4E', textDecoration: 'line-through', fontSize: '0.92rem' }}>{formatPrice(pkg.price)}</span>
                        </div>
                      ) : (
                        <span style={{ color: '#7b192c', fontWeight: 900, fontSize: '1.6rem', fontFamily: 'Amiri, serif' }}>{formatPrice(pkg.price)}</span>
                      )}
                      <p style={{ color: '#9C6B4E', fontSize: '0.72rem', marginTop: 2 }}>
                        {isAr ? 'شامل الشحن' : 'incl. shipping'}
                      </p>
                    </div>

                    {/* زر الإضافة */}
                    <button onClick={() => handleAddReady(pkg)} style={{
                      width: '100%',
                      background: isAdded ? '#16A34A' : 'linear-gradient(to left, #7b192c, #a82040)',
                      color: '#f4be69',
                      padding: '13px 0', borderRadius: 12,
                      fontWeight: 700, fontSize: '0.92rem',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      fontFamily: 'Amiri, serif',
                      transition: 'all 0.3s',
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
        </div>
      </section>

      {/* ═══ CUSTOM BOX BUILDER ═══ */}
      <section style={{ padding: '0 16px 60px', background: '#F5E6D3' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', color: '#3E1C00', fontFamily: 'Amiri, serif', marginBottom: 6 }}>
              {isAr ? 'صمّم باقتك الخاصة' : 'Build Your Custom Box'}
            </h2>
            <p style={{ color: '#9C6B4E', fontSize: '0.88rem' }}>
              {isAr ? 'اختر 4 بهارات من تشكيلتنا بسعر خاص' : 'Choose 4 spices from our collection at a special price'}
            </p>
          </div>
          <CustomBoxBuilder />
        </div>
      </section>

      {/* ═══ TRUST STRIP ═══ */}
      <section style={{ background: 'linear-gradient(135deg, #1a0610, #7b192c)', padding: '28px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
          {[
            { icon: <FiTruck size={18} />, title_ar: 'توصيل سريع وآمن', title_en: 'Fast & Safe Delivery', desc_ar: 'لأوروبا والخليج وتركيا', desc_en: 'Europe, Gulf & Turkey' },
            { icon: <FiGift size={18} />, title_ar: 'تغليف هدايا فاخر', title_en: 'Luxury Gift Wrapping', desc_ar: 'جاهز للإهداء', desc_en: 'Ready to gift' },
            { icon: <FiPackage size={18} />, title_ar: 'مكونات طبيعية 100%', title_en: '100% Natural', desc_ar: 'منتقاة بعناية', desc_en: 'Carefully selected' },
            { icon: <FiStar size={18} />, title_ar: 'جودة مضمونة', title_en: 'Quality Guaranteed', desc_ar: 'رضاكم أولويتنا', desc_en: 'Your satisfaction first' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(244,190,105,0.12)', border: '1px solid rgba(244,190,105,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f4be69', flexShrink: 0 }}>
                {item.icon}
              </div>
              <div>
                <p style={{ color: '#f4be69', fontWeight: 700, fontSize: '0.85rem', marginBottom: 2 }}>{isAr ? item.title_ar : item.title_en}</p>
                <p style={{ color: 'rgba(244,190,105,0.55)', fontSize: '0.75rem' }}>{isAr ? item.desc_ar : item.desc_en}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}