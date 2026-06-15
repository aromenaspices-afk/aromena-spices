import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { FiEye, FiX, FiSend, FiCheck, FiTrash2, FiMail, FiPhone, FiGlobe, FiBriefcase } from 'react-icons/fi'
import { db } from '../../firebase'
import { collection, onSnapshot, doc, updateDoc, deleteDoc, orderBy, query } from 'firebase/firestore'

const BORDEAUX = '#7b192c'
const GOLD     = '#f4be69'
const BG       = '#F5E6D3'
const BG2      = '#EDD9C0'
const CARD     = '#ffffff'
const TEXT     = '#3E1C00'
const TEXT2    = '#9C6B4E'
const BORDER   = '#E2C9A8'

const statusConfig = {
  'جديد':          { bg: '#EFF6FF', color: '#2563EB' },
  'قيد المراجعة':  { bg: '#FEF3C7', color: '#D97706' },
  'تمت الموافقة':  { bg: '#F0FDF4', color: '#16A34A' },
  'مرفوض':         { bg: '#FEF2F2', color: '#DC2626' },
}
const statuses = Object.keys(statusConfig)

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function AdminWholesale() {
  const [requests,     setRequests]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [viewing,      setViewing]      = useState(null)
  const [reply,        setReply]        = useState('')
  const [replySent,    setReplySent]    = useState(false)
  const [saving,       setSaving]       = useState(false)
  const [filterStatus, setFilterStatus] = useState('الكل')

  // جلب طلبات الجملة من Firestore
  useEffect(() => {
    const q = query(collection(db, 'wholesale'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q,
      snap => {
        setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      err => {
        console.error('Wholesale error:', err)
        setLoading(false)
      }
    )
    return () => unsub()
  }, [])

  const filtered = filterStatus === 'الكل'
    ? requests
    : requests.filter(r => r.status === filterStatus)

  // عدادات لكل حالة
  const counts = statuses.reduce((acc, s) => {
    acc[s] = requests.filter(r => r.status === s).length
    return acc
  }, {})

  async function updateStatus(id, status) {
    try {
      await updateDoc(doc(db, 'wholesale', id), { status })
      if (viewing?.id === id) setViewing(v => ({ ...v, status }))
      toast.success('تم تحديث الحالة!')
    } catch (err) {
      toast.error('فشل التحديث: ' + err.message)
    }
  }

  async function sendReply(id) {
    if (!reply.trim()) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'wholesale', id), { reply, repliedAt: new Date().toISOString() })
      if (viewing?.id === id) setViewing(v => ({ ...v, reply }))
      toast.success('تم حفظ الرد!')
      setReplySent(true)
      setTimeout(() => setReplySent(false), 3000)
    } catch (err) {
      toast.error('فشل الإرسال: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return
    try {
      await deleteDoc(doc(db, 'wholesale', id))
      if (viewing?.id === id) setViewing(null)
      toast.success('تم حذف الطلب')
    } catch (err) {
      toast.error('فشل الحذف: ' + err.message)
    }
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60, color: TEXT2 }}>
      جاري تحميل الطلبات...
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', color: TEXT, fontFamily: 'Tajawal, sans-serif' }}>طلبات الجملة</h1>
          <p style={{ color: TEXT2, fontSize: '0.85rem' }}>{requests.length} طلب</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 20 }}>
        {statuses.map(s => {
          const st = statusConfig[s]
          return (
            <div key={s}
              onClick={() => setFilterStatus(filterStatus === s ? 'الكل' : s)}
              style={{
                background: CARD, borderRadius: 14, padding: '14px 12px',
                border: `1px solid ${BORDER}`, textAlign: 'center', cursor: 'pointer',
                boxShadow: filterStatus === s ? `0 0 0 2px ${st.color}` : 'none',
                transition: 'box-shadow 0.2s',
              }}
            >
              <p style={{ color: st.color, fontWeight: 900, fontSize: '1.4rem' }}>{counts[s] || 0}</p>
              <p style={{ color: st.color, fontSize: '0.72rem', marginTop: 2, fontWeight: 600 }}>{s}</p>
            </div>
          )
        })}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <button onClick={() => setFilterStatus('الكل')} style={{
          padding: '7px 16px', borderRadius: 50, border: '2px solid',
          borderColor: filterStatus === 'الكل' ? BORDEAUX : BORDER,
          background: filterStatus === 'الكل' ? `linear-gradient(to left, ${BORDEAUX}, #a82040)` : CARD,
          color: filterStatus === 'الكل' ? GOLD : '#6B3A2A',
          fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
        }}>الكل ({requests.length})</button>

        {statuses.map(s => {
          const st = statusConfig[s]
          const isActive = filterStatus === s
          return (
            <button key={s} onClick={() => setFilterStatus(isActive ? 'الكل' : s)} style={{
              padding: '7px 16px', borderRadius: 50, border: '2px solid',
              borderColor: isActive ? st.color : BORDER,
              background: isActive ? st.bg : CARD,
              color: isActive ? st.color : '#6B3A2A',
              fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
            }}>{s} ({counts[s] || 0})</button>
          )
        })}
      </div>

      {/* Table */}
      <div style={{
        background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`,
        boxShadow: '0 2px 12px rgba(62,28,0,0.05)', overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: BG }}>
                {['الاسم', 'نوع العمل', 'الدولة', 'الحالة', 'التاريخ', 'رد', ''].map((h, i) => (
                  <th key={i} style={{
                    padding: '12px 16px', textAlign: 'right', color: '#6B3A2A',
                    fontSize: '0.82rem', fontWeight: 700,
                    whiteSpace: 'nowrap', borderBottom: `1px solid ${BORDER}`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const st = statusConfig[r.status] || statusConfig['جديد']
                return (
                  <tr key={r.id} style={{
                    borderBottom: `1px solid ${BG}`,
                    background: i % 2 === 0 ? CARD : '#FFFBF5',
                  }}>
                    <td style={{ padding: '12px 16px' }}>
                      <p style={{ color: TEXT, fontWeight: 700, fontSize: '0.88rem' }}>
                        {r.firstName} {r.lastName}
                      </p>
                      <p style={{ color: TEXT2, fontSize: '0.75rem' }}>{r.email}</p>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        background: 'rgba(123,25,44,0.07)', color: BORDEAUX,
                        padding: '3px 10px', borderRadius: 50,
                        fontSize: '0.75rem', fontWeight: 600,
                        border: `1px solid rgba(123,25,44,0.12)`,
                      }}>
                        {r.business || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#6B3A2A', fontSize: '0.85rem' }}>
                      {r.country || '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        background: st.bg, color: st.color,
                        padding: '3px 10px', borderRadius: 50,
                        fontSize: '0.75rem', fontWeight: 700,
                      }}>
                        {r.status || 'جديد'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: TEXT2, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      {formatDate(r.createdAt || r.date)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {r.reply ? (
                        <span style={{
                          background: '#F0FDF4', color: '#16A34A',
                          padding: '2px 8px', borderRadius: 50,
                          fontSize: '0.7rem', fontWeight: 700,
                          border: '1px solid #BBF7D0',
                        }}>✓ تم الرد</span>
                      ) : (
                        <span style={{
                          background: BG, color: TEXT2,
                          padding: '2px 8px', borderRadius: 50,
                          fontSize: '0.7rem', fontWeight: 600,
                        }}>لم يُرد</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => { setViewing(r); setReply(r.reply || ''); setReplySent(false) }}
                          style={{
                            width: 30, height: 30, borderRadius: 8,
                            background: 'rgba(123,25,44,0.07)', border: 'none',
                            color: BORDEAUX, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <FiEye size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          style={{
                            width: 30, height: 30, borderRadius: 8,
                            background: '#FEE2E2', border: 'none',
                            color: '#DC2626', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
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

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', color: TEXT2 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>📭</div>
            <p style={{ fontSize: '0.9rem' }}>لا يوجد طلبات</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {viewing && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 500, padding: 16,
        }}>
          <div style={{
            background: CARD, borderRadius: 22, padding: '24px 20px',
            width: '100%', maxWidth: 520,
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
          }}>

            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ color: TEXT, fontFamily: 'Tajawal, sans-serif', fontSize: '1.1rem' }}>
                  {viewing.firstName} {viewing.lastName}
                </h2>
                <p style={{ color: TEXT2, fontSize: '0.75rem', marginTop: 2 }}>
                  {formatDate(viewing.createdAt || viewing.date)}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleDelete(viewing.id)} style={{
                  background: '#FEE2E2', border: 'none', borderRadius: 8,
                  padding: '7px 10px', cursor: 'pointer', color: '#DC2626',
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: '0.8rem', fontWeight: 600,
                }}>
                  <FiTrash2 size={13} /> حذف
                </button>
                <button onClick={() => setViewing(null)} style={{
                  background: BG, border: 'none', borderRadius: 8,
                  padding: 8, cursor: 'pointer', color: TEXT2,
                }}>
                  <FiX size={16} />
                </button>
              </div>
            </div>

            {/* حالة الطلب */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ color: TEXT2, fontSize: '0.82rem' }}>الحالة الحالية:</span>
              <span style={{
                background: statusConfig[viewing.status]?.bg,
                color: statusConfig[viewing.status]?.color,
                padding: '3px 12px', borderRadius: 50,
                fontSize: '0.78rem', fontWeight: 700,
              }}>
                {viewing.status || 'جديد'}
              </span>
            </div>

            {/* بيانات العميل */}
            <div style={{ background: BG, borderRadius: 14, padding: '14px 16px', marginBottom: 14 }}>
              <p style={{ color: TEXT, fontWeight: 700, marginBottom: 10, fontSize: '0.88rem' }}>بيانات التواصل</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { icon: <FiMail size={13} />,     label: 'الإيميل',    value: viewing.email },
                  { icon: <FiPhone size={13} />,    label: 'واتساب',     value: viewing.whatsapp || viewing.phone },
                  { icon: <FiGlobe size={13} />,    label: 'الدولة',     value: viewing.country },
                  { icon: <FiBriefcase size={13} />,label: 'نوع العمل',  value: viewing.business },
                ].map((item, i) => item.value && (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: CARD, borderRadius: 8, padding: '8px 12px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: TEXT2, fontSize: '0.82rem' }}>
                      {item.icon} {item.label}
                    </div>
                    <span style={{ color: TEXT, fontWeight: 600, fontSize: '0.82rem' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* التفاصيل */}
            <div style={{ background: BG, borderRadius: 14, padding: '14px 16px', marginBottom: 14 }}>
              <p style={{ color: TEXT, fontWeight: 700, marginBottom: 8, fontSize: '0.88rem' }}>تفاصيل الطلب</p>
              <p style={{ color: '#6B3A2A', fontSize: '0.85rem', lineHeight: 1.8 }}>
                {viewing.details || viewing.message || '—'}
              </p>
            </div>

            {/* تغيير الحالة */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ color: TEXT, fontWeight: 700, marginBottom: 10, fontSize: '0.85rem' }}>تغيير الحالة</p>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {statuses.map(s => {
                  const st = statusConfig[s]
                  const isActive = viewing.status === s
                  return (
                    <button key={s} onClick={() => updateStatus(viewing.id, s)} style={{
                      padding: '6px 12px', borderRadius: 50, border: '2px solid',
                      borderColor: isActive ? st.color : BORDER,
                      background: isActive ? st.bg : CARD,
                      color: isActive ? st.color : '#6B3A2A',
                      fontWeight: isActive ? 700 : 400,
                      fontSize: '0.78rem', cursor: 'pointer',
                      fontFamily: 'Tajawal, sans-serif', transition: 'all 0.15s',
                    }}>
                      {isActive && '✓ '}{s}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* الرد */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ color: TEXT, fontWeight: 700, marginBottom: 10, fontSize: '0.85rem' }}>
                الرد على الطلب
                {viewing.repliedAt && (
                  <span style={{ color: TEXT2, fontSize: '0.72rem', fontWeight: 400, marginRight: 8 }}>
                    (آخر رد: {formatDate(viewing.repliedAt)})
                  </span>
                )}
              </p>
              <textarea
                value={reply}
                onChange={e => setReply(e.target.value)}
                rows={4}
                placeholder="اكتب ردك هنا..."
                style={{
                  width: '100%', padding: '11px 14px',
                  borderRadius: 12, border: `2px solid ${BORDER}`,
                  fontSize: '0.88rem', color: TEXT,
                  fontFamily: 'Tajawal, sans-serif', outline: 'none',
                  background: '#FFFBF5', resize: 'vertical',
                  boxSizing: 'border-box', marginBottom: 10,
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = BORDEAUX}
                onBlur={e => e.target.style.borderColor = BORDER}
              />
              <button onClick={() => sendReply(viewing.id)} disabled={saving || !reply.trim()} style={{
                width: '100%',
                background: replySent
                  ? '#16A34A'
                  : saving || !reply.trim()
                    ? BG2
                    : `linear-gradient(to left, ${BORDEAUX}, #a82040)`,
                color: replySent ? '#fff' : saving || !reply.trim() ? TEXT2 : GOLD,
                padding: '12px 0', borderRadius: 12,
                fontWeight: 700, fontSize: '0.9rem',
                border: 'none',
                cursor: saving || !reply.trim() ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'Tajawal, sans-serif', transition: 'background 0.3s',
              }}>
                {replySent
                  ? <><FiCheck size={15} /> تم الحفظ!</>
                  : saving
                    ? 'جاري الحفظ...'
                    : <><FiSend size={15} /> حفظ الرد</>
                }
              </button>
              <p style={{ color: TEXT2, fontSize: '0.72rem', marginTop: 6, textAlign: 'center' }}>
                * الرد يُحفظ في Firestore — لإرساله للعميل يحتاج ربط EmailJS
              </p>
            </div>

            <button onClick={() => setViewing(null)} style={{
              width: '100%', padding: '11px',
              borderRadius: 12, border: `2px solid ${BORDER}`,
              background: CARD, color: '#6B3A2A',
              cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', fontWeight: 600,
            }}>
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  )
}