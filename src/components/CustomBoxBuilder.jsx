import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useCart } from '../context/CartContext'
import { useCollection } from '../hooks/useFirestore'
import { useCurrency } from '../context/CurrencyContext'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { FiCheck, FiShoppingCart, FiPackage, FiPlus, FiMinus } from 'react-icons/fi'
import toast from 'react-hot-toast'

const DEFAULT_BOX = {
  name_ar: 'باقتي المخصصة', name_en: 'My Custom Box',
  desc_ar: 'اختر 4 بهارات من تشكيلتنا', desc_en: 'Choose 4 spices',
  price: 0, weightKg: 0.6, image: null, active: true, slots: 4,
}

export default function CustomBoxBuilder() {
  const { i18n } = useTranslation()
  const isAr = i18n.language === 'ar'
  const { addItem } = useCart()
  const { data: products } = useCollection('products')
  const { formatPrice } = useCurrency()

  const [boxConfig, setBoxConfig] = useState(null)
  const [selected, setSelected]   = useState([]) // [{ product, qty }]
  const [added, setAdded]         = useState(false)

  useEffect(() => {
    getDoc(doc(db, 'settings', 'custom_box')).then(snap => {
      setBoxConfig(snap.exists() ? { ...DEFAULT_BOX, ...snap.data() } : DEFAULT_BOX)
    })
  }, [])

  if (!boxConfig || !boxConfig.active) return null

  const SLOTS = boxConfig.slots || 4
  const totalSelected = selected.reduce((s, i) => s + i.qty, 0)
  const remaining = SLOTS - totalSelected
  const isFull = totalSelected === SLOTS

  // كم مرة اخترنا هذا المنتج
  function getQty(slug) {
    return selected.find(s => s.product.slug === slug)?.qty || 0
  }

  function addProduct(p) {
    if (isFull) { toast.error(isAr ? `الباكج يتسع ${SLOTS} قطع فقط` : `Box fits only ${SLOTS} items`); return }
    setSelected(prev => {
      const ex = prev.find(s => s.product.slug === p.slug)
      if (ex) return prev.map(s => s.product.slug === p.slug ? { ...s, qty: s.qty + 1 } : s)
      return [...prev, { product: p, qty: 1 }]
    })
  }

  function removeProduct(slug) {
    setSelected(prev => {
      const ex = prev.find(s => s.product.slug === slug)
      if (!ex) return prev
      if (ex.qty <= 1) return prev.filter(s => s.product.slug !== slug)
      return prev.map(s => s.product.slug === slug ? { ...s, qty: s.qty - 1 } : s)
    })
  }

  function handleAddToCart() {
    if (totalSelected !== SLOTS) return
    const details = selected.map(s => ({
      name: isAr ? s.product.name_ar : s.product.name_en,
      qty: s.qty,
      image: s.product.images?.[0] || s.product.image || null,
    }))
    addItem({
      id: `custom_box_${Date.now()}`,
      productId: 'custom_box',
      isPackage: true,
      isCustomBox: true,
      name: isAr ? boxConfig.name_ar : boxConfig.name_en,
      size: isAr ? `${SLOTS} قطع مخصصة` : `${SLOTS} custom items`,
      price: boxConfig.price,
      image: boxConfig.image || null,
      weightKg: boxConfig.weightKg || 0.6,
      pkgItems: details,
    })
    setAdded(true)
    setTimeout(() => { setAdded(false); setSelected([]) }, 2000)
    toast.success(isAr ? '✅ تمت إضافة باقتك للسلة!' : '✅ Custom box added to cart!')
  }

  const BORDEAUX = '#7b192c'
  const GOLD = '#f4be69'
  const BG = '#F5E6D3'
  const BORDER = '#E2C9A8'

  return (
    <div style={{ background: '#fff', borderRadius: 24, border: `1px solid ${BORDER}`, overflow: 'hidden', marginTop: 40 }}>

      {/* الهيدر */}
      <div style={{ background: `linear-gradient(135deg, #1a0610, ${BORDEAUX})`, padding: '28px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(244,190,105,0.15)', border: '1px solid rgba(244,190,105,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiPackage size={20} color={GOLD} />
          </div>
          <div>
            <h3 style={{ color: GOLD, fontFamily: 'Amiri, serif', fontSize: '1.1rem', fontWeight: 700 }}>
              {isAr ? boxConfig.name_ar : boxConfig.name_en}
            </h3>
            <p style={{ color: 'rgba(244,190,105,0.55)', fontSize: '0.78rem' }}>
              {isAr ? boxConfig.desc_ar : boxConfig.desc_en}
            </p>
          </div>
        </div>

        {/* شريط التقدم */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: 'rgba(244,190,105,0.7)', fontSize: '0.78rem' }}>
              {isAr ? `اخترت ${totalSelected} من ${SLOTS}` : `${totalSelected} of ${SLOTS} selected`}
            </span>
            <span style={{ color: isFull ? '#4ade80' : 'rgba(244,190,105,0.5)', fontSize: '0.78rem', fontWeight: 600 }}>
              {isFull ? (isAr ? '✓ الباكج جاهز!' : '✓ Box ready!') : (isAr ? `${remaining} متبقي` : `${remaining} left`)}
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 50, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 50, background: isFull ? '#4ade80' : GOLD, width: `${(totalSelected / SLOTS) * 100}%`, transition: 'width 0.3s ease, background 0.3s ease' }} />
          </div>
        </div>

        {/* الفتحات */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          {Array.from({ length: SLOTS }).map((_, i) => {
            const flat = selected.flatMap(s => Array(s.qty).fill(s))
            const item = flat[i]
            return (
              <div key={i} style={{ width: 52, height: 52, borderRadius: 10, border: `2px solid ${item ? 'rgba(244,190,105,0.6)' : 'rgba(255,255,255,0.1)'}`, background: item ? 'rgba(244,190,105,0.1)' : 'rgba(255,255,255,0.04)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', position: 'relative' }}>
                {item?.product?.images?.[0] || item?.product?.image
                  ? <img src={item.product.images?.[0] || item.product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '1.2rem' }}>{i + 1}</span>
                }
              </div>
            )
          })}
        </div>
      </div>

      {/* قائمة المنتجات */}
      <div style={{ padding: '20px 20px 0' }}>
        <p style={{ color: '#3E1C00', fontWeight: 700, fontSize: '0.88rem', marginBottom: 14 }}>
          {isAr ? 'اختر من تشكيلتنا:' : 'Choose from our collection:'}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
          {products.map(p => {
            const qty = getQty(p.slug)
            const name = isAr ? p.name_ar : p.name_en
            const img = p.images?.[0] || p.image
            const canAdd = !isFull

            return (
              <div key={p.slug || p.id} style={{ background: qty > 0 ? '#fdf0f2' : BG, borderRadius: 14, overflow: 'hidden', border: `2px solid ${qty > 0 ? BORDEAUX : BORDER}`, transition: 'all 0.2s' }}>
                <div style={{ height: 90, overflow: 'hidden', position: 'relative', background: `${p.color || BORDEAUX}18` }}>
                  {img
                    ? <img src={img} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiPackage size={24} color="#9C6B4E" /></div>
                  }
                  {qty > 0 && (
                    <div style={{ position: 'absolute', top: 6, right: 6, background: BORDEAUX, color: GOLD, borderRadius: 50, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 900 }}>{qty}</div>
                  )}
                </div>
                <div style={{ padding: '8px 10px' }}>
                  <p style={{ color: '#1a0610', fontWeight: 600, fontSize: '0.78rem', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                  <p style={{ color: '#9C6B4E', fontSize: '0.68rem', marginBottom: 8 }}>100مل</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: qty > 0 ? 8 : 0 }}>
                    {qty > 0 && (
                      <button onClick={() => removeProduct(p.slug)} style={{ width: 24, height: 24, borderRadius: 6, background: '#FEE2E2', border: 'none', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiMinus size={11} />
                      </button>
                    )}
                    {qty > 0 && <span style={{ fontWeight: 700, fontSize: '0.82rem', color: BORDEAUX, minWidth: 16, textAlign: 'center' }}>{qty}</span>}
                    <button onClick={() => addProduct(p)} disabled={!canAdd && qty === 0} style={{ width: qty > 0 ? 24 : '100%', height: 24, borderRadius: 6, background: !canAdd && qty === 0 ? '#E2C9A8' : `linear-gradient(to left, ${BORDEAUX}, #a82040)`, border: 'none', color: GOLD, cursor: !canAdd && qty === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, fontSize: '0.7rem', fontWeight: 700, fontFamily: 'Amiri, serif' }}>
                      <FiPlus size={11} />
                      {qty === 0 && (isAr ? 'أضف' : 'Add')}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ملخص + زر */}
      <div style={{ padding: '20px' }}>
        {selected.length > 0 && (
          <div style={{ background: BG, borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
            <p style={{ color: '#3E1C00', fontWeight: 700, fontSize: '0.82rem', marginBottom: 8 }}>
              {isAr ? 'اختيارك:' : 'Your selection:'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {selected.map(s => (
                <span key={s.product.slug} style={{ background: '#fff', border: `1.5px solid ${BORDEAUX}`, color: BORDEAUX, padding: '3px 10px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 600 }}>
                  {isAr ? s.product.name_ar : s.product.name_en} {s.qty > 1 ? `×${s.qty}` : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p style={{ color: '#9C6B4E', fontSize: '0.85rem' }}>{isAr ? 'سعر الباكج:' : 'Box price:'}</p>
          <p style={{ color: BORDEAUX, fontWeight: 900, fontSize: '1.2rem', fontFamily: 'Amiri, serif' }}>{formatPrice(boxConfig.price)}</p>
        </div>

        <button onClick={handleAddToCart} disabled={!isFull || added} style={{
          width: '100%', padding: '14px 0', borderRadius: 14,
          background: added ? '#16A34A' : !isFull ? '#E2C9A8' : `linear-gradient(to left, ${BORDEAUX}, #a82040)`,
          color: added ? '#fff' : !isFull ? '#9C6B4E' : GOLD,
          fontWeight: 700, fontSize: '0.95rem', border: 'none',
          cursor: isFull && !added ? 'pointer' : 'not-allowed',
          fontFamily: 'Amiri, serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: isFull && !added ? '0 6px 20px rgba(123,25,44,0.3)' : 'none',
          transition: 'all 0.3s',
        }}>
          {added
            ? <><FiCheck size={16} /> {isAr ? 'تمت الإضافة!' : 'Added!'}</>
            : !isFull
              ? (isAr ? `اختر ${remaining} قطع أخرى` : `Select ${remaining} more items`)
              : <><FiShoppingCart size={16} /> {isAr ? 'أضف باقتي للسلة' : 'Add my box to cart'}</>
          }
        </button>
      </div>
    </div>
  )
}