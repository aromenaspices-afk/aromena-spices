import toast from 'react-hot-toast'
import { useState } from 'react'
import { FiPlus, FiTrash2, FiEdit2, FiCheck, FiX, FiCopy, FiTag } from 'react-icons/fi'
import { useCollection, saveDoc, deleteDocument } from '../../hooks/useFirestore'

const BORDEAUX = '#7b192c'
const GOLD     = '#f4be69'
const BG       = '#F5E6D3'
const BG2      = '#EDD9C0'
const CARD     = '#ffffff'
const TEXT     = '#3E1C00'
const TEXT2    = '#9C6B4E'
const BORDER   = '#E2C9A8'

const emptyForm = {
  code: '', type: 'percent', value: 0,
  minOrder: 0, maxUses: 100, expires: '', active: true,
}

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

export default function AdminPromoCodes() {
  const { data: codes, loading } = useCollection('promocodes')
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [form,     setForm]     = useState(emptyForm)
  const [copied,   setCopied]   = useState(null)
  const [saving,   setSaving]   = useState(false)

  function openAdd() {
    setEditing(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(c) {
    setEditing(c.id)
    setForm({
      code: c.code, type: c.type, value: c.value,
      minOrder: c.minOrder, maxUses: c.maxUses,
      expires: c.expires || '', active: c.active,
    })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.code.trim()) { toast.error('الكود مطلوب'); return }
    setSaving(true)
    try {
      const id = editing || form.code.toUpperCase()
      await saveDoc('promocodes', id, {
        ...form,
        id,
        code: form.code.toUpperCase(),
        uses: editing ? (codes.find(c => c.id === editing)?.uses || 0) : 0,
      })
      setShowForm(false)
      setEditing(null)
      toast.success(editing ? 'تم تعديل الكود!' : 'تم إضافة الكود!')
    } catch (err) {
      toast.error('فشل الحفظ: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(c) {
    try {
      await saveDoc('promocodes', c.id, { ...c, active: !c.active })
      toast.success(c.active ? 'تم تعطيل الكود' : 'تم تفعيل الكود')
    } catch (err) {
      toast.error('فشل التحديث: ' + err.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('حذف الكود؟')) return
    try {
      await deleteDocument('promocodes', id)
      toast.success('تم حذف الكود')
    } catch (err) {
      toast.error('فشل الحذف: ' + err.message)
    }
  }

  function copyCode(code) {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 1800)
  }

  function isExpired(expires) {
    if (!expires) return false
    return new Date(expires) < new Date()
  }

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ height: 200, borderRadius: 18, background: BG, animation: 'pulse 1.2s ease-in-out infinite' }} />
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  )

  // إحصائيات سريعة
  const activeCount   = codes.filter(c => c.active).length
  const expiredCount  = codes.filter(c => isExpired(c.expires)).length
  const totalUses     = codes.reduce((s, c) => s + (c.uses || 0), 0)

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', color: TEXT, fontFamily: 'Tajawal, sans-serif' }}>كودات الخصم</h1>
          <p style={{ color: TEXT2, fontSize: '0.85rem' }}>{codes.length} كود</p>
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
          <FiPlus size={16} /> إضافة كود
        </button>
      </div>

      {/* Stats */}
      {codes.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 22 }}>
          {[
            { label: 'الكودات النشطة', value: activeCount,  color: '#16A34A', bg: '#F0FDF4' },
            { label: 'منتهية الصلاحية', value: expiredCount, color: '#DC2626', bg: '#FEF2F2' },
            { label: 'إجمالي الاستخدامات', value: totalUses, color: BORDEAUX,   bg: 'rgba(123,25,44,0.06)' },
          ].map((s, i) => (
            <div key={i} style={{
              background: s.bg, borderRadius: 14, padding: '14px 16px',
              border: `1px solid ${s.color}22`, textAlign: 'center',
            }}>
              <p style={{ color: s.color, fontWeight: 900, fontSize: '1.5rem', lineHeight: 1 }}>{s.value}</p>
              <p style={{ color: s.color, fontSize: '0.72rem', marginTop: 4, fontWeight: 600 }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {codes.length === 0 && (
        <div style={{
          background: CARD, borderRadius: 20, padding: '48px',
          textAlign: 'center', border: `1px solid ${BORDER}`, color: TEXT2,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(123,25,44,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <FiTag size={28} color={BORDEAUX} />
          </div>
          <p style={{ fontWeight: 600, color: TEXT, marginBottom: 6 }}>لا يوجد كودات خصم بعد</p>
          <p style={{ fontSize: '0.85rem' }}>أضف أول كود خصم للعملاء!</p>
        </div>
      )}

      {/* Codes Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
      }}>
        {codes.map(c => {
          const expired = isExpired(c.expires)
          const usePct  = Math.min(((c.uses || 0) / c.maxUses) * 100, 100)
          const full    = (c.uses || 0) >= c.maxUses
          const borderColor = !c.active ? BORDER : expired ? '#FCA5A5' : full ? '#FCA5A5' : BORDEAUX

          return (
            <div key={c.id} style={{
              background: CARD, borderRadius: 18,
              border: `2px solid ${borderColor}`,
              padding: '20px', overflow: 'hidden',
              boxShadow: c.active && !expired && !full
                ? '0 4px 16px rgba(123,25,44,0.1)'
                : '0 2px 8px rgba(62,28,0,0.04)',
              opacity: !c.active || expired ? 0.7 : 1,
              transition: 'all 0.2s',
            }}>

              {/* كود + نسخ */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{
                  background: c.active && !expired && !full
                    ? `linear-gradient(to left, ${BORDEAUX}, #a82040)`
                    : BG2,
                  color: c.active && !expired && !full ? GOLD : TEXT2,
                  padding: '8px 16px', borderRadius: 10,
                  fontWeight: 900, fontSize: '1rem',
                  letterSpacing: 1.5, fontFamily: 'monospace',
                }}>
                  {c.code}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {/* badge الحالة */}
                  {expired && (
                    <span style={{ background: '#FEF2F2', color: '#DC2626', padding: '3px 8px', borderRadius: 50, fontSize: '0.68rem', fontWeight: 700 }}>
                      منتهي
                    </span>
                  )}
                  {full && !expired && (
                    <span style={{ background: '#FEF2F2', color: '#DC2626', padding: '3px 8px', borderRadius: 50, fontSize: '0.68rem', fontWeight: 700 }}>
                      مكتمل
                    </span>
                  )}
                  <button onClick={() => copyCode(c.code)} style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: copied === c.code ? '#F0FDF4' : BG,
                    border: 'none',
                    color: copied === c.code ? '#16A34A' : BORDEAUX,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}>
                    {copied === c.code ? <FiCheck size={14} /> : <FiCopy size={14} />}
                  </button>
                </div>
              </div>

              {/* بيانات الكود */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                {[
                  { label: 'الخصم',          value: c.type === 'percent' ? `${c.value}%` : `€${c.value}` },
                  { label: 'الحد الأدنى',    value: `€${c.minOrder}` },
                  { label: 'الاستخدامات',    value: `${c.uses || 0} / ${c.maxUses}` },
                  { label: 'ينتهي',          value: c.expires || 'بلا حد' },
                ].map((item, i) => (
                  <div key={i} style={{ background: BG, borderRadius: 8, padding: '8px 10px' }}>
                    <p style={{ color: TEXT2, fontSize: '0.7rem', marginBottom: 2 }}>{item.label}</p>
                    <p style={{ color: TEXT, fontWeight: 700, fontSize: '0.84rem' }}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* شريط الاستخدام */}
              <div style={{ background: BG, borderRadius: 50, height: 5, overflow: 'hidden', marginBottom: 14 }}>
                <div style={{
                  height: '100%', borderRadius: 50,
                  width: `${usePct}%`,
                  background: full
                    ? '#DC2626'
                    : usePct > 70
                      ? '#D97706'
                      : `linear-gradient(to left, ${BORDEAUX}, #a82040)`,
                  transition: 'width 0.5s ease',
                }} />
              </div>

              {/* أزرار */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => toggleActive(c)} style={{
                  flex: 1, padding: '8px 0', borderRadius: 10,
                  fontWeight: 600, fontSize: '0.82rem', border: '2px solid',
                  borderColor: c.active ? '#DC2626' : '#16A34A',
                  background: CARD,
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
                }}>
                  <FiEdit2 size={14} />
                </button>
                <button onClick={() => handleDelete(c.id)} style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: '#FEE2E2', border: 'none',
                  color: '#DC2626', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 500, padding: 20,
        }}>
          <div style={{
            background: CARD, borderRadius: 22,
            padding: '28px 24px', width: '100%', maxWidth: 450,
            boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
            maxHeight: '90vh', overflowY: 'auto',
          }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <h2 style={{ color: TEXT, fontFamily: 'Tajawal, sans-serif', fontSize: '1.15rem' }}>
                {editing ? 'تعديل الكود' : 'إضافة كود جديد'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{
                background: BG, border: 'none', borderRadius: 8,
                padding: 8, cursor: 'pointer', color: TEXT2,
              }}>
                <FiX size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* الكود */}
              <div>
                <label style={labelStyle}>الكود *</label>
                <input
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="AROMENA10"
                  style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '1rem', fontWeight: 700, letterSpacing: 1 }}
                  onFocus={e => e.target.style.borderColor = BORDEAUX}
                  onBlur={e => e.target.style.borderColor = BORDER}
                />
              </div>

              {/* النوع والقيمة */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>نوع الخصم</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = BORDEAUX}
                    onBlur={e => e.target.style.borderColor = BORDER}
                  >
                    <option value="percent">نسبة مئوية %</option>
                    <option value="fixed">مبلغ ثابت €</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>قيمة الخصم</label>
                  <input
                    type="number" min={0}
                    value={form.value}
                    onChange={e => setForm(f => ({ ...f, value: +e.target.value }))}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = BORDEAUX}
                    onBlur={e => e.target.style.borderColor = BORDER}
                  />
                </div>
              </div>

              {/* الحد الأدنى والاستخدامات */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>الحد الأدنى للطلب €</label>
                  <input
                    type="number" min={0}
                    value={form.minOrder}
                    onChange={e => setForm(f => ({ ...f, minOrder: +e.target.value }))}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = BORDEAUX}
                    onBlur={e => e.target.style.borderColor = BORDER}
                  />
                </div>
                <div>
                  <label style={labelStyle}>أقصى عدد استخدامات</label>
                  <input
                    type="number" min={1}
                    value={form.maxUses}
                    onChange={e => setForm(f => ({ ...f, maxUses: +e.target.value }))}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = BORDEAUX}
                    onBlur={e => e.target.style.borderColor = BORDER}
                  />
                </div>
              </div>

              {/* تاريخ الانتهاء */}
              <div>
                <label style={labelStyle}>تاريخ الانتهاء (اختياري)</label>
                <input
                  type="date"
                  value={form.expires}
                  onChange={e => setForm(f => ({ ...f, expires: e.target.value }))}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = BORDEAUX}
                  onBlur={e => e.target.style.borderColor = BORDER}
                />
              </div>

              {/* معاينة */}
              {form.code && (
                <div style={{
                  background: BG, borderRadius: 12, padding: '12px 16px',
                  border: `1px solid ${BORDER}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '1rem', color: BORDEAUX, letterSpacing: 1.5 }}>
                    {form.code}
                  </span>
                  <span style={{ color: TEXT, fontWeight: 700, fontSize: '0.9rem' }}>
                    {form.type === 'percent' ? `${form.value}% خصم` : `€${form.value} خصم`}
                    {form.minOrder > 0 && ` · فوق €${form.minOrder}`}
                  </span>
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
                  {saving ? 'جاري الحفظ...' : editing ? 'حفظ التعديل' : 'إضافة الكود'}
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