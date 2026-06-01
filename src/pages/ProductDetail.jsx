import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useCollection } from '../hooks/useFirestore'
import { db } from '../firebase'
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import { FiShoppingCart, FiArrowRight, FiArrowLeft, FiTrash2, FiX, FiChevronLeft, FiChevronRight, FiMapPin, FiMaximize2, FiMinus, FiPlus } from 'react-icons/fi'
import ShareButton from '../components/ShareButton'
import toast from 'react-hot-toast'
import { useCurrency } from '../context/CurrencyContext'

// حساب السعر بعد الخصم
function calcDiscount(price, discount, expiry) {
  if (!discount || discount <= 0) return { final: price, has: false }
  if (expiry && new Date(expiry) < new Date()) return { final: price, has: false }
  return { final: Math.round(price * (1 - discount / 100) * 100) / 100, has: true, pct: discount }
}

export default function ProductDetail() {
  const { slug } = useParams()
  const { t, i18n } = useTranslation()
  const { addItem } = useCart()
  const { user } = useAuth()
  const isAr = i18n.language === 'ar'
  const { data: products, loading } = useCollection('products')
  const { formatPrice } = useCurrency()

  const product = products.find(p => p.slug === slug)
  const productSizes = product?.sizes?.length
    ? product.sizes
    : product?.prices
      ? Object.entries(product.prices).filter(([, v]) => v > 0).map(([k, v]) => ({ label: k, price: v }))
      : []

  const [selectedSize,     setSelectedSize]     = useState(null)
  const [qty,              setQty]              = useState(1)
  const [added,            setAdded]            = useState(false)
  const [activeImg,        setActiveImg]        = useState(0)
  const [activeTab,        setActiveTab]        = useState('desc')
  const [fullscreen,       setFullscreen]       = useState(false)
  const [fsImg,            setFsImg]            = useState(0)
  const [zoom,             setZoom]             = useState(false)
  const [zoomPos,          setZoomPos]          = useState({ x: 50, y: 50 })
  const [reviews,          setReviews]          = useState([])
  const [reviewForm,       setReviewForm]       = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewSuccess,    setReviewSuccess]    = useState(false)
  const imgRef = useRef(null)

  useEffect(() => {
    if (product && productSizes.length > 0 && !selectedSize) {
      setSelectedSize(productSizes[0].label)
    }
  }, [product?.slug])

  useEffect(() => {
    if (!product) return
    const q = query(collection(db, 'products', product.slug, 'reviews'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
    return () => unsub()
  }, [product?.slug])

  useEffect(() => {
    if (!fullscreen) return
    function onKey(e) {
      if (e.key === 'ArrowLeft')  setFsImg(i => (i + 1) % images.length)
      if (e.key === 'ArrowRight') setFsImg(i => (i - 1 + images.length) % images.length)
      if (e.key === 'Escape')     setFullscreen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fullscreen])

  function handleMouseMove(e) {
    if (!imgRef.current) return
    const rect = imgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F5E6D3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7b192c', fontSize: '1.1rem' }}>
      {isAr ? 'جاري التحميل...' : 'Loading...'}
    </div>
  )

  if (!product) return (
    <div style={{ textAlign: 'center', padding: '100px 20px', color: '#9C6B4E' }}>
      <p style={{ marginBottom: 16, fontSize: '1rem' }}>{isAr ? 'المنتج غير موجود' : 'Product not found'}</p>
      <Link to="/products" style={{ color: '#7b192c', fontWeight: 700 }}>
        {isAr ? 'العودة للمنتجات' : 'Back to Products'}
      </Link>
    </div>
  )

  const images      = product.images?.length ? product.images : (product.image ? [product.image] : [])
  const name        = isAr ? product.name_ar : product.name_en
  const desc        = isAr ? product.desc_ar : product.desc_en
  const descLong    = isAr ? product.desc_long_ar : product.desc_long_en
  const ingredients = isAr ? product.ingredients_ar : product.ingredients_en
  const usage       = isAr ? product.usage_ar : product.usage_en
  const origin      = isAr ? product.origin_ar : product.origin_en
  const currentSize = productSizes.find(s => s.label === selectedSize)
  const price       = currentSize?.price || 0
  const disc        = calcDiscount(price, product.discount, product.discountExpiry)
  const avgRating   = reviews.length ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length) : null
  const isAdmin     = user?.email === 'aromena.official@gmail.com'
  const related     = products.filter(p => p.category === product.category && p.slug !== product.slug).slice(0, 4)

  function prevImg() { setActiveImg(i => (i - 1 + images.length) % images.length) }
  function nextImg() { setActiveImg(i => (i + 1) % images.length) }
  function openFullscreen(idx) { setFsImg(idx); setFullscreen(true) }

  function handleAdd() {
    if (!selectedSize) return
    const finalPrice = disc.has ? disc.final : price
    for (let i = 0; i < qty; i++) {
      addItem({
        id: `${product.slug || product.id}_${selectedSize}`,
        productId: product.slug || product.id,
        name, size: selectedSize, price: finalPrice,
        image: images[0] || null,
      })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  async function submitReview() {
    if (!user || !reviewForm.comment.trim()) return
    setSubmittingReview(true)
    try {
      await addDoc(collection(db, 'products', product.slug, 'reviews'), {
        userId: user.uid,
        userName: user.displayName || (isAr ? 'مستخدم' : 'User'),
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
        createdAt: new Date().toISOString(),
      })
      setReviewForm({ rating: 5, comment: '' })
      setReviewSuccess(true)
      toast.success(isAr ? 'تم إرسال تقييمك!' : 'Review submitted!')
      setTimeout(() => setReviewSuccess(false), 3000)
    } catch {
      toast.error(isAr ? 'فشل إرسال التقييم' : 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  async function deleteReview(reviewId) {
    if (!confirm(isAr ? 'حذف التقييم؟' : 'Delete review?')) return
    await deleteDoc(doc(db, 'products', product.slug, 'reviews', reviewId))
    toast.success(isAr ? 'تم حذف التقييم' : 'Review deleted')
  }

  const tabs = [
    { id: 'desc',        label: isAr ? 'الوصف'     : 'Description' },
    { id: 'ingredients', label: isAr ? 'المكوّنات'  : 'Ingredients' },
    { id: 'usage',       label: isAr ? 'الاستخدام' : 'How to Use' },
    { id: 'reviews',     label: isAr ? `التقييمات (${reviews.length})` : `Reviews (${reviews.length})` },
  ]

  function starColor(r) {
    if (r >= 4) return '#16A34A'
    if (r >= 3) return '#D97706'
    return '#DC2626'
  }

  function starBg(r) {
    if (r >= 4) return '#F0FDF4'
    if (r >= 3) return '#FEF3C7'
    return '#FEF2F2'
  }

  function renderStars(rating, size = 16) {
    return (
      <div style={{ display: 'flex', gap: 3 }}>
        {[1,2,3,4,5].map(n => (
          <span key={n} style={{ fontSize: size, color: n <= rating ? '#f4be69' : '#E2C9A8', lineHeight: 1 }}>★</span>
        ))}
      </div>
    )
  }

  return (
    <div style={{ background: '#F5E6D3', minHeight: '100vh' }}>

      {/* Fullscreen Modal */}
      {fullscreen && images.length > 0 && (
        <div onClick={() => setFullscreen(false)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button onClick={() => setFullscreen(false)} style={{ position: 'absolute', top: 20, right: 20, width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <FiX size={20} />
          </button>
          {images.length > 1 && (
            <button onClick={e => { e.stopPropagation(); setFsImg(i => (i - 1 + images.length) % images.length) }} style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <FiChevronRight size={22} />
            </button>
          )}
          <img src={images[fsImg]} alt={name} onClick={e => e.stopPropagation()} style={{ maxWidth: '88vw', maxHeight: '88vh', borderRadius: 16, objectFit: 'contain', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }} />
          {images.length > 1 && (
            <button onClick={e => { e.stopPropagation(); setFsImg(i => (i + 1) % images.length) }} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <FiChevronLeft size={22} />
            </button>
          )}
          {images.length > 1 && (
            <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 10 }}>
              {images.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setFsImg(i) }} style={{ width: fsImg === i ? 24 : 8, height: 8, borderRadius: 50, border: 'none', cursor: 'pointer', background: fsImg === i ? '#f4be69' : 'rgba(255,255,255,0.4)', transition: 'all 0.2s', padding: 0 }} />
              ))}
            </div>
          )}
          <div style={{ position: 'absolute', top: 20, left: 20, color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{fsImg + 1} / {images.length}</div>
        </div>
      )}

      {/* Breadcrumb */}
      <div style={{ background: 'linear-gradient(135deg, #7b192c, #a82040)', padding: '16px 16px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: 'rgba(244,190,105,0.7)', textDecoration: 'none', fontSize: '0.8rem' }}>{t('nav.home')}</Link>
          <span style={{ color: 'rgba(244,190,105,0.4)' }}>/</span>
          <Link to="/products" style={{ color: 'rgba(244,190,105,0.7)', textDecoration: 'none', fontSize: '0.8rem' }}>{t('nav.products')}</Link>
          <span style={{ color: 'rgba(244,190,105,0.4)' }}>/</span>
          <span style={{ color: '#f4be69', fontSize: '0.8rem', fontWeight: 600 }}>{name}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px 48px' }}>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 36, marginBottom: 40 }}>

          {/* Gallery */}
          <div>
            <div ref={imgRef} onMouseEnter={() => images.length > 0 && setZoom(true)} onMouseLeave={() => setZoom(false)} onMouseMove={handleMouseMove}
              style={{ background: `linear-gradient(135deg, ${product.color}18, ${product.color}35)`, borderRadius: 20, overflow: 'hidden', border: `2px solid ${zoom ? '#7b192c' : '#E2C9A8'}`, height: 380, position: 'relative', cursor: images.length > 0 ? 'crosshair' : 'default', transition: 'border-color 0.2s', marginBottom: 12 }}
            >
              {images.length > 0 ? (
                <>
                  <img src={images[activeImg]} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: zoom ? 0 : 1, transition: 'opacity 0.15s' }} />
                  {zoom && <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${images[activeImg]})`, backgroundSize: '130%', backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`, backgroundRepeat: 'no-repeat' }} />}

                  {/* Discount badge */}
                  {disc.has && (
                    <span style={{ position: 'absolute', top: 12, left: isAr ? 'auto' : 12, right: isAr ? 12 : 'auto', background: '#DC2626', color: '#fff', fontSize: '0.78rem', padding: '5px 14px', borderRadius: 50, fontWeight: 700, zIndex: 2 }}>
                      خصم {disc.pct}%
                    </span>
                  )}

                  {/* Fullscreen btn */}
                  <button onClick={() => openFullscreen(activeImg)} style={{ position: 'absolute', bottom: 12, right: isAr ? 'auto' : 12, left: isAr ? 12 : 'auto', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 10, padding: '7px 11px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', fontWeight: 600, backdropFilter: 'blur(4px)' }}>
                    <FiMaximize2 size={13} />{isAr ? 'عرض' : 'Expand'}
                  </button>

                  {/* Premium badge */}
                  {product.category === 'premium' && (
                    <span style={{ position: 'absolute', top: 12, right: isAr ? 'auto' : 12, left: isAr ? 12 : 'auto', background: 'linear-gradient(to left, #7b192c, #a82040)', color: '#f4be69', fontSize: '0.7rem', padding: '4px 12px', borderRadius: 50, fontWeight: 700 }}>Premium</span>
                  )}

                  {/* Rating */}
                  {avgRating !== null && (
                    <div style={{ position: 'absolute', top: 12, left: isAr ? 'auto' : 12, right: isAr ? 12 : 'auto', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', borderRadius: 50, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ color: '#f4be69', fontSize: '0.8rem', lineHeight: 1 }}>★</span>
                      <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.8rem' }}>{avgRating.toFixed(1)}</span>
                      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem' }}>({reviews.length})</span>
                    </div>
                  )}

                  {images.length > 1 && (
                    <>
                      <button onClick={prevImg} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 10, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', border: 'none', color: '#7b192c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                        <FiChevronRight size={18} />
                      </button>
                      <button onClick={nextImg} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 10, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', border: 'none', color: '#7b192c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                        <FiChevronLeft size={18} />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 100, height: 100, borderRadius: '50%', background: `${product.color}30` }} />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {images.map((img, idx) => (
                  <div key={idx} onClick={() => setActiveImg(idx)} style={{ width: 68, height: 68, borderRadius: 12, overflow: 'hidden', border: activeImg === idx ? '3px solid #7b192c' : '2px solid #E2C9A8', cursor: 'pointer', flexShrink: 0, transition: 'border-color 0.15s', opacity: activeImg === idx ? 1 : 0.7 }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
              <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', color: '#3E1C00', fontFamily: 'Amiri, serif', lineHeight: 1.3, flex: 1 }}>{name}</h1>
              <ShareButton url={window.location.href} title={isAr ? `${name} — أرومينا للبهارات 🌶️` : `${name} — Aromena Spices 🌶️`} isAr={isAr} />
            </div>

            {origin && (
              <p style={{ color: '#9C6B4E', fontSize: '0.85rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
                <FiMapPin size={13} color="#7b192c" /> {origin}
              </p>
            )}

            <p style={{ color: '#6B3A2A', lineHeight: 1.8, marginBottom: 22, fontSize: '0.92rem' }}>{desc}</p>

            {/* الأحجام */}
            {productSizes.length > 0 && (
              <div style={{ marginBottom: 22 }}>
                <p style={{ color: '#3E1C00', fontWeight: 700, marginBottom: 10, fontSize: '0.9rem' }}>{t('products.size')}:</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {productSizes.map(s => {
                    const sd = calcDiscount(s.price, product.discount, product.discountExpiry)
                    const isSelected = selectedSize === s.label
                    return (
                      <button key={s.label} onClick={() => setSelectedSize(s.label)} style={{ padding: '10px 18px', borderRadius: 12, border: '2px solid', borderColor: isSelected ? '#7b192c' : '#E2C9A8', background: isSelected ? 'linear-gradient(135deg, #7b192c, #a82040)' : '#fff', color: isSelected ? '#f4be69' : '#6B3A2A', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Amiri, serif', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 68, boxShadow: isSelected ? '0 4px 12px rgba(123,25,44,0.25)' : 'none' }}>
                        <span>{s.label}</span>
                        {sd.has ? (
                          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <span style={{ textDecoration: 'line-through', fontSize: '0.65rem', color: isSelected ? 'rgba(244,190,105,0.6)' : '#9C6B4E' }}>{formatPrice(s.price)}</span>
                            <span style={{ fontSize: '0.78rem', color: isSelected ? '#FCA5A5' : '#DC2626', fontWeight: 900 }}>{formatPrice(sd.final)}</span>
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: isSelected ? 'rgba(244,190,105,0.9)' : '#7b192c', fontWeight: 700 }}>{formatPrice(s.price)}</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* السعر الكبير */}
            {price > 0 && (
              <div style={{ marginBottom: 16 }}>
                {disc.has ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ color: '#9C6B4E', textDecoration: 'line-through', fontSize: '1.1rem', fontWeight: 600 }}>{formatPrice(price)}</span>
                    <span style={{ color: '#DC2626', fontWeight: 900, fontSize: '1.8rem', fontFamily: 'Amiri, serif' }}>{formatPrice(disc.final)}</span>
                    <span style={{ background: '#DC2626', color: '#fff', fontSize: '0.78rem', fontWeight: 700, padding: '4px 12px', borderRadius: 50 }}>
                      {isAr ? `خصم ${disc.pct}%` : `${disc.pct}% OFF`}
                    </span>
                  </div>
                ) : (
                  <p style={{ color: '#7b192c', fontWeight: 900, fontSize: '1.6rem', fontFamily: 'Amiri, serif' }}>{formatPrice(price)}</p>
                )}
              </div>
            )}

            {/* الكمية */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <p style={{ color: '#3E1C00', fontWeight: 700, fontSize: '0.9rem' }}>{isAr ? 'الكمية:' : 'Qty:'}</p>
              <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 50, border: '2px solid #E2C9A8', overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 38, height: 38, background: 'none', border: 'none', color: '#3E1C00', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiMinus size={14} /></button>
                <span style={{ width: 38, textAlign: 'center', fontWeight: 700, color: '#3E1C00', fontSize: '0.95rem' }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} style={{ width: 38, height: 38, background: 'none', border: 'none', color: '#3E1C00', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiPlus size={14} /></button>
              </div>
            </div>

            <button onClick={handleAdd} disabled={!selectedSize} style={{ width: '100%', background: added ? '#16A34A' : !selectedSize ? '#E2C9A8' : 'linear-gradient(135deg, #7b192c, #a82040)', color: added ? '#fff' : !selectedSize ? '#9C6B4E' : '#f4be69', padding: '11px 0', borderRadius: 12, fontWeight: 700, fontSize: '0.92rem', border: 'none', cursor: selectedSize ? 'pointer' : 'not-allowed', transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, fontFamily: 'Amiri, serif', boxShadow: selectedSize && !added ? '0 6px 20px rgba(123,25,44,0.3)' : 'none', marginBottom: 16 }}>
              {added ? t('products.added') : <><FiShoppingCart size={18} /> {t('products.add_cart')}</>}
            </button>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[isAr ? '100% طبيعي' : '100% Natural', isAr ? 'شحن سريع' : 'Fast Shipping'].map((b, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid #E2C9A8', padding: '5px 12px', borderRadius: 50, fontSize: '0.75rem', color: '#7b192c', fontWeight: 600 }}>{b}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '9px 16px', borderRadius: 10, border: '2px solid', borderColor: activeTab === tab.id ? '#7b192c' : '#E2C9A8', background: activeTab === tab.id ? 'linear-gradient(to left, #7b192c, #a82040)' : '#fff', color: activeTab === tab.id ? '#f4be69' : '#6B3A2A', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Amiri, serif', transition: 'all 0.2s' }}>
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: '24px', border: '1px solid #E2C9A8', boxShadow: '0 2px 12px rgba(123,25,44,0.05)' }}>
            {activeTab === 'desc' && <p style={{ color: '#6B3A2A', lineHeight: 2, fontSize: '0.95rem' }}>{descLong || desc || (isAr ? 'لا يوجد وصف.' : 'No description available.')}</p>}
            {activeTab === 'ingredients' && (ingredients ? <p style={{ color: '#6B3A2A', lineHeight: 2 }}>{ingredients}</p> : <p style={{ color: '#9C6B4E' }}>{isAr ? 'لم تُضف المكوّنات بعد.' : 'Not added yet.'}</p>)}
            {activeTab === 'usage' && (usage ? <p style={{ color: '#6B3A2A', lineHeight: 2 }}>{usage}</p> : <p style={{ color: '#9C6B4E' }}>{isAr ? 'لم تُضف طريقة الاستخدام بعد.' : 'Not added yet.'}</p>)}


            {activeTab === 'reviews' && (
              <div>
                {reviews.length > 0 && avgRating !== null && (
                  <div style={{ display: 'flex', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
                    <div style={{ background: starBg(avgRating), borderRadius: 20, padding: '20px 28px', textAlign: 'center', border: `1px solid ${starColor(avgRating)}22`, flexShrink: 0 }}>
                      <p style={{ color: starColor(avgRating), fontWeight: 900, fontSize: '3rem', lineHeight: 1, marginBottom: 6 }}>{avgRating.toFixed(1)}</p>
                      {renderStars(Math.round(avgRating), 20)}
                      <p style={{ color: '#9C6B4E', fontSize: '0.78rem', marginTop: 6 }}>{reviews.length} {isAr ? 'تقييم' : 'reviews'}</p>
                    </div>
                    <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 7 }}>
                      {[5,4,3,2,1].map(star => {
                        const count = reviews.filter(r => Math.round(r.rating) === star).length
                        const pct   = reviews.length ? (count / reviews.length) * 100 : 0
                        return (
                          <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ color: '#9C6B4E', fontSize: '0.75rem', minWidth: 10, fontWeight: 700 }}>{star}</span>
                            <span style={{ color: '#f4be69', fontSize: '0.78rem' }}>★</span>
                            <div style={{ flex: 1, height: 8, background: '#F5E6D3', borderRadius: 50, overflow: 'hidden' }}>
                              <div style={{ height: '100%', borderRadius: 50, background: 'linear-gradient(to left, #7b192c, #a82040)', width: `${pct}%`, transition: 'width 0.6s ease' }} />
                            </div>
                            <span style={{ color: '#9C6B4E', fontSize: '0.73rem', minWidth: 16 }}>{count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {user ? (
                  <div style={{ background: '#fdf0f2', borderRadius: 16, padding: '18px 20px', marginBottom: 24, border: '1px solid #F0D4D8' }}>
                    <h4 style={{ color: '#3E1C00', fontWeight: 700, marginBottom: 14, fontSize: '0.95rem', fontFamily: 'Amiri, serif' }}>{isAr ? 'أضف تقييمك' : 'Add Your Review'}</h4>
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ color: '#6B3A2A', fontSize: '0.82rem', marginBottom: 7, fontWeight: 600 }}>{isAr ? 'تقييمك:' : 'Your Rating:'}</p>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {[1,2,3,4,5].map(star => (
                          <button key={star} onClick={() => setReviewForm(f => ({ ...f, rating: star }))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', padding: 0, lineHeight: 1, color: star <= reviewForm.rating ? '#f4be69' : '#E2C9A8', transition: 'color 0.15s, transform 0.1s' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                          >★</button>
                        ))}
                      </div>
                    </div>
                    <textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} placeholder={isAr ? 'شاركنا تجربتك...' : 'Share your experience...'} rows={3}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '2px solid #E2C9A8', fontSize: '0.88rem', color: '#3E1C00', fontFamily: 'Amiri, serif', outline: 'none', background: '#fff', boxSizing: 'border-box', resize: 'vertical', marginBottom: 12 }}
                    />
                    <button onClick={submitReview} disabled={submittingReview || !reviewForm.comment.trim()} style={{ background: submittingReview || !reviewForm.comment.trim() ? '#E2C9A8' : 'linear-gradient(to left, #7b192c, #a82040)', color: submittingReview || !reviewForm.comment.trim() ? '#9C6B4E' : '#f4be69', padding: '10px 24px', borderRadius: 50, fontWeight: 700, fontSize: '0.88rem', border: 'none', cursor: submittingReview || !reviewForm.comment.trim() ? 'not-allowed' : 'pointer', fontFamily: 'Amiri, serif' }}>
                      {submittingReview ? (isAr ? 'جاري الإرسال...' : 'Submitting...') : (isAr ? 'إرسال التقييم' : 'Submit Review')}
                    </button>
                  </div>
                ) : (
                  <div style={{ background: '#fdf0f2', borderRadius: 14, padding: '16px', marginBottom: 24, textAlign: 'center' }}>
                    <p style={{ color: '#7b192c', fontWeight: 600, fontSize: '0.88rem', marginBottom: 10 }}>{isAr ? 'سجّل دخولك لإضافة تقييم' : 'Login to add a review'}</p>
                    <Link to="/login" style={{ background: 'linear-gradient(to left, #7b192c, #a82040)', color: '#f4be69', padding: '8px 22px', borderRadius: 50, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>{isAr ? 'دخول' : 'Login'}</Link>
                  </div>
                )}

                {reviews.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: '#9C6B4E' }}>
                    <p>{isAr ? 'لا يوجد تقييمات بعد — كن أول من يقيّم!' : 'No reviews yet — be the first!'}</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {reviews.map(review => (
                      <div key={review.id} style={{ background: '#FFFBF5', borderRadius: 16, padding: '16px 18px', border: `1px solid ${starColor(review.rating)}22`, boxShadow: '0 2px 8px rgba(123,25,44,0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #7b192c, #a82040)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f4be69', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                              {review.userName?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p style={{ color: '#3E1C00', fontWeight: 700, fontSize: '0.9rem', marginBottom: 3 }}>{review.userName}</p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {renderStars(review.rating, 14)}
                                <span style={{ background: starBg(review.rating), color: starColor(review.rating), padding: '2px 8px', borderRadius: 50, fontSize: '0.7rem', fontWeight: 700, border: `1px solid ${starColor(review.rating)}33` }}>{review.rating}/5</span>
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ color: '#9C6B4E', fontSize: '0.72rem' }}>{new Date(review.createdAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            {isAdmin && <button onClick={() => deleteReview(review.id)} style={{ width: 28, height: 28, borderRadius: 7, background: '#FEE2E2', border: 'none', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiTrash2 size={12} /></button>}
                          </div>
                        </div>
                        <p style={{ color: '#6B3A2A', fontSize: '0.88rem', lineHeight: 1.7, paddingRight: isAr ? 50 : 0, paddingLeft: isAr ? 0 : 50 }}>{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1.3rem', color: '#3E1C00', fontFamily: 'Amiri, serif', marginBottom: 18 }}>{isAr ? 'منتجات مشابهة' : 'Related Products'}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))', gap: 14 }}>
              {related.map(p => {
                const minPrice = p.sizes?.length ? Math.min(...p.sizes.map(s => s.price || 0)) : p.prices ? Math.min(...Object.values(p.prices).filter(v => v > 0)) : 0
                const rd = calcDiscount(minPrice, p.discount, p.discountExpiry)
                return (
                  <Link key={p.slug || p.id} to={`/products/${p.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #E2C9A8', boxShadow: '0 2px 8px rgba(123,25,44,0.05)', transition: 'transform 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <div style={{ height: 110, overflow: 'hidden', background: `linear-gradient(135deg, ${p.color}18, ${p.color}35)`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {(p.images?.[0] || p.image) ? <img src={p.images?.[0] || p.image} alt={isAr ? p.name_ar : p.name_en} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${p.color}30` }} />}
                        {rd.has && <span style={{ position: 'absolute', top: 6, left: 6, background: '#DC2626', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '2px 6px', borderRadius: 50 }}>-{p.discount}%</span>}
                      </div>
                      <div style={{ padding: '10px 11px' }}>
                        <p style={{ color: '#3E1C00', fontWeight: 700, fontSize: '0.84rem', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{isAr ? p.name_ar : p.name_en}</p>
                        {minPrice > 0 && (
                          rd.has ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                              <span style={{ color: '#9C6B4E', textDecoration: 'line-through', fontSize: '0.72rem' }}>{formatPrice(minPrice)}</span>
                              <span style={{ color: '#DC2626', fontWeight: 700, fontSize: '0.82rem' }}>{formatPrice(rd.final)}</span>
                            </div>
                          ) : (
                            <p style={{ color: '#7b192c', fontWeight: 700, fontSize: '0.8rem' }}>{isAr ? 'من' : 'from'} {formatPrice(minPrice)}</p>
                          )
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}