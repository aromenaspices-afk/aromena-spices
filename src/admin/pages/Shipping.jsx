import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { FiEdit2, FiCheck, FiX, FiTruck, FiUpload, FiInfo, FiSave, FiRefreshCw, FiPlus, FiTrash2 } from 'react-icons/fi'
import { db } from '../../firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import {
  DEFAULT_TURKEY, DEFAULT_ZONES, DEFAULT_COUNTRIES,
  parseShippingExcel, clearShippingCache
} from '../../utils/shippingData'

const BORDEAUX = '#7b192c'
const GOLD     = '#f4be69'
const BG       = '#F5E6D3'
const BG2      = '#EDD9C0'
const CARD     = '#ffffff'
const TEXT     = '#3E1C00'
const TEXT2    = '#9C6B4E'
const BORDER   = '#E2C9A8'

const ZONE_NAMES = {
  1: 'Zone 1 — ألمانيا',
  2: 'Zone 2 — أوروبا الغربية',
  3: 'Zone 3 — UK / سويسرا / USA',
  4: 'Zone 4 — اليابان / سنغافورة',
  5: 'Zone 5 — الخليج العربي',
  6: 'Zone 6 — باكستان / آسيا الوسطى',
  7: 'Zone 7 — الهند / أستراليا',
  8: 'Zone 8 — باقي العالم',
}

const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: `2px solid ${BORDER}`, fontSize: '0.85rem', color: TEXT,
  fontFamily: 'Amiri, serif', outline: 'none', background: '#FFFBF5',
  boxSizing: 'border-box',
}

export default function AdminShipping() {
  const [activeTab, setActiveTab] = useState('countries')
  const [countries, setCountries] = useState(DEFAULT_COUNTRIES)
  const [turkey,    setTurkey]    = useState(DEFAULT_TURKEY)
  const [zones,     setZones]     = useState(DEFAULT_ZONES)
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editingCountry, setEditingCountry] = useState(null)
  const [editingZone,    setEditingZone]    = useState(null)
  const [editingTurkey,  setEditingTurkey]  = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // جلب البيانات من Firestore
  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, 'settings', 'shipping'))
        if (snap.exists()) {
          const data = snap.data()
          if (data.countries) setCountries(data.countries)
          if (data.turkey)    setTurkey(data.turkey)
          if (data.zones)     setZones(data.zones)
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  // حفظ كل التغييرات لـ Firestore
  async function saveAll() {
    setSaving(true)
    try {
      await setDoc(doc(db, 'settings', 'shipping'), { countries, turkey, zones })
      clearShippingCache()
      setHasChanges(false)
      toast.success('✅ تم حفظ جميع إعدادات الشحن!')
    } catch (err) {
      toast.error('فشل الحفظ: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // رفع Excel
  async function handleExcelUpload(file) {
    if (!file) return
    setUploading(true)
    try {
      const result = await parseShippingExcel(file)
      if (result.zones) { setZones(result.zones); setHasChanges(true) }
      if (result.turkey) { setTurkey(result.turkey); setHasChanges(true) }
      toast.success('✅ تم استيراد الأسعار من الملف!')
    } catch (err) {
      toast.error('فشل قراءة الملف: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  function getSamplePrice(c) {
    if (c.domestic) return `₺${turkey[1]?.price || 64}`
    const table = zones[c.zone]
    if (!table) return '—'
    const row = table.find(r => r.w >= 1) || table[0]
    return `₺${row?.p || '—'}`
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: TEXT2 }}>جاري التحميل...</div>

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', color: TEXT, fontFamily: 'Amiri, serif' }}>إعدادات الشحن</h1>
          <p style={{ color: TEXT2, fontSize: '0.85rem' }}>YK International 2026 + Yurtiçi Kargo</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {/* رفع Excel */}
          <label style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: uploading ? BG2 : '#EFF6FF',
            border: '2px solid #BFDBFE', borderRadius: 10,
            padding: '8px 16px', cursor: uploading ? 'not-allowed' : 'pointer',
            color: '#2563EB', fontWeight: 700, fontSize: '0.84rem', fontFamily: 'Amiri, serif',
          }}>
            <FiUpload size={14} />
            {uploading ? 'جاري الاستيراد...' : 'رفع Excel جديد'}
            <input type="file" accept=".xlsx,.xls" style={{ display: 'none' }} disabled={uploading}
              onChange={e => handleExcelUpload(e.target.files[0])} />
          </label>
          {/* حفظ */}
          <button onClick={saveAll} disabled={saving || !hasChanges} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: hasChanges ? `linear-gradient(to left, ${BORDEAUX}, #a82040)` : BG2,
            color: hasChanges ? GOLD : TEXT2,
            border: 'none', borderRadius: 10, padding: '8px 20px',
            fontWeight: 700, fontSize: '0.88rem', cursor: hasChanges ? 'pointer' : 'not-allowed',
            fontFamily: 'Amiri, serif',
          }}>
            {saving ? <FiRefreshCw size={14} /> : <FiSave size={14} />}
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      </div>

      {/* تنبيه تغييرات غير محفوظة */}
      {hasChanges && (
        <div style={{ background: '#FFF7ED', border: '2px solid #FB923C', borderRadius: 12, padding: '10px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiInfo size={15} color="#EA580C" />
          <p style={{ color: '#EA580C', fontWeight: 700, fontSize: '0.84rem' }}>
            في تغييرات غير محفوظة — اضغط "حفظ التغييرات" لتطبيقها على الموقع
          </p>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { id: 'countries', label: 'الدول والشحن المجاني' },
          { id: 'turkey',    label: '🇹🇷 داخل تركيا' },
          { id: 'zones',     label: 'المناطق الدولية' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '8px 18px', borderRadius: 50, border: '2px solid',
            borderColor: activeTab === tab.id ? BORDEAUX : BORDER,
            background: activeTab === tab.id ? 'linear-gradient(to left, #7b192c, #a82040)' : '#fff',
            color: activeTab === tab.id ? GOLD : TEXT2,
            fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Amiri, serif',
          }}>{tab.label}</button>
        ))}
      </div>

      {/* ═══ Tab: الدول ═══ */}
      {activeTab === 'countries' && (
        <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: BG }}>
                {['الدولة', 'المنطقة', 'سعر مرجعي (1كغ)', 'شحن مجاني ابتداءً من ₺', 'مدة التوصيل', ''].map((h, i) => (
                  <th key={i} style={{ padding: '12px 16px', textAlign: 'right', color: '#6B3A2A', fontSize: '0.8rem', fontWeight: 700, borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {countries.map((c, i) => (
                <tr key={c.country_en} style={{ borderBottom: `1px solid ${BG}`, background: i % 2 === 0 ? CARD : '#FFFBF5' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '1.3rem' }}>{c.flag}</span>
                      <div>
                        <p style={{ color: TEXT, fontWeight: 700, fontSize: '0.88rem' }}>{c.country_ar}</p>
                        <p style={{ color: TEXT2, fontSize: '0.73rem' }}>{c.country_en}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: c.domestic ? '#F0FDF4' : 'rgba(123,25,44,0.07)', color: c.domestic ? '#16A34A' : BORDEAUX, padding: '3px 10px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 600 }}>
                      {c.domestic ? 'Yurtiçi' : `Zone ${c.zone}`}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: BORDEAUX, fontWeight: 800, fontSize: '0.9rem' }}>{getSamplePrice(c)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: '#F0FDF4', color: '#16A34A', padding: '3px 10px', borderRadius: 50, fontSize: '0.78rem', fontWeight: 700, border: '1px solid #BBF7D0' }}>
                      ₺{Number(c.freeOver).toLocaleString('tr-TR')}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: BG2, color: '#6B3A2A', padding: '3px 10px', borderRadius: 50, fontSize: '0.78rem', fontWeight: 600 }}>{c.days} أيام</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => setEditingCountry({ ...c, _idx: i })} style={{ width: 32, height: 32, borderRadius: 8, background: BG2, border: 'none', color: BORDEAUX, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiEdit2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ═══ Tab: داخل تركيا ═══ */}
      {activeTab === 'turkey' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ color: TEXT, fontWeight: 700 }}>Yurtiçi Kargo — أسعار الشحن الداخلي</p>
            <button onClick={() => setEditingTurkey(true)} style={{ background: BG2, border: 'none', borderRadius: 8, padding: '7px 14px', color: BORDEAUX, cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', fontFamily: 'Amiri, serif', display: 'flex', alignItems: 'center', gap: 5 }}>
              <FiEdit2 size={13} /> تعديل الأسعار
            </button>
          </div>
          <div style={{ background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: BG }}>
                  {['الوزن الأقصى', 'السعر ₺'].map((h, i) => (
                    <th key={i} style={{ padding: '12px 20px', textAlign: 'right', color: '#6B3A2A', fontSize: '0.8rem', fontWeight: 700, borderBottom: `1px solid ${BORDER}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {turkey.map((t, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${BG}`, background: i % 2 === 0 ? CARD : '#FFFBF5' }}>
                    <td style={{ padding: '12px 20px', color: TEXT, fontWeight: 600 }}>
                      {t.maxGrams >= 1000 ? `${(t.maxGrams/1000).toFixed(1)} كغ` : `${t.maxGrams} غ`}
                    </td>
                    <td style={{ padding: '12px 20px', color: BORDEAUX, fontWeight: 800 }}>₺{Number(t.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ Tab: المناطق الدولية ═══ */}
      {activeTab === 'zones' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.entries(zones).map(([zone, table]) => (
            <div key={zone} style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
              <div style={{ padding: '12px 18px', background: BG, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: BORDEAUX, fontWeight: 700, fontSize: '0.88rem' }}>{ZONE_NAMES[zone] || `Zone ${zone}`}</p>
                <button onClick={() => setEditingZone({ zone: +zone, table: table.map(r => ({ ...r })) })} style={{ background: BG2, border: 'none', borderRadius: 7, padding: '5px 12px', color: BORDEAUX, cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem', fontFamily: 'Amiri, serif', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FiEdit2 size={12} /> تعديل
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '12px 16px' }}>
                {table.slice(0, 10).map((row, i) => (
                  <div key={i} style={{ background: BG, borderRadius: 8, padding: '5px 10px', textAlign: 'center', minWidth: 72 }}>
                    <p style={{ color: TEXT2, fontSize: '0.65rem' }}>{row.w} كغ</p>
                    <p style={{ color: BORDEAUX, fontWeight: 700, fontSize: '0.82rem' }}>₺{row.p}</p>
                  </div>
                ))}
                {table.length > 10 && (
                  <div style={{ background: BG, borderRadius: 8, padding: '5px 10px', display: 'flex', alignItems: 'center', color: TEXT2, fontSize: '0.75rem' }}>
                    +{table.length - 10}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ Modal: تعديل دولة ═══ */}
      {editingCountry && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: 20 }}>
          <div style={{ background: CARD, borderRadius: 22, padding: '28px 24px', width: '100%', maxWidth: 420, boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ color: TEXT, fontFamily: 'Amiri, serif', fontSize: '1.1rem' }}>{editingCountry.flag} {editingCountry.country_ar}</h2>
              <button onClick={() => setEditingCountry(null)} style={{ background: BG, border: 'none', borderRadius: 8, padding: 7, cursor: 'pointer' }}><FiX size={15} color={TEXT2} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ color: TEXT, fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 5 }}>شحن مجاني ابتداءً من ₺</label>
                <input type="number" value={editingCountry.freeOver} onChange={e => setEditingCountry(c => ({ ...c, freeOver: +e.target.value }))} style={inputStyle} onFocus={e => e.target.style.borderColor = BORDEAUX} onBlur={e => e.target.style.borderColor = BORDER} />
              </div>
              <div>
                <label style={{ color: TEXT, fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: 5 }}>مدة التوصيل</label>
                <input value={editingCountry.days} onChange={e => setEditingCountry(c => ({ ...c, days: e.target.value }))} placeholder="4-5" style={inputStyle} onFocus={e => e.target.style.borderColor = BORDEAUX} onBlur={e => e.target.style.borderColor = BORDER} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={() => {
                  const updated = [...countries]
                  updated[editingCountry._idx] = { ...editingCountry }
                  setCountries(updated)
                  setHasChanges(true)
                  setEditingCountry(null)
                  toast.success('تم التعديل — اضغط حفظ التغييرات')
                }} style={{ flex: 1, background: `linear-gradient(to left, ${BORDEAUX}, #a82040)`, color: GOLD, padding: '11px 0', borderRadius: 10, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'Amiri, serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <FiCheck size={14} /> تطبيق
                </button>
                <button onClick={() => setEditingCountry(null)} style={{ padding: '11px 18px', borderRadius: 10, border: `2px solid ${BORDER}`, background: CARD, color: TEXT2, cursor: 'pointer', fontFamily: 'Amiri, serif' }}>إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Modal: تعديل أسعار تركيا ═══ */}
      {editingTurkey && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: 20 }}>
          <div style={{ background: CARD, borderRadius: 22, padding: '28px 24px', width: '100%', maxWidth: 460, maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ color: TEXT, fontFamily: 'Amiri, serif', fontSize: '1.1rem' }}>🇹🇷 Yurtiçi Kargo — تعديل الأسعار</h2>
              <button onClick={() => setEditingTurkey(false)} style={{ background: BG, border: 'none', borderRadius: 8, padding: 7, cursor: 'pointer' }}><FiX size={15} color={TEXT2} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
              <span style={{ color: TEXT2, fontSize: '0.72rem', fontWeight: 600 }}>الوزن الأقصى (غرام)</span>
              <span style={{ color: TEXT2, fontSize: '0.72rem', fontWeight: 600 }}>السعر ₺</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {turkey.map((t, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, alignItems: 'center', background: '#FFFBF5', borderRadius: 8, padding: '8px', border: `1px solid ${BORDER}` }}>
                  <input type="number" value={t.maxGrams}
                    onChange={e => { const n = [...turkey]; n[i] = { ...n[i], maxGrams: +e.target.value }; setTurkey(n) }}
                    style={inputStyle} onFocus={e => e.target.style.borderColor = BORDEAUX} onBlur={e => e.target.style.borderColor = BORDER} />
                  <input type="number" step="0.01" value={t.price}
                    onChange={e => { const n = [...turkey]; n[i] = { ...n[i], price: +e.target.value }; setTurkey(n) }}
                    style={inputStyle} onFocus={e => e.target.style.borderColor = BORDEAUX} onBlur={e => e.target.style.borderColor = BORDER} />
                  <button onClick={() => setTurkey(turkey.filter((_, j) => j !== i))} style={{ width: 30, height: 30, borderRadius: 7, background: '#FEE2E2', border: 'none', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiTrash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => setTurkey([...turkey, { maxGrams: 0, price: 0 }])} style={{ width: '100%', background: BG, border: `2px dashed ${BORDER}`, borderRadius: 10, padding: '9px 0', color: BORDEAUX, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', fontFamily: 'Amiri, serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 16 }}>
              <FiPlus size={14} /> إضافة شريحة
            </button>
            <button onClick={() => { setHasChanges(true); setEditingTurkey(false); toast.success('تم التعديل — اضغط حفظ التغييرات') }} style={{ width: '100%', background: `linear-gradient(to left, ${BORDEAUX}, #a82040)`, color: GOLD, padding: '12px 0', borderRadius: 10, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'Amiri, serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <FiCheck size={14} /> تطبيق التغييرات
            </button>
          </div>
        </div>
      )}

      {/* ═══ Modal: تعديل منطقة دولية ═══ */}
      {editingZone && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: 20 }}>
          <div style={{ background: CARD, borderRadius: 22, padding: '28px 24px', width: '100%', maxWidth: 500, maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ color: TEXT, fontFamily: 'Amiri, serif', fontSize: '1.05rem' }}>{ZONE_NAMES[editingZone.zone]}</h2>
              <button onClick={() => setEditingZone(null)} style={{ background: BG, border: 'none', borderRadius: 8, padding: 7, cursor: 'pointer' }}><FiX size={15} color={TEXT2} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 6, marginBottom: 8 }}>
              <span style={{ color: TEXT2, fontSize: '0.72rem', fontWeight: 600 }}>الوزن (كغ)</span>
              <span style={{ color: TEXT2, fontSize: '0.72rem', fontWeight: 600 }}>السعر ₺</span>
              <span></span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              {editingZone.table.map((row, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, alignItems: 'center', background: '#FFFBF5', borderRadius: 8, padding: '7px', border: `1px solid ${BORDER}` }}>
                  <input type="number" step="0.5" value={row.w}
                    onChange={e => { const t = [...editingZone.table]; t[i] = { ...t[i], w: +e.target.value }; setEditingZone({ ...editingZone, table: t }) }}
                    style={inputStyle} onFocus={e => e.target.style.borderColor = BORDEAUX} onBlur={e => e.target.style.borderColor = BORDER} />
                  <input type="number" value={row.p}
                    onChange={e => { const t = [...editingZone.table]; t[i] = { ...t[i], p: +e.target.value }; setEditingZone({ ...editingZone, table: t }) }}
                    style={inputStyle} onFocus={e => e.target.style.borderColor = BORDEAUX} onBlur={e => e.target.style.borderColor = BORDER} />
                  <button onClick={() => setEditingZone({ ...editingZone, table: editingZone.table.filter((_, j) => j !== i) })} style={{ width: 30, height: 30, borderRadius: 7, background: '#FEE2E2', border: 'none', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiTrash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => setEditingZone({ ...editingZone, table: [...editingZone.table, { w: 0, p: 0 }] })} style={{ width: '100%', background: BG, border: `2px dashed ${BORDER}`, borderRadius: 10, padding: '8px 0', color: BORDEAUX, cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', fontFamily: 'Amiri, serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 14 }}>
              <FiPlus size={13} /> إضافة صف
            </button>
            <button onClick={() => {
              const newZones = { ...zones, [editingZone.zone]: editingZone.table }
              setZones(newZones); setHasChanges(true); setEditingZone(null)
              toast.success('تم التعديل — اضغط حفظ التغييرات')
            }} style={{ width: '100%', background: `linear-gradient(to left, ${BORDEAUX}, #a82040)`, color: GOLD, padding: '12px 0', borderRadius: 10, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'Amiri, serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <FiCheck size={14} /> تطبيق التغييرات
            </button>
          </div>
        </div>
      )}
    </div>
  )
}