import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { FiPlus, FiTrash2, FiEdit2, FiCheck, FiX } from 'react-icons/fi'
import { db } from '../../firebase'
import {
  collection, doc, onSnapshot,
  setDoc, updateDoc, deleteDoc, addDoc,
} from 'firebase/firestore'

const BORDEAUX = '#7b192c'
const GOLD     = '#f4be69'
const BG       = '#F5E6D3'
const BG2      = '#EDD9C0'
const CARD     = '#ffffff'
const TEXT     = '#3E1C00'
const TEXT2    = '#9C6B4E'
const BORDER   = '#E2C9A8'

// بيانات أولية تُرفع أول مرة بس إذا ما في بيانات بـ Firestore
const defaultCurrencies = [
  { flag: '🇪🇺', name_ar: 'يورو',          name_en: 'Euro',             code: 'EUR', symbol: '€',   active: true  },
  { flag: '🇸🇦', name_ar: 'ريال سعودي',    name_en: 'Saudi Riyal',      code: 'SAR', symbol: 'ر.س', active: false },
  { flag: '🇦🇪', name_ar: 'درهم إماراتي', name_en: 'UAE Dirham',        code: 'AED', symbol: 'د.إ', active: false },
  { flag: '🇯🇴', name_ar: 'دينار أردني',  name_en: 'Jordanian Dinar',   code: 'JOD', symbol: 'د.أ', active: false },
  { flag: '🇹🇷', name_ar: 'ليرة تركية',   name_en: 'Turkish Lira',      code: 'TRY', symbol: '₺',   active: false },
]

const emptyForm = { flag: '', name_ar: '', name_en: '', code: '', symbol: '' }

const inputStyle = {
  width: '100%', padding: '10px 12px',
  borderRadius: 10, border: `2px solid ${BORDER}`,
  fontSize: '0.88rem', color: TEXT,
  fontFamily: 'Tajawal, sans-serif', outline: 'none',
  background: '#FFFBF5', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

const labelStyle = {
  color: TEXT, fontSize: '0.82rem',
  fontWeight: 600, display: 'block', marginBottom: 5,
}

export default function AdminCurrencies() {
  const [currencies, setCurrencies] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [showForm,   setShowForm]   = useState(false)
  const [editing,    setEditing]    = useState(null) // doc id
  const [form,       setForm]       = useState(emptyForm)

  // جلب العملات من Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'currencies'), async snap => {
      if (snap.empty) {
        // أول مرة — ارفع البيانات الافتراضية
        for (const c of defaultCurrencies) {
          await addDoc(collection(db, 'currencies'), c)
        }
      } else {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        // رتّب: اليورو أول
        data.sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0))
        setCurrencies(data)
        setLoading(false)
      }
    })
    return () => unsub()
  }, [])

  function openAdd() {
    setEditing(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(c) {
    setEditing(c.id)
    setForm({ flag: c.flag, name_ar: c.name_ar, name_en: c.name_en, code: c.code, symbol: c.symbol })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.code || !form.name_ar) {
      toast.error('الاسم بالعربي والكود مطلوبان')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await updateDoc(doc(db, 'currencies', editing), form)
      } else {
        await addDoc(collection(db, 'currencies'), { ...form, active: false })
      }
      setShowForm(false)
      toast.success(editing ? 'تم تعديل العملة!' : 'تمت إضافة العملة!')
    } catch (err) {
      toast.error('فشل الحفظ: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(c) {
    try {
      await updateDoc(doc(db, 'currencies', c.id), { active: !c.active })
      toast.success(c.active ? 'تم تعطيل العملة' : 'تم تفعيل العملة')
    } catch (err) {
      toast.error('فشل التحديث: ' + err.message)
    }
  }

  async function handleDelete(c) {
    if (!confirm(`حذف عملة "${c.name_ar}"؟`)) return
    try {
      await deleteDoc(doc(db, 'currencies', c.id))
      toast.success('تم حذف العملة')
    } catch (err) {
      toast.error('فشل الحذف: ' + err.message)
    }
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60, color: TEXT2 }}>
      جاري تحميل العملات...
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', color: TEXT, fontFamily: 'Tajawal, sans-serif' }}>
            العملات والدول
          </h1>
          <p style={{ color: TEXT2, fontSize: '0.85rem' }}>{currencies.length} عملة</p>
        </div>
        <button onClick={openAdd} style={{
          background: `linear-gradient(to left, ${BORDEAUX}, #a82040)`,
          color: GOLD, padding: '10px 20px',
          borderRadius: 50, fontWeight: 700,
          fontSize: '0.88rem', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: 'Tajawal, sans-serif',
          boxShadow: '0 4px 14px rgba(123,25,44,0.25)',
        }}>
          <FiPlus size={16} /> إضافة عملة
        </button>
      </div>

      {/* Currencies Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 16,
      }}>
        {currencies.map(c => (
          <div key={c.id} style={{
            background: CARD, borderRadius: 18,
            border: `2px solid ${c.active ? BORDEAUX : BORDER}`,
            padding: '18px 20px',
            boxShadow: c.active
              ? '0 4px 16px rgba(123,25,44,0.1)'
              : '0 2px 12px rgba(62,28,0,0.05)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}>

            {/* رأس الكارد */}
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: 14,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '2rem', lineHeight: 1 }}>{c.flag}</span>
                <div>
                  <p style={{ color: TEXT, fontWeight: 700, fontSize: '0.95rem' }}>
                    {c.name_ar}
                  </p>
                  <p style={{ color: TEXT2, fontSize: '0.78rem' }}>{c.name_en}</p>
                </div>
              </div>
              <div style={{
                background: c.active ? 'rgba(123,25,44,0.08)' : BG,
                color: c.active ? BORDEAUX : TEXT2,
                padding: '4px 12px', borderRadius: 50,
                fontSize: '0.72rem', fontWeight: 700,
                border: `1px solid ${c.active ? 'rgba(123,25,44,0.2)' : BORDER}`,
              }}>
                {c.active ? '✅ نشطة' : 'غير نشطة'}
              </div>
            </div>

            {/* الكود والرمز */}
            <div style={{
              display: 'flex', gap: 0,
              background: BG, borderRadius: 10,
              overflow: 'hidden', marginBottom: 14,
            }}>
              <div style={{ flex: 1, textAlign: 'center', padding: '10px 12px' }}>
                <p style={{ color: TEXT2, fontSize: '0.7rem', marginBottom: 3 }}>الرمز</p>
                <p style={{ color: TEXT, fontWeight: 800, fontSize: '1rem' }}>{c.symbol}</p>
              </div>
              <div style={{ width: 1, background: BORDER }} />
              <div style={{ flex: 1, textAlign: 'center', padding: '10px 12px' }}>
                <p style={{ color: TEXT2, fontSize: '0.7rem', marginBottom: 3 }}>الكود</p>
                <p style={{ color: TEXT, fontWeight: 800, fontSize: '1rem' }}>{c.code}</p>
              </div>
            </div>

            {/* أزرار */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => toggleActive(c)} style={{
                flex: 1, padding: '8px 0',
                borderRadius: 10, fontWeight: 600,
                fontSize: '0.82rem', border: '2px solid',
                borderColor: c.active ? '#DC2626' : '#16A34A',
                background: '#fff',
                color: c.active ? '#DC2626' : '#16A34A',
                cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
                transition: 'all 0.15s',
              }}>
                {c.active ? 'تعطيل' : 'تفعيل'}
              </button>
              <button onClick={() => openEdit(c)} style={{
                width: 36, height: 36, borderRadius: 10,
                background: BG2, border: 'none',
                color: BORDEAUX, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}>
                <FiEdit2 size={14} />
              </button>
              <button onClick={() => handleDelete(c)} style={{
                width: 36, height: 36, borderRadius: 10,
                background: '#FEE2E2', border: 'none',
                color: '#DC2626', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}>
                <FiTrash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 500, padding: 20,
        }}>
          <div style={{
            background: CARD, borderRadius: 24,
            padding: '28px 24px', width: '100%', maxWidth: 420,
            boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
          }}>

            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 22,
            }}>
              <h2 style={{ color: TEXT, fontFamily: 'Tajawal, sans-serif', fontSize: '1.15rem' }}>
                {editing ? 'تعديل العملة' : 'إضافة عملة جديدة'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{
                background: BG, border: 'none',
                borderRadius: 8, padding: 8, cursor: 'pointer', color: TEXT2,
              }}>
                <FiX size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* الأسماء */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>الاسم بالعربي *</label>
                  <input
                    value={form.name_ar}
                    onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))}
                    placeholder="يورو"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = BORDEAUX}
                    onBlur={e => e.target.style.borderColor = BORDER}
                  />
                </div>
                <div>
                  <label style={labelStyle}>الاسم بالإنجليزي</label>
                  <input
                    value={form.name_en}
                    onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))}
                    placeholder="Euro"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = BORDEAUX}
                    onBlur={e => e.target.style.borderColor = BORDER}
                  />
                </div>
              </div>

              {/* الكود والرمز والعلم */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>الكود *</label>
                  <input
                    value={form.code}
                    onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="EUR"
                    maxLength={5}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = BORDEAUX}
                    onBlur={e => e.target.style.borderColor = BORDER}
                  />
                </div>
                <div>
                  <label style={labelStyle}>الرمز</label>
                  <input
                    value={form.symbol}
                    onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))}
                    placeholder="€"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = BORDEAUX}
                    onBlur={e => e.target.style.borderColor = BORDER}
                  />
                </div>
                <div>
                  <label style={labelStyle}>العلم 🏳️</label>
                  <input
                    value={form.flag}
                    onChange={e => setForm(f => ({ ...f, flag: e.target.value }))}
                    placeholder="🇪🇺"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = BORDEAUX}
                    onBlur={e => e.target.style.borderColor = BORDER}
                  />
                </div>
              </div>

              {/* معاينة */}
              {(form.flag || form.name_ar || form.symbol) && (
                <div style={{
                  background: BG, borderRadius: 12, padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: 12,
                  border: `1px solid ${BORDER}`,
                }}>
                  <span style={{ fontSize: '1.8rem' }}>{form.flag || '🏳️'}</span>
                  <div>
                    <p style={{ color: TEXT, fontWeight: 700, fontSize: '0.9rem' }}>{form.name_ar || '—'}</p>
                    <p style={{ color: TEXT2, fontSize: '0.78rem' }}>{form.code} · {form.symbol}</p>
                  </div>
                </div>
              )}

              {/* أزرار */}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={handleSave} disabled={saving} style={{
                  flex: 1,
                  background: saving ? BG2 : `linear-gradient(to left, ${BORDEAUX}, #a82040)`,
                  color: saving ? TEXT2 : GOLD,
                  padding: '12px 0', borderRadius: 12,
                  fontWeight: 700, fontSize: '0.92rem',
                  border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  fontFamily: 'Tajawal, sans-serif', transition: 'all 0.15s',
                }}>
                  <FiCheck size={15} />
                  {saving ? 'جاري الحفظ...' : (editing ? 'حفظ التعديل' : 'إضافة العملة')}
                </button>
                <button onClick={() => setShowForm(false)} style={{
                  padding: '12px 18px', borderRadius: 12,
                  border: `2px solid ${BORDER}`, background: CARD,
                  color: TEXT2, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
                  fontSize: '0.88rem',
                }}>
                  إلغاء
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}