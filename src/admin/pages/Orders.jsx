import { useState, useEffect } from 'react'
import { FiEye, FiX, FiPackage, FiCheck, FiXCircle, FiRefreshCw, FiTrash2, FiUpload, FiExternalLink } from 'react-icons/fi'
import { db } from '../../firebase'
import { collection, onSnapshot, doc, updateDoc, deleteDoc, orderBy, query } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { sendStatusUpdateEmail, sendTrackingEmail, sendCancellationEmail } from '../../utils/emailService'
import { isEmailable } from '../../utils/orderStatus'

const statusConfig = {
  awaiting_payment: { label: 'ينتظر التحويل', bg: '#FFF7ED', color: '#EA580C' },
  pending_payment:  { label: 'إيصال مرفوع',   bg: '#FEF3C7', color: '#D97706' },
  pending:          { label: 'قيد الانتظار',  bg: '#EFF6FF', color: '#2563EB' },
  confirmed:        { label: 'مؤكد',           bg: '#F0FDF4', color: '#16A34A' },
  processing:       { label: 'جاري التجهيز',  bg: '#FEF3C7', color: '#D97706' },
  shipped:          { label: 'قيد الشحن',      bg: '#F5F3FF', color: '#7C3AED' },
  delivered:        { label: 'تم التسليم',     bg: '#F0FDF4', color: '#16A34A' },
  cancelled:        { label: 'ملغي',            bg: '#FEF2F2', color: '#DC2626' },
}

const paymentStatusConfig = {
  pending:          { label: 'لم يُسدَّد',    bg: '#FEF3C7', color: '#D97706' },
  receipt_uploaded: { label: 'إيصال مرفوع',   bg: '#FFF7ED', color: '#EA580C' },
  paid:             { label: 'مدفوع ✓',       bg: '#F0FDF4', color: '#16A34A' },
  failed:           { label: 'فشل',            bg: '#FEF2F2', color: '#DC2626' },
  refunded:         { label: 'مُسترجع',        bg: '#F5F3FF', color: '#7C3AED' },
}

// شركات الشحن المتاحة في Basit Kargo (handlerCode)
const KARGO_CARRIERS = [
  { code: 'ARAS',        name: 'Aras Kargo' },
  { code: 'HEPSIJET',    name: 'HepsiJET' },
  { code: 'SURAT',       name: 'Sürat Kargo' },
  { code: 'PTT',         name: 'PTT Kargo' },
  { code: 'KOLAYGELSIN', name: 'KolayGelsin' },
  { code: 'YURTICI',     name: 'Yurtiçi Kargo' },
]

// هل الطلب لتركيا؟ (Basit Kargo داخليّ فقط)
function isTurkey(country) {
  const c = String(country || '').toLowerCase()
  return c.includes('ترك') || c.includes('turk') || c.includes('türk')
}

// تنسيق السعر بالليرة
function formatTRY(amount) {
  if (!amount && amount !== 0) return '—'
  return `₺${Number(amount).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function AdminOrders() {
  const [orders,        setOrders]        = useState([])
  const [loading,       setLoading]       = useState(true)
  const [viewing,       setViewing]       = useState(null)
  const [trackingInput, setTrackingInput] = useState('')
  const [carrierInput,  setCarrierInput]  = useState('')
  const [filterStatus,  setFilterStatus]  = useState('all')
  const [saving,        setSaving]        = useState(false)
  const [notesInput,    setNotesInput]    = useState('')
  const [cancelReason,  setCancelReason]  = useState('')
  const [kargoCarrier,  setKargoCarrier]  = useState('')
  const [kargoSending,  setKargoSending]  = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus)

  // عدد الإيصالات المرفوعة تحتاج مراجعة
  const pendingReceipts = orders.filter(o => o.payment?.status === 'receipt_uploaded').length

  async function updateOrderField(orderId, fields) {
    setSaving(true)
    try {
      await updateDoc(doc(db, 'orders', orderId), fields)
      if (viewing?.id === orderId) setViewing(v => ({ ...v, ...fields }))
      toast.success('تم التحديث!')
    } catch (err) {
      toast.error('فشل التحديث: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteOrder(orderId) {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return
    try {
      await deleteDoc(doc(db, 'orders', orderId))
      setViewing(null)
      toast.success('تم حذف الطلب')
    } catch (err) {
      toast.error('فشل الحذف: ' + err.message)
    }
  }

  async function saveTracking() {
    if (!viewing || !trackingInput.trim()) return
    await updateOrderField(viewing.id, { tracking: trackingInput, carrier: carrierInput, status: 'shipped' })
    await sendTrackingEmail({ customer: viewing.customer, orderNumber: viewing.orderNumber, trackingNumber: trackingInput, carrier: carrierInput, trackingUrl: '', items: viewing.items })
    toast.success('تم الحفظ وإرسال إيميل التتبع! 📧')
  }

  async function saveNotes() {
    if (!viewing) return
    await updateOrderField(viewing.id, { notes: notesInput })
  }

  // إنشاء شحنة عبر Basit Kargo بالشركة المختارة
  async function sendToBasitKargo() {
    if (!viewing || !kargoCarrier) return
    // فحص استباقيّ — الطلبات القديمة قد تنقصها المنطقة/الهاتف
    const cu = viewing.customer || {}
    const miss = []
    if (!cu.city) miss.push('الولاية')
    if (!cu.district) miss.push('المنطقة (İlçe)')
    if (!cu.phone) miss.push('الهاتف')
    if (miss.length) {
      toast.error(`لا يمكن الإرسال — بيانات ناقصة في الطلب: ${miss.join('، ')}. عدّل العنوان أولاً.`)
      return
    }
    setKargoSending(true)
    try {
      const res = await fetch('/.netlify/functions/basit-kargo-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: viewing, handlerCode: kargoCarrier }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        const msg = data.error || (data.detail ? JSON.stringify(data.detail) : 'فشل غير معروف')
        toast.error('فشل إنشاء الشحنة: ' + msg)
        return
      }
      const carrierName = KARGO_CARRIERS.find(k => k.code === kargoCarrier)?.name || kargoCarrier
      const tracking = data.id || data.barcode || ''
      await updateOrderField(viewing.id, {
        status: 'shipped',
        tracking,
        carrier: carrierName,
        basitKargo: { id: data.id || null, barcode: data.barcode || null, status: data.status || null, handlerCode: kargoCarrier, createdAt: new Date().toISOString() },
      })
      try {
        await sendTrackingEmail({ customer: viewing.customer, orderNumber: viewing.orderNumber, trackingNumber: tracking, carrier: carrierName, trackingUrl: '', items: viewing.items })
      } catch (e) { console.error('Tracking email failed:', e) }
      setKargoCarrier('')
      toast.success(`تم إنشاء الشحنة! رقم: ${tracking} 📦`)
    } catch (e) {
      toast.error('تعذّر الاتصال بشركة الشحن')
    } finally {
      setKargoSending(false)
    }
  }

  async function changeStatus(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId)
    if (!order) return
    if (order.status === newStatus) { await updateOrderField(orderId, { status: 'pending' }); return }
    if (newStatus === 'cancelled') {
      await updateOrderField(orderId, { status: 'cancelled', cancelReason: cancelReason || '' })
      await sendCancellationEmail({ customer: order.customer, orderNumber: order.orderNumber, reason: cancelReason || '', items: order.items, pricing: order.pricing })
      setCancelReason('')
      toast.success('تم الإلغاء وإرسال إيميل للزبون 📧')
      return
    }
    if (newStatus === 'confirmed') {
      await updateOrderField(orderId, { status: 'confirmed', 'payment.status': 'paid' })
      await sendStatusUpdateEmail({ customer: order.customer, orderNumber: order.orderNumber, status: 'confirmed', items: order.items, pricing: order.pricing })
      toast.success('تم التأكيد وإرسال إيميل للزبون 📧')
      return
    }
    await updateOrderField(orderId, { status: newStatus })
    if (isEmailable(newStatus)) {
      await sendStatusUpdateEmail({ customer: order.customer, orderNumber: order.orderNumber, status: newStatus, items: order.items, pricing: order.pricing })
      toast.success('تم التحديث وإرسال إيميل للزبون 📧')
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#9C6B4E' }}>جاري تحميل الطلبات...</div>

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', color: '#3E1C00', fontFamily: 'Amiri, serif' }}>الطلبات</h1>
          <p style={{ color: '#9C6B4E', fontSize: '0.85rem' }}>{orders.length} طلب</p>
        </div>
        {pendingReceipts > 0 && (
          <div style={{ background: '#FFF7ED', border: '2px solid #FB923C', borderRadius: 12, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiUpload size={15} color="#EA580C" />
            <span style={{ color: '#EA580C', fontWeight: 700, fontSize: '0.85rem' }}>
              {pendingReceipts} إيصال ينتظر المراجعة
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8, marginBottom: 20 }}>
        {Object.entries(statusConfig).map(([key, val]) => {
          const count = orders.filter(o => o.status === key).length
          if (count === 0 && !['pending', 'confirmed', 'awaiting_payment'].includes(key)) return null
          return (
            <div key={key} onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)} style={{
              background: '#fff', borderRadius: 12, padding: '12px 10px',
              border: `2px solid ${filterStatus === key ? val.color : '#E2C9A8'}`,
              textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s',
              background: filterStatus === key ? val.bg : '#fff',
            }}>
              <p style={{ color: val.color, fontWeight: 900, fontSize: '1.3rem' }}>{count}</p>
              <p style={{ color: '#9C6B4E', fontSize: '0.65rem', marginTop: 2, lineHeight: 1.3 }}>{val.label}</p>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        <button onClick={() => setFilterStatus('all')} style={{ padding: '6px 14px', borderRadius: 50, border: '2px solid', borderColor: filterStatus === 'all' ? '#7b192c' : '#E2C9A8', background: filterStatus === 'all' ? 'linear-gradient(to left, #7b192c, #a82040)' : '#fff', color: filterStatus === 'all' ? '#f4be69' : '#6B3A2A', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'Amiri, serif' }}>
          الكل ({orders.length})
        </button>
        {Object.entries(statusConfig).map(([key, val]) => (
          <button key={key} onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)} style={{ padding: '6px 14px', borderRadius: 50, border: '2px solid', borderColor: filterStatus === key ? val.color : '#E2C9A8', background: filterStatus === key ? val.bg : '#fff', color: filterStatus === key ? val.color : '#6B3A2A', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'Amiri, serif' }}>
            {val.label} ({orders.filter(o => o.status === key).length})
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E2C9A8', boxShadow: '0 2px 12px rgba(62,28,0,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F5E6D3' }}>
                {['رقم الطلب', 'العميل', 'الدولة', 'المجموع (₺)', 'الدفع', 'الحالة', 'التاريخ', ''].map((h, i) => (
                  <th key={i} style={{ padding: '12px 14px', textAlign: 'right', color: '#6B3A2A', fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid #E2C9A8' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, i) => {
                const st  = statusConfig[order.status]                 || statusConfig.pending
                const pst = paymentStatusConfig[order.payment?.status] || paymentStatusConfig.pending
                const hasReceipt = order.payment?.receiptUrl
                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid #F5E6D3', background: i % 2 === 0 ? '#fff' : '#FFFBF5' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <p style={{ color: '#7b192c', fontWeight: 700, fontSize: '0.82rem' }}>{order.orderNumber || order.id.slice(0, 8)}</p>
                      {hasReceipt && <span style={{ fontSize: '0.65rem', color: '#EA580C', fontWeight: 700 }}>📎 إيصال مرفوع</span>}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <p style={{ color: '#3E1C00', fontWeight: 600, fontSize: '0.82rem' }}>{order.customer?.firstName} {order.customer?.lastName}</p>
                      <p style={{ color: '#9C6B4E', fontSize: '0.7rem' }}>{order.customer?.email}</p>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#6B3A2A', fontSize: '0.8rem' }}>{order.customer?.country || '—'}</td>
                    <td style={{ padding: '12px 14px', color: '#7b192c', fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {formatTRY(order.pricingTRY?.total || order.pricing?.total)}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ background: pst.bg, color: pst.color, padding: '3px 8px', borderRadius: 50, fontSize: '0.68rem', fontWeight: 700 }}>{pst.label}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ background: st.bg, color: st.color, padding: '3px 8px', borderRadius: 50, fontSize: '0.68rem', fontWeight: 700 }}>{st.label}</span>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#9C6B4E', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{formatDate(order.createdAt)}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button onClick={() => { setViewing(order); setTrackingInput(order.tracking || ''); setCarrierInput(order.carrier || ''); setNotesInput(order.notes || ''); setCancelReason('') }}
                          style={{ width: 30, height: 30, borderRadius: 8, background: '#fdf0f2', border: 'none', color: '#7b192c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FiEye size={13} />
                        </button>
                        <button onClick={() => deleteOrder(order.id)}
                          style={{ width: 30, height: 30, borderRadius: 8, background: '#FEE2E2', border: 'none', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#9C6B4E' }}>لا يوجد طلبات</div>}
      </div>

      {/* Modal */}
      {viewing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 22, padding: '24px 20px', width: '100%', maxWidth: 560, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h2 style={{ color: '#3E1C00', fontFamily: 'Amiri, serif', fontSize: '1.1rem' }}>{viewing.orderNumber}</h2>
                <p style={{ color: '#9C6B4E', fontSize: '0.73rem', marginTop: 2 }}>{formatDate(viewing.createdAt)}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => deleteOrder(viewing.id)} style={{ background: '#FEE2E2', border: 'none', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', color: '#DC2626', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', fontWeight: 600, fontFamily: 'Amiri, serif' }}>
                  <FiTrash2 size={13} /> حذف
                </button>
                <button onClick={() => setViewing(null)} style={{ background: '#F5E6D3', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#6B3A2A' }}>
                  <FiX size={16} />
                </button>
              </div>
            </div>

            {/* إيصال التحويل */}
            {viewing.payment?.receiptUrl && (
              <div style={{ background: '#FFF7ED', border: '2px solid #FB923C', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FiUpload size={16} color="#EA580C" />
                    <div>
                      <p style={{ color: '#EA580C', fontWeight: 700, fontSize: '0.88rem' }}>إيصال تحويل مرفوع</p>
                      <p style={{ color: '#9C6B4E', fontSize: '0.72rem' }}>رفعه الزبون كإثبات للدفع</p>
                    </div>
                  </div>
                  <a href={viewing.payment.receiptUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#EA580C', color: '#fff', padding: '7px 14px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.8rem' }}>
                    <FiExternalLink size={13} /> عرض الإيصال
                  </a>
                </div>
                {/* أزرار قبول / رفض الإيصال */}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button onClick={() => { updateOrderField(viewing.id, { status: 'confirmed', 'payment.status': 'paid' }); toast.success('تم قبول الإيصال وتأكيد الطلب! 📧') }} style={{ flex: 1, background: '#16A34A', color: '#fff', padding: '9px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: 'Amiri, serif' }}>
                    <FiCheck size={13} /> قبول وتأكيد الطلب
                  </button>
                  <button onClick={() => updateOrderField(viewing.id, { 'payment.status': 'failed' })} style={{ flex: 1, background: '#FEF2F2', color: '#DC2626', padding: '9px 0', borderRadius: 10, border: '2px solid #FCA5A5', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: 'Amiri, serif' }}>
                    <FiXCircle size={13} /> رفض الإيصال
                  </button>
                </div>
              </div>
            )}

            {/* الحالات */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div style={{ background: '#F5E6D3', borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ color: '#9C6B4E', fontSize: '0.7rem', marginBottom: 5 }}>حالة الطلب</p>
                <span style={{ background: statusConfig[viewing.status]?.bg, color: statusConfig[viewing.status]?.color, padding: '4px 12px', borderRadius: 50, fontSize: '0.78rem', fontWeight: 700 }}>
                  {statusConfig[viewing.status]?.label || viewing.status}
                </span>
              </div>
              <div style={{ background: '#F5E6D3', borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ color: '#9C6B4E', fontSize: '0.7rem', marginBottom: 5 }}>حالة الدفع</p>
                <span style={{ background: paymentStatusConfig[viewing.payment?.status]?.bg, color: paymentStatusConfig[viewing.payment?.status]?.color, padding: '4px 12px', borderRadius: 50, fontSize: '0.78rem', fontWeight: 700 }}>
                  {paymentStatusConfig[viewing.payment?.status]?.label || '—'}
                </span>
              </div>
            </div>

            {/* الخطوة التالية الواضحة */}
            <div style={{ background: '#FFFBF5', border: '1px solid #E2C9A8', borderRadius: 14, padding: '14px 16px', marginBottom: 14 }}>
              <p style={{ color: '#6B3A2A', fontWeight: 700, fontSize: '0.82rem', marginBottom: 10 }}>الإجراء المطلوب</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => changeStatus(viewing.id, 'confirmed')} style={{ flex: 1, minWidth: 120, background: 'linear-gradient(to left, #059669, #16A34A)', color: '#fff', padding: '10px 0', borderRadius: 10, fontWeight: 700, fontSize: '0.82rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: 'Amiri, serif' }}>
                  <FiCheck size={13} /> تأكيد + مدفوع
                </button>
                <button onClick={() => changeStatus(viewing.id, 'processing')} style={{ flex: 1, minWidth: 100, background: '#FEF3C7', color: '#D97706', padding: '10px 0', borderRadius: 10, fontWeight: 700, fontSize: '0.82rem', border: '2px solid #FDE68A', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: 'Amiri, serif' }}>
                  <FiRefreshCw size={13} /> جاري التجهيز
                </button>
                <button onClick={() => changeStatus(viewing.id, 'cancelled')} style={{ flex: 1, minWidth: 80, background: '#FEF2F2', color: '#DC2626', padding: '10px 0', borderRadius: 10, fontWeight: 700, fontSize: '0.82rem', border: '2px solid #FCA5A5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: 'Amiri, serif' }}>
                  <FiXCircle size={13} /> إلغاء
                </button>
              </div>
              <input value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="سبب الإلغاء (اختياري)" style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E2C9A8', fontSize: '0.8rem', outline: 'none', fontFamily: 'Amiri, serif', background: '#FFFBF5', boxSizing: 'border-box', marginTop: 8 }} />
            </div>

            {/* جميع الحالات */}
            <div style={{ marginBottom: 14 }}>
              <p style={{ color: '#9C6B4E', fontSize: '0.75rem', marginBottom: 8, fontWeight: 600 }}>
                تغيير الحالة اليدوي <span style={{ color: '#16A34A' }}>— يُرسل إيميل تلقائي للزبون</span>
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {Object.entries(statusConfig).map(([key, val]) => {
                  const isActive = viewing.status === key
                  return (
                    <button key={key} onClick={() => changeStatus(viewing.id, key)} style={{ padding: '5px 11px', borderRadius: 50, border: '2px solid', borderColor: isActive ? val.color : '#E2C9A8', background: isActive ? val.bg : '#fff', color: isActive ? val.color : '#6B3A2A', fontWeight: isActive ? 700 : 400, fontSize: '0.74rem', cursor: 'pointer', fontFamily: 'Amiri, serif', transition: 'all 0.15s' }}>
                      {isActive && '✓ '}{val.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* بيانات العميل */}
            <div style={{ background: '#fdf0f2', borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
              <p style={{ color: '#3E1C00', fontWeight: 700, marginBottom: 8, fontSize: '0.88rem' }}>بيانات العميل</p>
              <p style={{ color: '#6B3A2A', fontSize: '0.85rem', fontWeight: 600 }}>{viewing.customer?.firstName} {viewing.customer?.lastName}</p>
              <p style={{ color: '#9C6B4E', fontSize: '0.8rem' }}>{viewing.customer?.email}</p>
              <p style={{ color: '#9C6B4E', fontSize: '0.8rem' }}>{viewing.customer?.phone}</p>
              <p style={{ color: '#9C6B4E', fontSize: '0.8rem' }}>{[viewing.customer?.address, viewing.customer?.district, viewing.customer?.city, viewing.customer?.country].filter(Boolean).join('، ')}</p>
            </div>

            {/* المنتجات */}
            <div style={{ background: '#fdf0f2', borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
              <p style={{ color: '#3E1C00', fontWeight: 700, marginBottom: 10, fontSize: '0.88rem' }}>المنتجات</p>
              {(viewing.items || []).map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 8, padding: '8px 10px', marginBottom: 6 }}>
                  {item.image ? <img src={item.image} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                    : <div style={{ width: 32, height: 32, borderRadius: 6, background: '#E2C9A8', flexShrink: 0 }} />}
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#3E1C00', fontSize: '0.82rem', fontWeight: 600 }}>{item.name}</p>
                    <p style={{ color: '#9C6B4E', fontSize: '0.72rem' }}>{item.size} × {item.qty}</p>
                    {item.pkgItems?.length > 0 && (
                      <p style={{ color: '#7b192c', fontSize: '0.72rem', marginTop: 3, lineHeight: 1.6 }}>
                        📦 {item.pkgItems.map(pi => `${pi.name}${pi.qty > 1 ? ` ×${pi.qty}` : ''}`).join('، ')}
                      </p>
                    )}
                  </div>
                  <p style={{ color: '#7b192c', fontWeight: 700, fontSize: '0.82rem' }}>{formatTRY((item.priceTRY || item.price) * item.qty)}</p>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #E2C9A8', marginTop: 10, paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9C6B4E', fontSize: '0.8rem' }}>المجموع الفرعي</span>
                  <span style={{ color: '#3E1C00', fontSize: '0.8rem', fontWeight: 600 }}>{formatTRY(viewing.pricingTRY?.subtotal || viewing.pricing?.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9C6B4E', fontSize: '0.8rem' }}>الشحن</span>
                  <span style={{ color: '#3E1C00', fontSize: '0.8rem', fontWeight: 600 }}>{formatTRY(viewing.pricingTRY?.shipping || viewing.pricing?.shipping)}</span>
                </div>
                {viewing.pricing?.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#9C6B4E', fontSize: '0.8rem' }}>الخصم</span>
                    <span style={{ color: '#16A34A', fontSize: '0.8rem', fontWeight: 600 }}>-{formatTRY(viewing.pricingTRY?.discount || viewing.pricing?.discount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid #E2C9A8' }}>
                  <span style={{ color: '#3E1C00', fontWeight: 700 }}>الإجمالي</span>
                  <span style={{ color: '#7b192c', fontWeight: 900, fontSize: '1rem' }}>{formatTRY(viewing.pricingTRY?.total || viewing.pricing?.total)}</span>
                </div>
              </div>
            </div>

            {/* Basit Kargo — إرسال لشركة التوصيل (تركيا) */}
            {isTurkey(viewing.customer?.country) && (
              <div style={{ marginBottom: 12, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ color: '#3E1C00', fontWeight: 700, marginBottom: 8, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                  📦 إرسال لشركة التوصيل (Basit Kargo)
                </p>
                {viewing.basitKargo?.id ? (
                  <p style={{ color: '#16A34A', fontSize: '0.82rem', fontWeight: 600 }}>
                    ✓ تم الإرسال عبر {viewing.basitKargo.handlerCode} — رقم التتبّع: {viewing.basitKargo.id}
                  </p>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select value={kargoCarrier} onChange={e => setKargoCarrier(e.target.value)} style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '2px solid #BBF7D0', fontSize: '0.85rem', outline: 'none', fontFamily: 'Amiri, serif', background: '#fff', color: '#3E1C00' }}>
                      <option value="">اختر شركة الشحن...</option>
                      {KARGO_CARRIERS.map(k => <option key={k.code} value={k.code}>{k.name}</option>)}
                    </select>
                    <button onClick={sendToBasitKargo} disabled={kargoSending || !kargoCarrier} style={{ background: kargoSending || !kargoCarrier ? '#BBF7D0' : 'linear-gradient(to left, #15803d, #16A34A)', color: kargoSending || !kargoCarrier ? '#16A34A' : '#fff', padding: '9px 16px', borderRadius: 8, fontWeight: 700, fontSize: '0.82rem', border: 'none', cursor: kargoSending || !kargoCarrier ? 'not-allowed' : 'pointer', fontFamily: 'Amiri, serif', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
                      {kargoSending ? <FiRefreshCw size={13} className="spin" /> : '🚚 أرسل الشحنة'}
                    </button>
                  </div>
                )}
                <p style={{ color: '#6B7280', fontSize: '0.72rem', marginTop: 6 }}>سيُنشئ شحنة + رقم تتبّع، ويُحوّل الحالة لـ"قيد الشحن"، ويُرسل إيميل التتبّع للعميل.</p>
              </div>
            )}

            {/* رقم التتبع */}
            <div style={{ marginBottom: 12 }}>
              <p style={{ color: '#3E1C00', fontWeight: 700, marginBottom: 8, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                <FiPackage size={13} /> رقم التتبع
                <span style={{ color: '#16A34A', fontSize: '0.7rem', fontWeight: 400 }}>📧 يُرسل للزبون تلقائياً</span>
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input value={carrierInput} onChange={e => setCarrierInput(e.target.value)} placeholder="شركة الشحن (DHL, FedEx, Aramex...)" style={{ padding: '9px 12px', borderRadius: 8, border: '2px solid #E2C9A8', fontSize: '0.85rem', outline: 'none', fontFamily: 'Amiri, serif', background: '#FFFBF5' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={trackingInput} onChange={e => setTrackingInput(e.target.value)} placeholder="رقم التتبع" style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '2px solid #E2C9A8', fontSize: '0.85rem', outline: 'none', fontFamily: 'Amiri, serif', background: '#FFFBF5' }} />
                  <button onClick={saveTracking} disabled={saving || !trackingInput.trim()} style={{ background: saving || !trackingInput.trim() ? '#E2C9A8' : 'linear-gradient(to left, #7b192c, #a82040)', color: saving || !trackingInput.trim() ? '#9C6B4E' : '#f4be69', padding: '9px 14px', borderRadius: 8, fontWeight: 700, fontSize: '0.82rem', border: 'none', cursor: saving || !trackingInput.trim() ? 'not-allowed' : 'pointer', fontFamily: 'Amiri, serif' }}>
                    {saving ? <FiRefreshCw size={13} /> : 'حفظ + إرسال'}
                  </button>
                </div>
              </div>
              {viewing.tracking && <p style={{ color: '#16A34A', fontSize: '0.8rem', marginTop: 5, fontWeight: 600 }}>✓ {viewing.tracking} {viewing.carrier ? `— ${viewing.carrier}` : ''}</p>}
            </div>

            {/* ملاحظات */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ color: '#3E1C00', fontWeight: 700, marginBottom: 8, fontSize: '0.85rem' }}>ملاحظات داخلية</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <textarea value={notesInput} onChange={e => setNotesInput(e.target.value)} rows={2} placeholder="ملاحظات للأدمن فقط..." style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '2px solid #E2C9A8', fontSize: '0.85rem', outline: 'none', fontFamily: 'Amiri, serif', background: '#FFFBF5', resize: 'vertical' }} />
                <button onClick={saveNotes} disabled={saving} style={{ background: 'linear-gradient(to left, #7b192c, #a82040)', color: '#f4be69', padding: '9px 14px', borderRadius: 8, fontWeight: 700, fontSize: '0.82rem', border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}>
                  {saving ? <FiRefreshCw size={13} /> : 'حفظ'}
                </button>
              </div>
            </div>

            <button onClick={() => setViewing(null)} style={{ width: '100%', padding: '11px', borderRadius: 10, border: '2px solid #E2C9A8', background: '#fff', color: '#6B3A2A', cursor: 'pointer', fontFamily: 'Amiri, serif', fontWeight: 600 }}>
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  )
}