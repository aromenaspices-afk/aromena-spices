import { useState } from 'react'
import { FiEdit2, FiCheck, FiX, FiUpload, FiPlus, FiTrash2, FiPackage, FiTag } from 'react-icons/fi'
import { uploadImage } from '../../utils/cloudinary'
import { useCollection, saveDoc, deleteDocument } from '../../hooks/useFirestore'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '../../firebase'
import toast from 'react-hot-toast'

const BORDEAUX = '#7b192c'
const GOLD     = '#f4be69'
const BG       = '#F5E6D3'
const BG2      = '#EDD9C0'
const CARD     = '#ffffff'
const TEXT     = '#3E1C00'
const TEXT2    = '#9C6B4E'
const BORDER   = '#E2C9A8'

const inputStyle = {
  width: '100%', padding: '10px 12px',
  borderRadius: 10, border: `2px solid ${BORDER}`,
  fontSize: '0.88rem', color: TEXT,
  fontFamily: 'Amiri, serif', outline: 'none',
  background: '#FFFBF5', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}
const labelStyle = { color: TEXT, fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 5 }

function FInput({ value, onChange, ...props }) {
  return <input value={value} onChange={onChange} style={inputStyle}
    onFocus={e => e.target.style.borderColor = BORDEAUX}
    onBlur={e => e.target.style.borderColor = BORDER} {...props} />
}

const emptyForm = {
  name_ar: '', name_en: '', desc_ar: '', desc_en: '',
  tag_ar: '', tag_en: '', price: 0, emoji: '🎁',
  color: '#7b192c', images: [], image: null, items: [],
  discount: 0, discountExpiry: '',
  weightKg: 0.6,
}

export default function AdminPackages() {
  const { data: packages, loading: pkgLoading } = useCollection('packages')
  const { data: products, loading: prodLoading } = useCollection('products')

  const [editing,        setEditing]        = useState(null)
  const [form,           setForm]           = useState(null)
  const [uploadingIdx,   setUploadingIdx]   = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [saving,         setSaving]         = useState(false)
  const [showAdd,        setShowAdd]        = useState(false)

  function openEdit(pkg) {
    setEditing(pkg.id)
    // حوّل image القديمة لـ images array
    const images = pkg.images?.length ? pkg.images : (pkg.image ? [pkg.image] : [])
    setForm({ ...emptyForm, ...pkg, images })
    setShowAdd(false)
  }

  function openAdd() {
    setEditing('__new__')
    setForm({ ...emptyForm })
    setShowAdd(true)
  }

  async function handleSave() {
    if (!form.name_ar) { toast.error('اسم الباقة مطلوب'); return }
    setSaving(true)
    try {
      const data = { ...form, image: form.images?.[0] || null, discount: +form.discount || 0, discountExpiry: form.discountExpiry || null, weightKg: +form.weightKg || 0.6 }
      if (showAdd) {
        await addDoc(collection(db, 'packages'), data)
        toast.success('تمت إضافة الباقة! 🎉')
      } else {
        await saveDoc('packages', editing, data)
        toast.success('تم حفظ الباقة!')
      }
      setEditing(null); setForm(null); setShowAdd(false)
    } catch (err) {
      toast.error('فشل الحفظ: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('حذف هذه الباقة نهائياً؟')) return
    try {
      await deleteDocument('packages', id)
      toast.success('تم حذف الباقة')
    } catch (err) {
      toast.error('فشل الحذف: ' + err.message)
    }
  }

  function toggleItem(slug) {
    setForm(f => {
      const current = f.items || []
      if (current.includes(slug)) return { ...f, items: current.filter(s => s !== slug) }
      return { ...f, items: [...current, slug] }
    })
  }

  async function handleImageUpload(file) {
    if (!file || (form.images?.length || 0) >= 5) return
    setUploadingIdx(form.images?.length || 0)
    setUploadProgress(0)
    try {
      const url = await uploadImage(file, p => setUploadProgress(p))
      setForm(f => ({ ...f, images: [...(f.images || []), url] }))
    } catch {
      toast.error('فشل رفع الصورة')
    } finally {
      setUploadingIdx(null)
    }
  }

  function removeImage(idx) {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))
  }

  const loading = pkgLoading || prodLoading
  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
      {[1,2,3].map(i => <div key={i} style={{ height: 280, borderRadius: 20, background: BG, opacity: 0.5 }} />)}
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', color: TEXT, fontFamily: 'Amiri, serif' }}>الباقات</h1>
          <p style={{ color: TEXT2, fontSize: '0.85rem' }}>{packages.length} باقات</p>
        </div>
        <button onClick={openAdd} style={{ background: `linear-gradient(to left, ${BORDEAUX}, #a82040)`, color: GOLD, padding: '10px 20px', borderRadius: 50, fontWeight: 700, fontSize: '0.88rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Amiri, serif', boxShadow: '0 4px 14px rgba(123,25,44,0.25)' }}>
          <FiPlus size={16} /> إضافة باقة
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {packages.map(pkg => {
          const pkgProducts = (pkg.items || []).map(slug => products.find(p => p.slug === slug)).filter(Boolean)
          const imgs = pkg.images?.length ? pkg.images : (pkg.image ? [pkg.image] : [])
          return (
            <div key={pkg.id} style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, boxShadow: '0 2px 14px rgba(62,28,0,0.06)', overflow: 'hidden' }}>
              <div style={{ height: 140, overflow: 'hidden', background: `linear-gradient(135deg, ${pkg.color}18, ${pkg.color}35)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {imgs[0]
                  ? <img src={imgs[0]} alt={pkg.name_ar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '3.5rem' }}>{pkg.emoji || '🎁'}</span>
                }
                {imgs.length > 1 && (
                  <span style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: 50 }}>
                    {imgs.length} صور
                  </span>
                )}
              </div>
              <div style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <h3 style={{ color: TEXT, fontWeight: 700, fontSize: '1rem', marginBottom: 2 }}>{pkg.name_ar}</h3>
                    <p style={{ color: TEXT2, fontSize: '0.78rem' }}>{pkg.name_en}</p>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ color: BORDEAUX, fontWeight: 900, fontSize: '1.1rem', display: 'block' }}>₺{pkg.price}</span>
                    <span style={{ color: '#9C6B4E', fontSize: '0.7rem' }}>{pkg.weightKg || 0.6} كغ</span>
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <p style={{ color: TEXT, fontSize: '0.78rem', fontWeight: 700, marginBottom: 6 }}>المحتوى ({pkgProducts.length} منتج):</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {pkgProducts.slice(0,3).map(p => (
                      <div key={p.slug} style={{ display: 'flex', alignItems: 'center', gap: 8, background: BG, borderRadius: 8, padding: '5px 10px' }}>
                        {(p.images?.[0] || p.image) ? <img src={p.images?.[0] || p.image} alt="" style={{ width: 20, height: 20, borderRadius: 4, objectFit: 'cover' }} /> : <FiPackage size={12} color={TEXT2} />}
                        <span style={{ color: TEXT, fontSize: '0.8rem', fontWeight: 600 }}>{p.name_ar}</span>
                      </div>
                    ))}
                    {pkgProducts.length > 3 && <p style={{ color: TEXT2, fontSize: '0.75rem' }}>+{pkgProducts.length - 3} منتجات أخرى</p>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => openEdit(pkg)} style={{ flex: 1, background: 'rgba(123,25,44,0.07)', border: '1px solid rgba(123,25,44,0.15)', borderRadius: 10, padding: '8px 0', color: BORDEAUX, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: 'Amiri, serif' }}>
                    <FiEdit2 size={13} /> تعديل
                  </button>
                  <button onClick={() => handleDelete(pkg.id)} style={{ width: 36, height: 36, borderRadius: 10, background: '#FEE2E2', border: 'none', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, padding: '20px 24px', marginTop: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(123,25,44,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>🎨</div>
        <div>
          <h3 style={{ color: TEXT, fontWeight: 700, fontSize: '1rem', marginBottom: 3 }}>باقة مخصصة للزبون</h3>
          <p style={{ color: TEXT2, fontSize: '0.84rem' }}>يختار الزبون البهارات من تشكيلتنا بنفسه</p>
        </div>
      </div>

      {editing && form && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: 20 }}>
          <div style={{ background: CARD, borderRadius: 22, padding: '26px 22px', width: '100%', maxWidth: 580, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ color: TEXT, fontFamily: 'Amiri, serif', fontSize: '1.1rem' }}>{showAdd ? 'إضافة باقة جديدة' : 'تعديل الباقة'}</h2>
              <button onClick={() => { setEditing(null); setShowAdd(false) }} style={{ background: BG, border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: TEXT2 }}><FiX size={16} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* صور متعددة */}
              <div>
                <label style={labelStyle}>صور الباقة (حتى 5) — الأولى هي الرئيسية</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {(form.images || []).map((img, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                      <img src={img} alt="" style={{ width: 80, height: 80, borderRadius: 10, objectFit: 'cover', border: idx === 0 ? `3px solid ${BORDEAUX}` : `2px solid ${BORDER}` }} />
                      {idx === 0 && <span style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)', background: BORDEAUX, color: GOLD, fontSize: '0.58rem', padding: '2px 6px', borderRadius: 50, whiteSpace: 'nowrap', fontWeight: 700 }}>رئيسية</span>}
                      <button onClick={() => removeImage(idx)} style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22, borderRadius: '50%', background: '#DC2626', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiX size={10} />
                      </button>
                    </div>
                  ))}
                  {(form.images?.length || 0) < 5 && (
                    <div onClick={() => document.getElementById('pkg-imgs-input').click()} style={{ width: 80, height: 80, borderRadius: 10, border: `2px dashed ${BORDER}`, background: '#FFFBF5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 4 }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = BORDEAUX}
                      onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
                    >
                      {uploadingIdx !== null ? <div style={{ fontSize: '0.7rem', color: BORDEAUX, fontWeight: 700 }}>{uploadProgress}%</div> : <><FiUpload size={18} color={BORDEAUX} /><span style={{ fontSize: '0.65rem', color: TEXT2 }}>إضافة</span></>}
                    </div>
                  )}
                </div>
                <input id="pkg-imgs-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e.target.files[0])} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={labelStyle}>الاسم بالعربي *</label><FInput value={form.name_ar} onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))} /></div>
                <div><label style={labelStyle}>الاسم بالإنجليزي</label><FInput value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={labelStyle}>الوصف بالعربي</label><FInput value={form.desc_ar} onChange={e => setForm(f => ({ ...f, desc_ar: e.target.value }))} /></div>
                <div><label style={labelStyle}>الوصف بالإنجليزي</label><FInput value={form.desc_en} onChange={e => setForm(f => ({ ...f, desc_en: e.target.value }))} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={labelStyle}>الوسم بالعربي</label><FInput value={form.tag_ar} onChange={e => setForm(f => ({ ...f, tag_ar: e.target.value }))} placeholder="الأكثر مبيعاً" /></div>
                <div><label style={labelStyle}>الوسم بالإنجليزي</label><FInput value={form.tag_en} onChange={e => setForm(f => ({ ...f, tag_en: e.target.value }))} placeholder="Best Seller" /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>السعر ₺</label>
                  <FInput type="number" min={0} step={1} value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} placeholder="0" />
                </div>
                <div>
                  <label style={labelStyle}>الوزن (كغ)</label>
                  <FInput type="number" min={0.1} step={0.1} value={form.weightKg || 0.6} onChange={e => setForm(f => ({ ...f, weightKg: +e.target.value }))} placeholder="0.6" />
                  <p style={{ color: '#9C6B4E', fontSize: '0.7rem', marginTop: 3 }}>افتراضي: 0.6</p>
                </div>
                <div><label style={labelStyle}>الإيموجي</label><FInput value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} /></div>
                <div><label style={labelStyle}>اللون</label><input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ width: '100%', height: 42, borderRadius: 10, border: `2px solid ${BORDER}`, cursor: 'pointer', padding: 2 }} /></div>
              </div>

              <div>
                <label style={{ ...labelStyle, marginBottom: 8 }}>محتوى الباقة <span style={{ color: TEXT2, fontWeight: 400, fontSize: '0.78rem' }}>({form.items?.length || 0} منتج)</span></label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8, maxHeight: 240, overflowY: 'auto', padding: 2 }}>
                  {products.map(p => {
                    const isSelected = form.items?.includes(p.slug)
                    return (
                      <button key={p.slug || p.id} onClick={() => toggleItem(p.slug)} style={{ padding: '8px 10px', borderRadius: 10, border: '2px solid', borderColor: isSelected ? BORDEAUX : BORDER, background: isSelected ? 'rgba(123,25,44,0.07)' : CARD, color: isSelected ? BORDEAUX : '#6B3A2A', fontWeight: isSelected ? 700 : 400, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Amiri, serif', transition: 'all 0.15s' }}>
                        {isSelected && <FiCheck size={11} color={BORDEAUX} />}
                        {(p.images?.[0] || p.image) && !isSelected && <img src={p.images?.[0] || p.image} alt="" style={{ width: 18, height: 18, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />}
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name_ar}</span>
                      </button>
                    )
                  })}
                </div>
                {form.items?.length > 0 && (
                  <div style={{ marginTop: 10, background: BG, borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {form.items.map(slug => {
                        const p = products.find(pr => pr.slug === slug)
                        return p ? (
                          <span key={slug} style={{ background: '#fff', border: `1.5px solid ${BORDEAUX}`, color: BORDEAUX, padding: '3px 10px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            {p.name_ar}
                            <button onClick={() => toggleItem(slug)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: BORDEAUX, display: 'flex' }}><FiX size={10} /></button>
                          </span>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
              </div>


              {/* ═══ قسم العروض ═══ */}
              <div style={{ background: '#FFFBF0', borderRadius: 14, padding: '16px', border: '2px solid #FDE68A' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <FiTag size={16} color="#D97706" />
                  <h3 style={{ color: '#92400E', fontWeight: 700, fontSize: '0.92rem', fontFamily: 'Amiri, serif' }}>العروض والخصومات</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ color: '#92400E', fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 5 }}>نسبة الخصم % (0 = بدون خصم)</label>
                    <FInput type="number" min={0} max={90} step={1} value={form.discount} onChange={e => setForm(f => ({ ...f, discount: Math.min(90, Math.max(0, +e.target.value)) }))} placeholder="0" />
                    {form.discount > 0 && <p style={{ color: '#16A34A', fontSize: '0.78rem', marginTop: 4, fontWeight: 600 }}>✅ خصم {form.discount}% نشط</p>}
                  </div>
                  <div>
                    <label style={{ color: '#92400E', fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 5 }}>تاريخ انتهاء العرض (اختياري)</label>
                    <FInput type="date" value={form.discountExpiry} onChange={e => setForm(f => ({ ...f, discountExpiry: e.target.value }))} min={new Date().toISOString().split('T')[0]} />
                    {form.discountExpiry && <p style={{ color: '#9C6B4E', fontSize: '0.75rem', marginTop: 4 }}>ينتهي: {new Date(form.discountExpiry).toLocaleDateString('ar-SA')}</p>}
                  </div>
                </div>
                {form.discount > 0 && (
                  <button onClick={() => setForm(f => ({ ...f, discount: 0, discountExpiry: '' }))} style={{ marginTop: 10, background: '#FEE2E2', border: 'none', borderRadius: 8, padding: '6px 14px', color: '#DC2626', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'Amiri, serif' }}>
                    إلغاء العرض
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={handleSave} disabled={uploadingIdx !== null || saving} style={{ flex: 1, background: uploadingIdx !== null || saving ? BG2 : `linear-gradient(to left, ${BORDEAUX}, #a82040)`, color: uploadingIdx !== null || saving ? TEXT2 : GOLD, padding: '12px 0', borderRadius: 12, fontWeight: 700, fontSize: '0.92rem', border: 'none', cursor: uploadingIdx !== null || saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'Amiri, serif' }}>
                  <FiCheck size={15} />{saving ? 'جاري الحفظ...' : showAdd ? 'إضافة الباقة' : 'حفظ التعديلات'}
                </button>
                <button onClick={() => { setEditing(null); setShowAdd(false) }} style={{ padding: '12px 18px', borderRadius: 12, border: `2px solid ${BORDER}`, background: CARD, color: TEXT2, cursor: 'pointer', fontFamily: 'Amiri, serif', fontSize: '0.88rem' }}>إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}