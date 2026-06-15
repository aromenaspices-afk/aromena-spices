import { useState, useEffect } from 'react'
import { FiSave, FiUpload, FiPackage, FiRefreshCw, FiInfo } from 'react-icons/fi'
import { db } from '../../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { uploadImage } from '../../utils/cloudinary'
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
  width: '100%', padding: '10px 12px', borderRadius: 10,
  border: `2px solid ${BORDER}`, fontSize: '0.88rem',
  color: TEXT, fontFamily: 'Tajawal, sans-serif', outline: 'none',
  background: '#FFFBF5', boxSizing: 'border-box',
}
const labelStyle = { color: TEXT, fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 5 }

function FInput({ value, onChange, ...props }) {
  return <input value={value} onChange={onChange} style={inputStyle}
    onFocus={e => e.target.style.borderColor = BORDEAUX}
    onBlur={e => e.target.style.borderColor = BORDER} {...props} />
}

const DEFAULT = {
  name_ar: 'باقتي المخصصة', name_en: 'My Custom Box',
  desc_ar: 'اختر 4 بهارات من تشكيلتنا', desc_en: 'Choose 4 spices from our collection',
  price: 0, weightKg: 0.6, image: null,
  active: true, slots: 4,
}

export default function AdminCustomBox() {
  const [form, setForm]     = useState(DEFAULT)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    getDoc(doc(db, 'settings', 'custom_box')).then(snap => {
      if (snap.exists()) setForm({ ...DEFAULT, ...snap.data() })
      setLoading(false)
    })
  }, [])

  async function handleSave() {
    if (!form.price || form.price <= 0) { toast.error('لازم تحدد سعر الباكج'); return }
    setSaving(true)
    try {
      await setDoc(doc(db, 'settings', 'custom_box'), form)
      toast.success('✅ تم حفظ إعدادات الباكج المخصص!')
    } catch (err) {
      toast.error('فشل: ' + err.message)
    } finally { setSaving(false) }
  }

  async function handleImage(file) {
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setForm(f => ({ ...f, image: url }))
      toast.success('تم رفع الصورة')
    } catch { toast.error('فشل رفع الصورة') }
    finally { setUploading(false) }
  }

  if (loading) return <div style={{ padding: 40, color: TEXT2, textAlign: 'center' }}>جاري التحميل...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.3rem', color: TEXT, fontFamily: 'Tajawal, sans-serif' }}>الباكج المخصص</h1>
          <p style={{ color: TEXT2, fontSize: '0.85rem' }}>أداة تصميم الباكج الخاصة بالزبون</p>
        </div>
        <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, background: saving ? BG2 : `linear-gradient(to left, ${BORDEAUX}, #a82040)`, color: saving ? TEXT2 : GOLD, border: 'none', borderRadius: 12, padding: '10px 22px', fontWeight: 700, fontSize: '0.88rem', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
          {saving ? <FiRefreshCw size={14} /> : <FiSave size={14} />}
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>

        {/* الإعدادات الأساسية */}
        <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, padding: '22px 20px' }}>
          <h2 style={{ color: TEXT, fontFamily: 'Tajawal, sans-serif', fontSize: '1rem', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiPackage size={16} color={BORDEAUX} /> البيانات الأساسية
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={labelStyle}>الاسم بالعربي</label><FInput value={form.name_ar} onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))} /></div>
              <div><label style={labelStyle}>الاسم بالإنجليزي</label><FInput value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={labelStyle}>الوصف بالعربي</label><FInput value={form.desc_ar} onChange={e => setForm(f => ({ ...f, desc_ar: e.target.value }))} /></div>
              <div><label style={labelStyle}>الوصف بالإنجليزي</label><FInput value={form.desc_en} onChange={e => setForm(f => ({ ...f, desc_en: e.target.value }))} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>السعر ₺ *</label>
                <FInput type="number" min={0} step={1} value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} placeholder="0" />
              </div>
              <div>
                <label style={labelStyle}>وزن الشحن (كغ)</label>
                <FInput type="number" min={0.1} step={0.1} value={form.weightKg} onChange={e => setForm(f => ({ ...f, weightKg: +e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>عدد القطع</label>
                <FInput type="number" min={1} max={10} value={form.slots} onChange={e => setForm(f => ({ ...f, slots: +e.target.value }))} />
                <p style={{ color: TEXT2, fontSize: '0.7rem', marginTop: 3 }}>حالياً: {form.slots} قطع</p>
              </div>
            </div>

            {/* تفعيل/إيقاف */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => setForm(f => ({ ...f, active: !f.active }))} style={{ width: 44, height: 24, borderRadius: 12, background: form.active ? BORDEAUX : '#E2C9A8', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: form.active ? 23 : 3, transition: 'left 0.2s' }} />
              </button>
              <span style={{ color: form.active ? BORDEAUX : TEXT2, fontSize: '0.85rem', fontWeight: 600 }}>
                {form.active ? 'مفعّل — يظهر للزبائن' : 'موقف — مخفي عن الزبائن'}
              </span>
            </div>
          </div>
        </div>

        {/* صورة الباكج */}
        <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, padding: '22px 20px' }}>
          <h2 style={{ color: TEXT, fontFamily: 'Tajawal, sans-serif', fontSize: '1rem', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiUpload size={16} color={BORDEAUX} /> صورة الباكج
          </h2>

          {form.image ? (
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <img src={form.image} alt="custom box" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 12, border: `2px solid ${BORDER}` }} />
              <button onClick={() => setForm(f => ({ ...f, image: null }))} style={{ position: 'absolute', top: 8, right: 8, background: '#DC2626', border: 'none', borderRadius: 6, color: '#fff', padding: '4px 8px', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'Tajawal, sans-serif' }}>حذف</button>
            </div>
          ) : (
            <div style={{ height: 140, background: BG, borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 14, border: `2px dashed ${BORDER}` }}>
              <FiPackage size={32} color={TEXT2} />
              <p style={{ color: TEXT2, fontSize: '0.8rem', marginTop: 8 }}>لا توجد صورة</p>
            </div>
          )}

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: BG, border: `2px dashed ${BORDER}`, borderRadius: 12, padding: '12px 0', cursor: 'pointer', color: BORDEAUX, fontWeight: 600, fontSize: '0.85rem', fontFamily: 'Tajawal, sans-serif' }}>
            <FiUpload size={15} />
            {uploading ? 'جاري الرفع...' : 'رفع صورة الباكج'}
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImage(e.target.files[0])} disabled={uploading} />
          </label>

          {/* معلومة */}
          <div style={{ background: '#EFF6FF', borderRadius: 10, padding: '10px 14px', marginTop: 14, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <FiInfo size={14} color="#2563EB" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ color: '#1E40AF', fontSize: '0.75rem', lineHeight: 1.6 }}>
              هذه الصورة ستظهر في السلة والـ Checkout عوضاً عن صور المنتجات الفردية
            </p>
          </div>
        </div>

      </div>

      {/* معاينة */}
      <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, padding: '22px 20px', marginTop: 20 }}>
        <h2 style={{ color: TEXT, fontFamily: 'Tajawal, sans-serif', fontSize: '1rem', marginBottom: 16 }}>معاينة كيف يظهر في السلة</h2>
        <div style={{ background: '#FFFBF5', borderRadius: 14, padding: '14px 16px', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 12, maxWidth: 480 }}>
          <div style={{ width: 52, height: 52, borderRadius: 10, background: form.image ? 'transparent' : `linear-gradient(135deg, ${BORDEAUX}18, ${BORDEAUX}35)`, flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {form.image ? <img src={form.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FiPackage size={22} color={TEXT2} />}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: TEXT, fontWeight: 700, fontSize: '0.88rem' }}>{form.name_ar}</p>
            <p style={{ color: TEXT2, fontSize: '0.75rem' }}>{form.slots} قطع × 100مل — باقة مخصصة</p>
          </div>
          <p style={{ color: BORDEAUX, fontWeight: 900, fontSize: '0.95rem' }}>₺{form.price}</p>
        </div>
      </div>
    </div>
  )
}