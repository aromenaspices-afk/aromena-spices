import { useState, useEffect } from 'react'
import { db } from '../../firebase'
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from 'firebase/firestore'
import { useCollection } from '../../hooks/useFirestore'
import { FiTrash2, FiStar, FiFilter } from 'react-icons/fi'

const BORDEAUX = '#7b192c'
const GOLD     = '#f4be69'
const BG       = '#F5E6D3'
const BG2      = '#EDD9C0'
const CARD     = '#ffffff'
const TEXT     = '#3E1C00'
const TEXT2    = '#9C6B4E'
const BORDER   = '#E2C9A8'

const selectStyle = {
  padding: '8px 12px', borderRadius: 8,
  border: `2px solid ${BORDER}`,
  fontSize: '0.85rem', color: TEXT, outline: 'none',
  background: '#FFFBF5', fontFamily: 'Amiri, serif',
  cursor: 'pointer', transition: 'border-color 0.15s',
}

function StarRow({ rating, size = 14 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} style={{
          color: n <= Math.round(rating) ? '#F59E0B' : BORDER,
          fontSize: size,
        }}>★</span>
      ))}
    </div>
  )
}

export default function AdminReviews() {
  const { data: products } = useCollection('products')
  const [allReviews,    setAllReviews]    = useState([])
  const [loading,       setLoading]       = useState(true)
  const [filterProduct, setFilterProduct] = useState('all')
  const [filterRating,  setFilterRating]  = useState('all')

  useEffect(() => {
    if (!products.length) return
    const unsubList = []
    const reviewsMap = {}
    let loaded = 0

    products.forEach(product => {
      const q = query(
        collection(db, 'products', product.slug, 'reviews'),
        orderBy('createdAt', 'desc')
      )
      const unsub = onSnapshot(q, snap => {
        reviewsMap[product.slug] = snap.docs.map(d => ({
          id: d.id,
          productSlug:    product.slug,
          productName_ar: product.name_ar,
          productName_en: product.name_en,
          productImage:   product.images?.[0] || product.image || null,
          ...d.data(),
        }))
        loaded++
        if (loaded >= products.length) setLoading(false)
        const merged = Object.values(reviewsMap).flat()
        merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setAllReviews(merged)
      })
      unsubList.push(unsub)
    })

    return () => unsubList.forEach(u => u())
  }, [products])

  async function handleDelete(productSlug, reviewId) {
    if (!confirm('حذف التقييم؟')) return
    await deleteDoc(doc(db, 'products', productSlug, 'reviews', reviewId))
  }

  const filtered = allReviews.filter(r => {
    const matchProduct = filterProduct === 'all' || r.productSlug === filterProduct
    const matchRating  = filterRating  === 'all' || Math.round(r.rating) === +filterRating
    return matchProduct && matchRating
  })

  const avgAll    = allReviews.length
    ? (allReviews.reduce((s, r) => s + (r.rating || 0), 0) / allReviews.length).toFixed(1)
    : '—'
  const fiveStars = allReviews.filter(r => Math.round(r.rating) === 5).length
  const lowRating = allReviews.filter(r => Math.round(r.rating) <= 2).length

  // توزيع النجوم
  const distribution = [5,4,3,2,1].map(n => ({
    n,
    count: allReviews.filter(r => Math.round(r.rating) === n).length,
  }))
  const maxDist = Math.max(...distribution.map(d => d.count), 1)

  if (loading && products.length > 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ height: 100, borderRadius: 16, background: BG, animation: 'pulse 1.2s ease-in-out infinite' }} />
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.4rem', color: TEXT, fontFamily: 'Amiri, serif' }}>إدارة التقييمات</h1>
        <p style={{ color: TEXT2, fontSize: '0.85rem' }}>{allReviews.length} تقييم</p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 12, marginBottom: 20,
      }}>
        {[
          { label: 'إجمالي التقييمات', value: allReviews.length, color: BORDEAUX,  bg: 'rgba(123,25,44,0.06)' },
          { label: 'متوسط التقييم',   value: avgAll + ' ★',    color: '#F59E0B',  bg: '#FFFBEB' },
          { label: '5 نجوم',          value: fiveStars,          color: '#16A34A',  bg: '#F0FDF4' },
          { label: 'تقييمات منخفضة', value: lowRating,          color: '#DC2626',  bg: '#FEF2F2' },
        ].map((s, i) => (
          <div key={i} style={{
            background: s.bg, borderRadius: 16, padding: '16px',
            border: `1px solid ${s.color}22`,
          }}>
            <p style={{ color: s.color, fontWeight: 900, fontSize: '1.5rem', lineHeight: 1 }}>{s.value}</p>
            <p style={{ color: s.color, fontSize: '0.75rem', marginTop: 5, fontWeight: 600, opacity: 0.8 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* توزيع النجوم */}
      {allReviews.length > 0 && (
        <div style={{
          background: CARD, borderRadius: 18, padding: '20px 22px',
          border: `1px solid ${BORDER}`, marginBottom: 20,
          boxShadow: '0 2px 10px rgba(62,28,0,0.04)',
        }}>
          <p style={{ color: TEXT, fontWeight: 700, fontSize: '0.92rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
            <FiStar size={14} color={BORDEAUX} /> توزيع التقييمات
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {distribution.map(({ n, count }) => {
              const pct = Math.round((count / maxDist) * 100)
              return (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: TEXT2, fontSize: '0.78rem', fontWeight: 600, width: 16, textAlign: 'center' }}>{n}</span>
                  <span style={{ color: '#F59E0B', fontSize: '0.78rem' }}>★</span>
                  <div style={{ flex: 1, height: 7, background: BG, borderRadius: 50, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 50,
                      width: `${pct}%`,
                      background: n >= 4
                        ? `linear-gradient(to left, ${BORDEAUX}, #a82040)`
                        : n === 3 ? '#D97706' : '#DC2626',
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                  <span style={{ color: TEXT2, fontSize: '0.75rem', width: 24, textAlign: 'left' }}>{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{
        background: CARD, borderRadius: 16, padding: '16px 20px',
        border: `1px solid ${BORDER}`, marginBottom: 20,
        display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end',
        boxShadow: '0 2px 10px rgba(62,28,0,0.04)',
      }}>
        <FiFilter size={16} color={BORDEAUX} style={{ marginBottom: 2 }} />

        <div>
          <label style={{ color: '#6B3A2A', fontSize: '0.8rem', fontWeight: 600, marginBottom: 5, display: 'block' }}>
            المنتج
          </label>
          <select
            value={filterProduct}
            onChange={e => setFilterProduct(e.target.value)}
            style={selectStyle}
            onFocus={e => e.target.style.borderColor = BORDEAUX}
            onBlur={e => e.target.style.borderColor = BORDER}
          >
            <option value="all">كل المنتجات</option>
            {products.map(p => (
              <option key={p.slug} value={p.slug}>{p.name_ar}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ color: '#6B3A2A', fontSize: '0.8rem', fontWeight: 600, marginBottom: 5, display: 'block' }}>
            التقييم
          </label>
          <select
            value={filterRating}
            onChange={e => setFilterRating(e.target.value)}
            style={selectStyle}
            onFocus={e => e.target.style.borderColor = BORDEAUX}
            onBlur={e => e.target.style.borderColor = BORDER}
          >
            <option value="all">كل التقييمات</option>
            {[5,4,3,2,1].map(n => (
              <option key={n} value={n}>{'★'.repeat(n)}{'☆'.repeat(5-n)} {n} نجوم</option>
            ))}
          </select>
        </div>

        <span style={{ color: TEXT2, fontSize: '0.82rem', marginRight: 'auto', paddingBottom: 2 }}>
          {filtered.length} نتيجة
        </span>
      </div>

      {/* Reviews List */}
      {filtered.length === 0 ? (
        <div style={{
          background: CARD, borderRadius: 20, padding: '60px',
          textAlign: 'center', border: `1px solid ${BORDER}`, color: TEXT2,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(123,25,44,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <FiStar size={28} color={BORDEAUX} />
          </div>
          <p style={{ fontWeight: 600, color: TEXT, marginBottom: 4 }}>لا يوجد تقييمات</p>
          <p style={{ fontSize: '0.83rem' }}>لم يصل أي تقييم بعد</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(review => {
            const ratingColor = review.rating >= 4 ? '#16A34A' : review.rating >= 3 ? '#D97706' : '#DC2626'
            const ratingBg    = review.rating >= 4 ? '#F0FDF4'  : review.rating >= 3 ? '#FEF3C7' : '#FEF2F2'
            return (
              <div key={`${review.productSlug}-${review.id}`} style={{
                background: CARD, borderRadius: 16,
                border: `1px solid ${BORDER}`, padding: '16px 18px',
                boxShadow: '0 2px 8px rgba(62,28,0,0.04)',
                transition: 'box-shadow 0.15s',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>

                  {/* صورة المنتج */}
                  <div style={{
                    width: 50, height: 50, borderRadius: 10, overflow: 'hidden',
                    background: BG, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.4rem',
                  }}>
                    {review.productImage
                      ? <img src={review.productImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : '🫙'
                    }
                  </div>

                  {/* المحتوى */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    {/* رأس التقييم */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{
                        background: 'rgba(123,25,44,0.07)', color: BORDEAUX,
                        padding: '2px 10px', borderRadius: 50,
                        fontSize: '0.73rem', fontWeight: 700,
                        border: '1px solid rgba(123,25,44,0.12)',
                      }}>
                        {review.productName_ar}
                      </span>
                      <StarRow rating={review.rating} />
                      <span style={{
                        background: ratingBg, color: ratingColor,
                        padding: '2px 8px', borderRadius: 50,
                        fontSize: '0.7rem', fontWeight: 700,
                      }}>
                        {review.rating} ★
                      </span>
                    </div>

                    {/* اسم المستخدم */}
                    <p style={{ color: TEXT, fontWeight: 700, fontSize: '0.88rem', marginBottom: 5 }}>
                      {review.userName}
                    </p>

                    {/* التعليق */}
                    {review.comment && (
                      <p style={{
                        color: '#6B3A2A', fontSize: '0.86rem',
                        lineHeight: 1.7, marginBottom: 6,
                        background: BG, borderRadius: 8, padding: '8px 12px',
                      }}>
                        {review.comment}
                      </p>
                    )}

                    {/* التاريخ */}
                    <p style={{ color: TEXT2, fontSize: '0.73rem' }}>
                      {new Date(review.createdAt).toLocaleDateString('ar-SA', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </p>
                  </div>

                  {/* زر الحذف */}
                  <button
                    onClick={() => handleDelete(review.productSlug, review.id)}
                    style={{
                      width: 34, height: 34, borderRadius: 9,
                      background: '#FEE2E2', border: 'none',
                      color: '#DC2626', cursor: 'pointer', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.15s',
                    }}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}