import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCollection } from '../../hooks/useFirestore'
import { db } from '../../firebase'
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiX, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'

const EMPTY = {
  type: 'agent', name_ar: '', name_en: '',
  address: '', city: '', country_ar: '', country_en: '',
  desc_ar: '', desc_en: '',
  whatsapp: '', maps_url: '', image: '',
  dateFrom: '', dateTo: '',
  active: true,
}

const TYPE_OPTIONS = [
  { value: 'agent',    label_ar: 'وكيل معتمد',     label_en: 'Authorized Agent' },
  { value: 'event',    label_ar: 'فعالية / ماركت', label_en: 'Event / Market' },
  { value: 'delivery', label_ar: 'نقطة توزيع',     label_en: 'Distribution Point' },
]

const TYPE_COLOR = {
  agent:    { color: '#7b192c', bg: '#fdf0f2' },
  event:    { color: '#1E40AF', bg: '#EFF6FF' },
  delivery: { color: '#065F46', bg: '#F0FDF4' },
}

export default function AdminLocations() {
  const { i18n } = useTranslation()
  const isAr = i18n.language === 'ar'
  const { data: locations } = useCollection('locations')
  const [modal, setModal]   = useState(false)
  const [form,  setForm]    = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

  function openAdd() { setForm(EMPTY); setEditId(null); setModal(true) }
  function openEdit(loc) { setForm({ ...EMPTY, ...loc }); setEditId(loc.id); setModal(true) }
  function closeModal() { setModal(false); setForm(EMPTY); setEditId(null) }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave() {
    if (!form.name_ar || !form.name_en || !form.city) {
      toast.error(isAr ? 'الاسم والمدينة مطلوبان' : 'Name and city are required')
      return
    }
    setSaving(true)
    try {
      const data = { ...form, updatedAt: new Date().toISOString() }
      if (editId) {
        await updateDoc(doc(db, 'locations', editId), data)
        toast.success(isAr ? 'تم التحديث' : 'Updated')
      } else {
        await addDoc(collection(db, 'locations'), { ...data, createdAt: new Date().toISOString() })
        toast.success(isAr ? 'تمت الإضافة' : 'Added')
      }
      closeModal()
    } catch (err) {
      toast.error(isAr ? 'حدث خطأ' : 'Error occurred')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm(isAr ? 'حذف هذه النقطة؟' : 'Delete this location?')) return
    try {
      await deleteDoc(doc(db, 'locations', id))
      toast.success(isAr ? 'تم الحذف' : 'Deleted')
    } catch (err) {
      toast.error(isAr ? 'فشل الحذف' : 'Delete failed')
    }
  }

  async function toggleActive(loc) {
    try {
      await updateDoc(doc(db, 'locations', loc.id), { active: !loc.active })
    } catch (err) {
      toast.error('Error')
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 10,
    border: '2px solid #E2C9A8', fontSize: '0.88rem', color: '#3E1C00',
    outline: 'none', background: '#FFFBF5', boxSizing: 'border-box',
    fontFamily: 'Amiri, serif',
  }
  const labelStyle = { color: '#3E1C00', fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 5 }

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: '#3E1C00', fontSize: '1.3rem', fontFamily: 'Amiri, serif', marginBottom: 2 }}>
            {isAr ? 'نقاط البيع والفعاليات' : 'Sales Points & Events'}
          </h1>
          <p style={{ color: '#9C6B4E', fontSize: '0.83rem' }}>
            {locations.length} {isAr ? 'نقطة' : 'locations'}
          </p>
        </div>
        <button onClick={openAdd} style={{
          background: 'linear-gradient(to left, #7b192c, #a82040)', color: '#f4be69',
          padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
          fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: 'Amiri, serif',
        }}>
          <FiPlus size={16} />
          {isAr ? 'إضافة نقطة' : 'Add Location'}
        </button>
      </div>

      {/* قائمة النقاط */}
      {locations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 20, border: '1px solid #E2C9A8' }}>
          <FiMapPin size={40} color="#E2C9A8" style={{ marginBottom: 12 }} />
          <p style={{ color: '#9C6B4E' }}>{isAr ? 'لا توجد نقاط بعد' : 'No locations yet'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {locations.map(loc => {
            const cfg = TYPE_COLOR[loc.type] || TYPE_COLOR.agent
            const typeOpt = TYPE_OPTIONS.find(t => t.value === loc.type)
            return (
              <div key={loc.id} style={{
                background: '#fff', borderRadius: 16, border: '1px solid #E2C9A8',
                padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14,
                boxShadow: '0 2px 10px rgba(123,25,44,0.05)',
                opacity: loc.active === false ? 0.6 : 1,
              }}>
                {/* صورة */}
                <div style={{ width: 60, height: 60, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {loc.image ? <img src={loc.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FiMapPin size={22} color={cfg.color} />}
                </div>

                {/* المعلومات */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ background: cfg.bg, color: cfg.color, fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 50 }}>
                      {isAr ? typeOpt?.label_ar : typeOpt?.label_en}
                    </span>
                    {loc.active === false && (
                      <span style={{ background: '#F5F5F5', color: '#9C6B4E', fontSize: '0.68rem', fontWeight: 600, padding: '2px 8px', borderRadius: 50 }}>
                        {isAr ? 'مخفي' : 'Hidden'}
                      </span>
                    )}
                  </div>
                  <p style={{ color: '#3E1C00', fontWeight: 700, fontSize: '0.92rem', marginBottom: 2 }}>
                    {isAr ? loc.name_ar : loc.name_en}
                  </p>
                  <p style={{ color: '#9C6B4E', fontSize: '0.78rem' }}>
                    {[loc.city, isAr ? loc.country_ar : loc.country_en].filter(Boolean).join(' — ')}
                    {loc.type === 'event' && loc.dateFrom && ` | ${new Date(loc.dateFrom).toLocaleDateString()}`}
                  </p>
                </div>

                {/* الأزرار */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => toggleActive(loc)} style={{
                    width: 34, height: 34, borderRadius: 8, border: '1px solid #E2C9A8',
                    background: loc.active !== false ? '#F0FDF4' : '#F5F5F5',
                    color: loc.active !== false ? '#16A34A' : '#9C6B4E',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }} title={isAr ? 'تفعيل/إخفاء' : 'Toggle'}>
                    <FiCheck size={15} />
                  </button>
                  <button onClick={() => openEdit(loc)} style={{
                    width: 34, height: 34, borderRadius: 8, border: '1px solid #E2C9A8',
                    background: '#fdf0f2', color: '#7b192c', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FiEdit2 size={15} />
                  </button>
                  <button onClick={() => handleDelete(loc.id)} style={{
                    width: 34, height: 34, borderRadius: 8, border: '1px solid #FECACA',
                    background: '#FEF2F2', color: '#DC2626', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => e.target === e.currentTarget && closeModal()}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', padding: '24px 20px' }}>

            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ color: '#3E1C00', fontFamily: 'Amiri, serif', fontSize: '1.1rem' }}>
                {editId ? (isAr ? 'تعديل النقطة' : 'Edit Location') : (isAr ? 'إضافة نقطة جديدة' : 'Add New Location')}
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9C6B4E' }}>
                <FiX size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* النوع */}
              <div>
                <label style={labelStyle}>{isAr ? 'النوع' : 'Type'}</label>
                <select value={form.type} onChange={e => set('type', e.target.value)} style={{ ...inputStyle }}>
                  {TYPE_OPTIONS.map(t => (
                    <option key={t.value} value={t.value}>{isAr ? t.label_ar : t.label_en}</option>
                  ))}
                </select>
              </div>

              {/* الاسم */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>{isAr ? 'الاسم (عربي) *' : 'Name (Arabic) *'}</label>
                  <input value={form.name_ar} onChange={e => set('name_ar', e.target.value)} style={inputStyle} placeholder="مثال: متجر الرياض" />
                </div>
                <div>
                  <label style={labelStyle}>{isAr ? 'الاسم (إنجليزي) *' : 'Name (English) *'}</label>
                  <input value={form.name_en} onChange={e => set('name_en', e.target.value)} style={inputStyle} placeholder="e.g. Riyadh Store" />
                </div>
              </div>

              {/* العنوان */}
              <div>
                <label style={labelStyle}>{isAr ? 'العنوان التفصيلي' : 'Detailed Address'}</label>
                <input value={form.address} onChange={e => set('address', e.target.value)} style={inputStyle} placeholder={isAr ? 'الشارع، الحي...' : 'Street, District...'} />
              </div>

              {/* المدينة والدولة */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>{isAr ? 'المدينة *' : 'City *'}</label>
                  <input value={form.city} onChange={e => set('city', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{isAr ? 'الدولة (عربي)' : 'Country (AR)'}</label>
                  <input value={form.country_ar} onChange={e => set('country_ar', e.target.value)} style={inputStyle} placeholder="مثال: ألمانيا" />
                </div>
                <div>
                  <label style={labelStyle}>{isAr ? 'الدولة (إنجليزي)' : 'Country (EN)'}</label>
                  <input value={form.country_en} onChange={e => set('country_en', e.target.value)} style={inputStyle} placeholder="e.g. Germany" />
                </div>
              </div>

              {/* التواريخ للفعاليات */}
              {form.type === 'event' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={labelStyle}>{isAr ? 'تاريخ البداية' : 'Start Date'}</label>
                    <input type="date" value={form.dateFrom} onChange={e => set('dateFrom', e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>{isAr ? 'تاريخ النهاية' : 'End Date'}</label>
                    <input type="date" value={form.dateTo} onChange={e => set('dateTo', e.target.value)} style={inputStyle} />
                  </div>
                </div>
              )}

              {/* الوصف */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>{isAr ? 'الوصف (عربي)' : 'Description (AR)'}</label>
                  <textarea value={form.desc_ar} onChange={e => set('desc_ar', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div>
                  <label style={labelStyle}>{isAr ? 'الوصف (إنجليزي)' : 'Description (EN)'}</label>
                  <textarea value={form.desc_en} onChange={e => set('desc_en', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
              </div>

              {/* الروابط */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>{isAr ? 'واتساب' : 'WhatsApp'}</label>
                  <input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} style={inputStyle} placeholder="+966512345678" />
                </div>
                <div>
                  <label style={labelStyle}>{isAr ? 'رابط Google Maps' : 'Google Maps URL'}</label>
                  <input value={form.maps_url} onChange={e => set('maps_url', e.target.value)} style={inputStyle} placeholder="https://maps.google.com/..." />
                </div>
              </div>

              {/* صورة */}
              <div>
                <label style={labelStyle}>{isAr ? 'رابط الصورة' : 'Image URL'}</label>
                <input value={form.image} onChange={e => set('image', e.target.value)} style={inputStyle} placeholder="https://res.cloudinary.com/..." />
                {form.image && <img src={form.image} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 10, marginTop: 8 }} />}
              </div>

              {/* مفعّل */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => set('active', !form.active)} style={{
                  width: 44, height: 24, borderRadius: 50, border: 'none', cursor: 'pointer',
                  background: form.active ? '#7b192c' : '#E2C9A8', transition: 'background 0.2s',
                  position: 'relative',
                }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: form.active ? 22 : 3, transition: 'left 0.2s' }} />
                </button>
                <span style={{ color: '#3E1C00', fontSize: '0.85rem', fontWeight: 600 }}>
                  {form.active ? (isAr ? 'مرئي للعملاء' : 'Visible to customers') : (isAr ? 'مخفي' : 'Hidden')}
                </span>
              </div>

              {/* أزرار الحفظ */}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button onClick={handleSave} disabled={saving} style={{
                  flex: 1, background: saving ? '#E2C9A8' : 'linear-gradient(to left, #7b192c, #a82040)',
                  color: saving ? '#9C6B4E' : '#f4be69', padding: '12px 0', borderRadius: 12,
                  fontWeight: 700, fontSize: '0.92rem', border: 'none',
                  cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Amiri, serif',
                }}>
                  {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ' : 'Save')}
                </button>
                <button onClick={closeModal} style={{
                  padding: '12px 20px', borderRadius: 12, border: '2px solid #E2C9A8',
                  background: '#fff', color: '#9C6B4E', cursor: 'pointer', fontFamily: 'Amiri, serif',
                }}>
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}