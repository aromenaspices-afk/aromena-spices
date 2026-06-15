import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCollection } from '../hooks/useFirestore'
import { useCurrency } from '../context/CurrencyContext'
import { FiSearch, FiMapPin, FiArrowLeft, FiArrowRight } from 'react-icons/fi'
import ShareButton from '../components/ShareButton'


function calcDiscount(price, discount, expiry) {
  if (!discount || discount <= 0) return { final: price, has: false }
  if (expiry && new Date(expiry) < new Date()) return { final: price, has: false }
  return { final: Math.round(price * (1 - discount / 100) * 100) / 100, has: true, pct: discount }
}

function PriceDisplay({ price, discount, expiry, formatPrice }) {
  const d = calcDiscount(price, discount, expiry)
  if (!d.has) return <span style={{ color: '#7b192c', fontWeight: 700, fontSize: '0.85rem' }}>{formatPrice(price)}</span>
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
      <span style={{ color: '#9C6B4E', textDecoration: 'line-through', fontSize: '0.72rem' }}>{formatPrice(price)}</span>
      <span style={{ color: '#DC2626', fontWeight: 900, fontSize: '0.92rem' }}>{formatPrice(d.final)}</span>
      <span style={{ background: '#DC2626', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '2px 6px', borderRadius: 50 }}>-{d.pct}%</span>
    </span>
  )
}

const CATEGORIES = [
  { id: 'all',     label_ar: 'الكل',     label_en: 'All' },
  { id: 'classic', label_ar: 'كلاسيك',  label_en: 'Classic' },
  { id: 'blends',  label_ar: 'خلطات',   label_en: 'Blends' },
  { id: 'hot',     label_ar: 'حارة',     label_en: 'Hot' },
  { id: 'premium', label_ar: 'بريميوم', label_en: 'Premium' },
]

export default function Products() {
  const { t, i18n } = useTranslation()
  const isAr = i18n.language === 'ar'
  const { data: products, loading } = useCollection('products')
  const { formatPrice } = useCurrency()
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory
    const name = isAr ? p.name_ar : p.name_en
    const matchSearch = name?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F5E6D3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7b192c', fontSize: '1.1rem' }}>
      {isAr ? 'جاري التحميل...' : 'Loading...'}
    </div>
  )

  return (
    <div style={{ background: '#F5E6D3', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #7b192c, #a82040)', padding: '40px 20px 50px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: '#f4be69', fontFamily: 'Tajawal, sans-serif', marginBottom: 8 }}>
          {t('products.title')}
        </h1>
        <p style={{ color: 'rgba(244,190,105,0.75)', fontSize: '0.9rem' }}>
          {isAr ? 'اختر من مجموعتنا الفاخرة من البهارات الأصيلة' : 'Choose from our premium authentic spice collection'}
        </p>
        <div style={{ position: 'relative', maxWidth: 400, margin: '20px auto 0' }}>
          <FiSearch style={{
            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
            right: isAr ? 16 : 'auto', left: isAr ? 'auto' : 16,
            color: '#9C6B4E', pointerEvents: 'none',
          }} size={16} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isAr ? 'ابحث عن بهار...' : 'Search spices...'}
            style={{
              width: '100%',
              padding: isAr ? '11px 42px 11px 16px' : '11px 16px 11px 42px',
              borderRadius: 50, border: 'none',
              background: '#fff', fontSize: '0.9rem',
              color: '#3E1C00', fontFamily: 'Tajawal, sans-serif',
              outline: 'none', boxSizing: 'border-box',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            }}
          />
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px 40px' }}>

        {/* Categories */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', padding: '24px 0 20px' }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
              padding: '7px 18px', borderRadius: 50, border: '2px solid',
              borderColor: activeCategory === cat.id ? '#7b192c' : '#E2C9A8',
              background: activeCategory === cat.id ? 'linear-gradient(to left, #7b192c, #a82040)' : '#fff',
              color: activeCategory === cat.id ? '#f4be69' : '#6B3A2A',
              fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
              fontFamily: 'Tajawal, sans-serif', transition: 'all 0.2s',
            }}>
              {isAr ? cat.label_ar : cat.label_en}
            </button>
          ))}
        </div>

        <p style={{ color: '#9C6B4E', fontSize: '0.8rem', marginBottom: 18, textAlign: isAr ? 'right' : 'left' }}>
          {filtered.length} {isAr ? 'منتج' : 'products'}
        </p>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9C6B4E' }}>
            {isAr ? 'لا توجد منتجات' : 'No products found'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
            {filtered.map(p => {
              const name = isAr ? p.name_ar : p.name_en
              const origin = isAr ? p.origin_ar : p.origin_en
              const pid = p.slug || p.id
              const sizes = p.sizes?.length
                ? p.sizes
                : p.prices ? Object.entries(p.prices).filter(([, v]) => v > 0).map(([k, v]) => ({ label: k, price: v })) : []
              const minPrice = sizes.length ? Math.min(...sizes.map(s => s.price)) : 0
              const productUrl = `${window.location.origin}/products/${p.slug}`

              return (
                <div key={pid} style={{
                  background: '#fff', borderRadius: 18, overflow: 'hidden',
                  border: '1px solid #E2C9A8',
                  boxShadow: '0 2px 12px rgba(123,25,44,0.06)',
                }}>
                  <Link to={`/products/${p.slug}`}>
                    <div style={{
                      height: 160,
                      background: `linear-gradient(135deg, ${p.color}18, ${p.color}35)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative', overflow: 'hidden',
                    }}>
                      {(p.images?.[0] || p.image)
                        ? <img src={p.images?.[0] || p.image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: 60, height: 60, borderRadius: '50%', background: `${p.color}30` }} />
                      }
                      {p.category === 'premium' && (
                        <span style={{
                          position: 'absolute', top: 8,
                          right: isAr ? 'auto' : 8, left: isAr ? 8 : 'auto',
                          background: 'linear-gradient(to left, #7b192c, #a82040)',
                          color: '#f4be69', fontSize: '0.65rem',
                          padding: '3px 9px', borderRadius: 50, fontWeight: 700,
                        }}>Premium</span>
                      )}
                      {p.discount > 0 && calcDiscount(minPrice, p.discount, p.discountExpiry).has && (
                        <span style={{
                          position: 'absolute', top: 8,
                          left: isAr ? 'auto' : 8, right: isAr ? 8 : 'auto',
                          background: '#DC2626', color: '#fff',
                          fontSize: '0.65rem', padding: '3px 9px', borderRadius: 50, fontWeight: 700,
                        }}>-{p.discount}%</span>
                      )}
                    </div>
                  </Link>

                  <div style={{ padding: '12px' }}>
                    <Link to={`/products/${p.slug}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ color: '#3E1C00', fontSize: '0.92rem', fontWeight: 700, marginBottom: 4, lineHeight: 1.3 }}>
                        {name}
                      </h3>
                    </Link>
                    {origin && (
                      <p style={{ color: '#9C6B4E', fontSize: '0.72rem', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <FiMapPin size={10} /> {origin}
                      </p>
                    )}
                    {minPrice > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        {p.discount > 0
                          ? <PriceDisplay price={minPrice} discount={p.discount} expiry={p.discountExpiry} formatPrice={formatPrice} />
                          : <span style={{ color: '#7b192c', fontWeight: 700, fontSize: '0.85rem' }}>{isAr ? 'من' : 'from'} {formatPrice(minPrice)}</span>
                        }
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link to={`/products/${p.slug}`} style={{
                        flex: 1,
                        background: 'linear-gradient(to left, #7b192c, #a82040)',
                        color: '#f4be69', padding: '9px 0', borderRadius: 10,
                        fontWeight: 700, fontSize: '0.78rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        fontFamily: 'Tajawal, sans-serif', textDecoration: 'none',
                        boxShadow: '0 3px 10px rgba(123,25,44,0.2)',
                      }}>
                        {isAr ? 'عرض المنتج' : 'View Product'}
                        {isAr ? <FiArrowLeft size={12} /> : <FiArrowRight size={12} />}
                      </Link>
                      <ShareButton
                        url={productUrl}
                        title={isAr ? `${name} — أرومينا للبهارات` : `${name} — Aromena Spices`}
                        isAr={isAr}
                        size="small"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}