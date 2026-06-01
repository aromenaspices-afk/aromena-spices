import toast from 'react-hot-toast'
import { useState } from 'react'
import { FiEdit2, FiTrash2, FiPlus, FiX, FiCheck, FiUpload, FiFile, FiTag } from 'react-icons/fi'
import { uploadImage } from '../../utils/cloudinary'
import { useCollection, saveDoc, deleteDocument } from '../../hooks/useFirestore'

const BORDEAUX = '#7b192c'
const GOLD     = '#f4be69'
const BG       = '#F5E6D3'
const BG2      = '#EDD9C0'
const CARD     = '#ffffff'
const TEXT     = '#3E1C00'
const TEXT2    = '#9C6B4E'
const BORDER   = '#E2C9A8'

const emptySize = { label: '', value: '', unit: 'g', price_try: '' }
const categories = ['classic', 'blends', 'hot', 'premium']

const inputStyle = {
  width: '100%', padding: '10px 12px',
  borderRadius: 10, border: `2px solid ${BORDER}`,
  fontSize: '0.88rem', color: TEXT,
  fontFamily: 'Amiri, serif', outline: 'none',
  background: '#FFFBF5', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

const labelStyle = {
  color: TEXT, fontSize: '0.82rem',
  fontWeight: 600, display: 'block', marginBottom: 5,
}

function FInput({ value, onChange, ...props }) {
  return (
    <input value={value} onChange={onChange} style={inputStyle}
      onFocus={e => e.target.style.borderColor = BORDEAUX}
      onBlur={e => e.target.style.borderColor = BORDER}
      {...props}
    />
  )
}

function FTextarea({ value, onChange, ...props }) {
  return (
    <textarea value={value} onChange={onChange} style={{ ...inputStyle, resize: 'vertical' }}
      onFocus={e => e.target.style.borderColor = BORDEAUX}
      onBlur={e => e.target.style.borderColor = BORDER}
      {...props}
    />
  )
}

const emptyForm = {
  name_ar: '', name_en: '',
  desc_ar: '', desc_en: '',
  desc_long_ar: '', desc_long_en: '',
  ingredients_ar: '', ingredients_en: '',
  usage_ar: '', usage_en: '',
  origin_ar: '', origin_en: '',
  category: 'classic', color: '#C4956A',
  sizes: [{ ...emptySize }],
  images: [], pdf_url: null,
  discount: 0, discountExpiry: '',
}

export default function AdminProducts() {
  const { data: items, loading } = useCollection('products')
  const [editing,        setEditing]        = useState(null)
  const [showForm,       setShowForm]       = useState(false)
  const [uploadingIdx,   setUploadingIdx]   = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadingPdf,   setUploadingPdf]   = useState(false)
  const [saving,         setSaving]         = useState(false)
  const [form,           setForm]           = useState({ ...emptyForm })

  function openAdd() {
    setEditing(null)
    setForm({ ...emptyForm, sizes: [{ ...emptySize }] })
    setShowForm(true)
  }

  function openEdit(item) {
    setEditing(item.slug || item.id)
    let sizes = item.sizes || []
    if (!sizes.length && item.prices) {
      sizes = Object.entries(item.prices)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => ({ label: k, value: k.replace(/[^0-9]/g, ''), unit: k.includes('kg') ? 'kg' : 'g', price_try: v }))
    }
    if (!sizes.length) sizes = [{ ...emptySize }]
    setForm({
      name_ar: item.name_ar || '', name_en: item.name_en || '',
      desc_ar: item.desc_ar || '', desc_en: item.desc_en || '',
      desc_long_ar: item.desc_long_ar || '', desc_long_en: item.desc_long_en || '',
      ingredients_ar: item.ingredients_ar || '', ingredients_en: item.ingredients_en || '',
      usage_ar: item.usage_ar || '', usage_en: item.usage_en || '',
      origin_ar: item.origin_ar || '', origin_en: item.origin_en || '',
      category: item.category || 'classic',
      color: item.color || '#C4956A',
      sizes,
      images: item.images || (item.image ? [item.image] : []),
      pdf_url: item.pdf_url || null,
      discount: item.discount || 0,
      discountExpiry: item.discountExpiry || '',
      order: item.order ?? 99,
    })
    setShowForm(true)
  }

  function addSize() { setForm(f => ({ ...f, sizes: [...f.sizes, { ...emptySize }] })) }

  function removeSize(idx) {
    if (form.sizes.length <= 1) return
    setForm(f => ({ ...f, sizes: f.sizes.filter((_, i) => i !== idx) }))
  }

  function updateSize(idx, field, value) {
    setForm(f => {
      const sizes = [...f.sizes]
      sizes[idx] = { ...sizes[idx], [field]: value }
      if (field === 'value' || field === 'unit') sizes[idx].label = `${sizes[idx].value}${sizes[idx].unit}`
      return { ...f, sizes }
    })
  }

  async function handleImageUpload(file) {
    if (!file || form.images.length >= 5) return
    setUploadingIdx(form.images.length)
    setUploadProgress(0)
    try {
      const url = await uploadImage(file, p => setUploadProgress(p))
      setForm(f => ({ ...f, images: [...f.images, url] }))
    } catch { toast.error('فشل رفع الصورة') }
    finally { setUploadingIdx(null) }
  }

  async function handlePdfUpload(file) {
    if (!file) return
    setUploadingPdf(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'aromena_uploads')
      const res  = await fetch('https://api.cloudinary.com/v1_1/dvt0nntn7/auto/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.secure_url) setForm(f => ({ ...f, pdf_url: data.secure_url }))
      else toast.error('فشل رفع الـ PDF')
    } catch (err) { toast.error('فشل: ' + err.message) }
    finally { setUploadingPdf(false) }
  }

  function removeImage(idx) { setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) })) }

  async function handleSave() {
    if (!form.name_ar || !form.name_en) { toast.error('الاسم مطلوب'); return }
    if (form.sizes.some(s => !s.value || !s.price_try)) { toast.error('يرجى ملء جميع الأحجام والأسعار بالليرة'); return }
    setSaving(true)
    try {
      const slug  = editing || form.name_en.toLowerCase().replace(/\s+/g, '-')
      const sizes = form.sizes.map(s => ({ label: s.label || `${s.value}${s.unit}`, value: +s.value, unit: s.unit, price: +s.price_try || +s.price, price_try: +s.price_try || +s.price }))
      const prices = {}
      sizes.forEach(s => { prices[s.label] = s.price })
      const data = {
        ...form, id: slug, slug,
        image: form.images[0] || null, sizes, prices,
        discount: +form.discount || 0,
        discountExpiry: form.discountExpiry || null,
        order: +form.order ?? 99,
      }
      await saveDoc('products', slug, data)
      setShowForm(false)
      toast.success(editing ? 'تم تعديل المنتج!' : 'تم إضافة المنتج!')
    } catch (err) { toast.error('فشل الحفظ: ' + err.message) }
    finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('حذف المنتج؟')) return
    try { await deleteDocument('products', id); toast.success('تم الحذف') }
    catch (err) { toast.error('فشل: ' + err.message) }
  }

  // هل العرض نشط؟
  function isDiscountActive(item) {
    if (!item.discount || item.discount <= 0) return false
    if (item.discountExpiry && new Date(item.discountExpiry) < new Date()) return false
    return true
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[1,2,3,4].map(i => <div key={i} style={{ height: 64, borderRadius: 12, background: BG, opacity: 0.5 }} />)}
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', color: TEXT, fontFamily: 'Amiri, serif' }}>المنتجات</h1>
          <p style={{ color: TEXT2, fontSize: '0.85rem' }}>{items.length} منتج</p>
        </div>
        <button onClick={openAdd} style={{ background: `linear-gradient(to left, ${BORDEAUX}, #a82040)`, color: GOLD, padding: '10px 20px', borderRadius: 50, fontWeight: 700, fontSize: '0.88rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Amiri, serif', boxShadow: '0 4px 14px rgba(123,25,44,0.25)' }}>
          <FiPlus size={16} /> إضافة منتج
        </button>
      </div>

      {/* Table */}
      <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, boxShadow: '0 2px 12px rgba(62,28,0,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: BG }}>
                {['#', 'المنتج', 'الفئة', 'الأحجام', 'أقل سعر', 'العرض', 'الصور', ''].map((h, i) => (
                  <th key={i} style={{ padding: '12px 16px', textAlign: 'right', color: '#6B3A2A', fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: `1px solid ${BORDER}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((p, i) => {
                const sizes    = p.sizes || []
                const minPrice = sizes.length ? Math.min(...sizes.map(s => s.price || 0)) : (p.prices ? Math.min(...Object.values(p.prices).filter(v => v > 0)) : 0)
                const active   = isDiscountActive(p)
                return (
                  <tr key={p.slug || p.id} style={{ borderBottom: `1px solid ${BG}`, background: i % 2 === 0 ? CARD : '#FFFBF5' }}>
                    <td style={{ padding: '12px 16px', color: TEXT2, fontWeight: 700, fontSize: '0.85rem', textAlign: 'center' }}>{p.order ?? '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: `${p.color}25`, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                          {(p.images?.[0] || p.image) ? <img src={p.images?.[0] || p.image} alt={p.name_ar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🫙'}
                        </div>
                        <div>
                          <p style={{ color: TEXT, fontWeight: 700, fontSize: '0.88rem' }}>{p.name_ar}</p>
                          <p style={{ color: TEXT2, fontSize: '0.75rem' }}>{p.name_en}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: 'rgba(123,25,44,0.07)', color: BORDEAUX, padding: '3px 10px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 600 }}>{p.category}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {(sizes.length ? sizes : Object.keys(p.prices || {})).slice(0, 3).map((s, si) => (
                          <span key={si} style={{ background: BG, color: '#6B3A2A', padding: '2px 7px', borderRadius: 50, fontSize: '0.7rem', fontWeight: 600 }}>
                            {typeof s === 'object' ? s.label : s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ color: BORDEAUX, fontWeight: 800, fontSize: '0.88rem' }}>
                        {(p.sizes?.length ? Math.min(...p.sizes.map(s=>s.price_try||s.price||0)) : 0) > 0 ? `₺${Math.min(...(p.sizes||[]).map(s=>s.price_try||s.price||0))}` : '—'}
                      </span>
                    </td>
                    {/* عمود العرض */}
                    <td style={{ padding: '12px 16px' }}>
                      {active ? (
                        <span style={{ background: '#FEF3C7', color: '#D97706', padding: '3px 10px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700, border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content' }}>
                          <FiTag size={11} /> {p.discount}% خصم
                        </span>
                      ) : (
                        <span style={{ color: TEXT2, fontSize: '0.78rem' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', color: TEXT2, fontSize: '0.82rem' }}>
                      {(p.images?.length || (p.image ? 1 : 0))} صورة
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 7 }}>
                        <button onClick={() => openEdit(p)} style={{ width: 32, height: 32, borderRadius: 8, background: BG2, border: 'none', color: BORDEAUX, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FiEdit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(p.slug || p.id)} style={{ width: 32, height: 32, borderRadius: 8, background: '#FEE2E2', border: 'none', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', color: TEXT2 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>📦</div>
            <p>لا يوجد منتجات بعد</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: 20 }}>
          <div style={{ background: CARD, borderRadius: 24, padding: '28px 24px', width: '100%', maxWidth: 680, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <h2 style={{ color: TEXT, fontFamily: 'Amiri, serif', fontSize: '1.15rem' }}>{editing ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: BG, border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: TEXT2 }}><FiX size={16} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* الصور */}
              <div>
                <label style={labelStyle}>صور المنتج (حتى 5) — الأولى هي الرئيسية</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {form.images.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                      <img src={img} alt="" style={{ width: 80, height: 80, borderRadius: 10, objectFit: 'cover', border: idx === 0 ? `3px solid ${BORDEAUX}` : `2px solid ${BORDER}` }} />
                      {idx === 0 && <span style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)', background: BORDEAUX, color: GOLD, fontSize: '0.58rem', padding: '2px 6px', borderRadius: 50, whiteSpace: 'nowrap', fontWeight: 700 }}>رئيسية</span>}
                      <button onClick={() => removeImage(idx)} style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22, borderRadius: '50%', background: '#DC2626', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX size={10} /></button>
                    </div>
                  ))}
                  {form.images.length < 5 && (
                    <div onClick={() => document.getElementById('product-imgs-input').click()} style={{ width: 80, height: 80, borderRadius: 10, border: `2px dashed ${BORDER}`, background: '#FFFBF5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 4 }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = BORDEAUX}
                      onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
                    >
                      {uploadingIdx !== null ? <div style={{ fontSize: '0.7rem', color: BORDEAUX, fontWeight: 700 }}>{uploadProgress}%</div> : <><FiUpload size={18} color={BORDEAUX} /><span style={{ fontSize: '0.65rem', color: TEXT2 }}>إضافة</span></>}
                    </div>
                  )}
                </div>
                <input id="product-imgs-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e.target.files[0])} />
              </div>

              {/* PDF */}
              <div>
                <label style={labelStyle}>📄 شهادة صحية / PDF</label>
                <div style={{ border: `2px dashed ${BORDER}`, borderRadius: 12, padding: '14px', background: '#FFFBF5', display: 'flex', alignItems: 'center', gap: 12 }}>
                  {form.pdf_url ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                      <FiFile size={20} color={BORDEAUX} />
                      <a href={form.pdf_url} target="_blank" rel="noreferrer" style={{ color: BORDEAUX, fontSize: '0.85rem', fontWeight: 600 }}>عرض الـ PDF</a>
                      <button onClick={() => setForm(f => ({ ...f, pdf_url: null }))} style={{ background: '#FEE2E2', border: 'none', borderRadius: 6, padding: '4px 8px', color: '#DC2626', cursor: 'pointer', fontSize: '0.75rem' }}>حذف</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                      <FiFile size={20} color={TEXT2} />
                      <span style={{ color: TEXT2, fontSize: '0.85rem' }}>{uploadingPdf ? 'جاري الرفع...' : 'لم يتم رفع PDF بعد'}</span>
                    </div>
                  )}
                  <button onClick={() => document.getElementById('product-pdf-input').click()} disabled={uploadingPdf} style={{ background: uploadingPdf ? BG2 : BG, border: 'none', borderRadius: 8, padding: '7px 14px', color: BORDEAUX, cursor: uploadingPdf ? 'not-allowed' : 'pointer', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'Amiri, serif', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiUpload size={13} /> رفع PDF
                  </button>
                  <input id="product-pdf-input" type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => handlePdfUpload(e.target.files[0])} />
                </div>
              </div>

              {/* الاسم */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={labelStyle}>الاسم بالعربي *</label><FInput value={form.name_ar} onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))} /></div>
                <div><label style={labelStyle}>الاسم بالإنجليزي *</label><FInput value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} /></div>
              </div>

              {/* المصدر */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={labelStyle}>المصدر بالعربي</label><FInput value={form.origin_ar} onChange={e => setForm(f => ({ ...f, origin_ar: e.target.value }))} /></div>
                <div><label style={labelStyle}>المصدر بالإنجليزي</label><FInput value={form.origin_en} onChange={e => setForm(f => ({ ...f, origin_en: e.target.value }))} /></div>
              </div>

              <div><label style={labelStyle}>الوصف القصير بالعربي</label><FTextarea value={form.desc_ar} onChange={e => setForm(f => ({ ...f, desc_ar: e.target.value }))} rows={2} /></div>
              <div><label style={labelStyle}>الوصف القصير بالإنجليزي</label><FTextarea value={form.desc_en} onChange={e => setForm(f => ({ ...f, desc_en: e.target.value }))} rows={2} /></div>
              <div><label style={labelStyle}>الوصف التفصيلي بالعربي</label><FTextarea value={form.desc_long_ar} onChange={e => setForm(f => ({ ...f, desc_long_ar: e.target.value }))} rows={3} /></div>
              <div><label style={labelStyle}>الوصف التفصيلي بالإنجليزي</label><FTextarea value={form.desc_long_en} onChange={e => setForm(f => ({ ...f, desc_long_en: e.target.value }))} rows={3} /></div>
              <div><label style={labelStyle}>المكونات بالعربي</label><FTextarea value={form.ingredients_ar} onChange={e => setForm(f => ({ ...f, ingredients_ar: e.target.value }))} rows={2} /></div>
              <div><label style={labelStyle}>المكونات بالإنجليزي</label><FTextarea value={form.ingredients_en} onChange={e => setForm(f => ({ ...f, ingredients_en: e.target.value }))} rows={2} /></div>
              <div><label style={labelStyle}>طريقة الاستخدام بالعربي</label><FTextarea value={form.usage_ar} onChange={e => setForm(f => ({ ...f, usage_ar: e.target.value }))} rows={2} /></div>
              <div><label style={labelStyle}>طريقة الاستخدام بالإنجليزي</label><FTextarea value={form.usage_en} onChange={e => setForm(f => ({ ...f, usage_en: e.target.value }))} rows={2} /></div>

              {/* الترتيب */}
              <div>
                <label style={labelStyle}>ترتيب الظهور (1 = الأول)</label>
                <FInput
                  type="number" min={1} step={1}
                  value={form.order ?? 99}
                  onChange={e => setForm(f => ({ ...f, order: +e.target.value }))}
                  placeholder="1"
                />
                <p style={{ color: '#9C6B4E', fontSize: '0.72rem', marginTop: 3 }}>رقم أصغر = يظهر أولاً</p>
              </div>

              {/* الفئة واللون */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>الفئة</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputStyle} onFocus={e => e.target.style.borderColor = BORDEAUX} onBlur={e => e.target.style.borderColor = BORDER}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>لون البطاقة</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ width: 44, height: 44, borderRadius: 10, border: `2px solid ${BORDER}`, cursor: 'pointer', padding: 2 }} />
                    <span style={{ color: TEXT2, fontSize: '0.85rem' }}>{form.color}</span>
                  </div>
                </div>
              </div>

              {/* ═══ قسم العروض ═══ */}
              <div style={{ background: '#FFFBF0', borderRadius: 14, padding: '16px', border: '2px solid #FDE68A' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <FiTag size={16} color="#D97706" />
                  <h3 style={{ color: '#92400E', fontWeight: 700, fontSize: '0.92rem', fontFamily: 'Amiri, serif' }}>
                    العروض والخصومات
                  </h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ ...labelStyle, color: '#92400E' }}>نسبة الخصم % (0 = بدون خصم)</label>
                    <div style={{ position: 'relative' }}>
                      <FInput
                        type="number" min={0} max={90} step={1}
                        value={form.discount}
                        onChange={e => setForm(f => ({ ...f, discount: Math.min(90, Math.max(0, +e.target.value)) }))}
                        placeholder="0"
                      />
                      <span style={{ position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)', color: '#D97706', fontWeight: 700, fontSize: '0.9rem' }}>%</span>
                    </div>
                    {form.discount > 0 && (
                      <p style={{ color: '#16A34A', fontSize: '0.78rem', marginTop: 4, fontWeight: 600 }}>
                        ✅ خصم {form.discount}% نشط
                      </p>
                    )}
                  </div>
                  <div>
                    <label style={{ ...labelStyle, color: '#92400E' }}>تاريخ انتهاء العرض (اختياري)</label>
                    <FInput
                      type="date"
                      value={form.discountExpiry}
                      onChange={e => setForm(f => ({ ...f, discountExpiry: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {form.discountExpiry && (
                      <p style={{ color: '#9C6B4E', fontSize: '0.75rem', marginTop: 4 }}>
                        ينتهي: {new Date(form.discountExpiry).toLocaleDateString('ar-SA')}
                      </p>
                    )}
                  </div>
                </div>
                {form.discount > 0 && (
                  <button onClick={() => setForm(f => ({ ...f, discount: 0, discountExpiry: '' }))} style={{ marginTop: 10, background: '#FEE2E2', border: 'none', borderRadius: 8, padding: '6px 14px', color: '#DC2626', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'Amiri, serif' }}>
                    إلغاء العرض
                  </button>
                )}
              </div>

              {/* الأحجام والأسعار */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label style={labelStyle}>الأحجام والأسعار بالليرة التركية ₺</label>
                  <button onClick={addSize} style={{ background: BG, border: 'none', borderRadius: 8, padding: '6px 12px', color: BORDEAUX, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, fontFamily: 'Amiri, serif', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiPlus size={13} /> إضافة حجم
                  </button>
                </div>
                {/* رؤوس الأعمدة */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, marginBottom: 4, padding: '0 4px' }}>
                  <span style={{ color: TEXT2, fontSize: '0.7rem', fontWeight: 600 }}>الكمية</span>
                  <span style={{ color: TEXT2, fontSize: '0.7rem', fontWeight: 600 }}>الوحدة</span>
                  <span style={{ color: TEXT2, fontSize: '0.7rem', fontWeight: 600 }}>الرمز</span>
                  <span style={{ color: '#D97706', fontSize: '0.7rem', fontWeight: 700 }}>السعر ₺ *</span>
                  <span></span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {form.sizes.map((size, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'center', background: '#FFFBF5', borderRadius: 10, padding: '8px', border: `1px solid ${BORDER}` }}>
                      <FInput type="number" min={1} value={size.value} onChange={e => updateSize(idx, 'value', e.target.value)} placeholder="مثال: 100" />
                      <select value={size.unit} onChange={e => updateSize(idx, 'unit', e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor = BORDEAUX} onBlur={e => e.target.style.borderColor = BORDER}>
                        <option value="g">غرام</option>
                        <option value="kg">كيلو</option>
                        <option value="ml">مل</option>
                        <option value="L">لتر</option>
                        <option value="pcs">قطعة</option>
                      </select>
                      <FInput value={size.label} onChange={e => updateSize(idx, 'label', e.target.value)} placeholder="100g" />
                      <FInput
                        type="number" min={0} step={1}
                        value={size.price_try || size.price || ''}
                        onChange={e => updateSize(idx, 'price_try', e.target.value)}
                        placeholder="₺"
                        style={{ ...inputStyle, borderColor: (size.price_try || size.price) ? BORDEAUX : '#FDE68A', background: '#FFFBF0' }}
                      />
                      <button onClick={() => removeSize(idx)} disabled={form.sizes.length <= 1} style={{ width: 32, height: 32, borderRadius: 8, background: form.sizes.length <= 1 ? BG : '#FEE2E2', border: 'none', color: form.sizes.length <= 1 ? '#C4956A' : '#DC2626', cursor: form.sizes.length <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
                <p style={{ color: '#D97706', fontSize: '0.75rem', marginTop: 6, fontWeight: 600 }}>* أدخل السعر بالليرة التركية ₺</p>
              </div>

              {/* أزرار الحفظ */}
              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <button onClick={handleSave} disabled={uploadingIdx !== null || saving} style={{ flex: 1, background: uploadingIdx !== null || saving ? BG2 : `linear-gradient(to left, ${BORDEAUX}, #a82040)`, color: uploadingIdx !== null || saving ? TEXT2 : GOLD, padding: '12px 0', borderRadius: 12, fontWeight: 700, fontSize: '0.92rem', border: 'none', cursor: uploadingIdx !== null || saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'Amiri, serif' }}>
                  <FiCheck size={15} />{saving ? 'جاري الحفظ...' : editing ? 'حفظ التعديلات' : 'إضافة المنتج'}
                </button>
                <button onClick={() => setShowForm(false)} style={{ padding: '12px 18px', borderRadius: 12, border: `2px solid ${BORDER}`, background: CARD, color: TEXT2, cursor: 'pointer', fontFamily: 'Amiri, serif', fontSize: '0.88rem' }}>إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}