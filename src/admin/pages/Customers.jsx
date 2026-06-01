import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { FiSearch, FiEye, FiX, FiTrash2, FiEdit2, FiCheck, FiSlash, FiMapPin, FiPhone, FiMail, FiShoppingBag, FiCalendar, FiPlus } from 'react-icons/fi'
import { db } from '../../firebase'
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore'

const countriesList = [
  'السعودية', 'الإمارات', 'الكويت', 'قطر', 'البحرين', 'عمان',
  'الأردن', 'سوريا', 'لبنان', 'مصر', 'العراق',
  'Germany', 'Netherlands', 'France', 'Belgium', 'Sweden', 'UK', 'Other'
]

function AddressEditor({ addr, index, viewing, setViewing, inputStyle }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ ...addr })
  const [saving, setSaving] = useState(false)

  async function saveAddress() {
    setSaving(true)
    try {
      const addresses = [...(viewing.addresses || [])]
      addresses[index] = form
      await updateDoc(doc(db, 'users', viewing.id), { addresses })
      setViewing(v => ({ ...v, addresses }))
      setEditing(false)
      toast.success('تم حفظ العنوان!')
    } catch (err) {
      toast.error('فشل الحفظ: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteAddress() {
    if (!confirm('حذف هذا العنوان؟')) return
    try {
      const addresses = (viewing.addresses || []).filter((_, i) => i !== index)
      await updateDoc(doc(db, 'users', viewing.id), { addresses })
      setViewing(v => ({ ...v, addresses }))
      toast.success('تم حذف العنوان')
    } catch (err) {
      toast.error('فشل الحذف: ' + err.message)
    }
  }

  return (
    <div style={{ background: '#fdf0f2', borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        {addr.label && (
          <span style={{ background: '#7b192c', color: '#f4be69', padding: '2px 10px', borderRadius: 50, fontSize: '0.7rem', fontWeight: 700 }}>
            {addr.label}
          </span>
        )}
        <div style={{ display: 'flex', gap: 6, marginRight: 'auto' }}>
          <button onClick={() => setEditing(!editing)} style={{ background: '#fdf0f2', border: '1px solid #7b192c', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#7b192c', fontSize: '0.72rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
            <FiEdit2 size={10} /> {editing ? 'إلغاء' : 'تعديل'}
          </button>
          <button onClick={deleteAddress} style={{ background: '#FEE2E2', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#DC2626', fontSize: '0.72rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
            <FiTrash2 size={10} /> حذف
          </button>
        </div>
      </div>

      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <label style={{ color: '#3E1C00', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: 3 }}>التسمية</label>
            <input value={form.label || ''} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="مثل: البيت، العمل" style={inputStyle} />
          </div>
          <div>
            <label style={{ color: '#3E1C00', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: 3 }}>الشارع والرقم *</label>
            <input value={form.street || ''} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ color: '#3E1C00', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: 3 }}>المدينة</label>
              <input value={form.city || ''} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={{ color: '#3E1C00', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: 3 }}>الرمز البريدي</label>
              <input value={form.zip || ''} onChange={e => setForm(f => ({ ...f, zip: e.target.value }))} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={{ color: '#3E1C00', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: 3 }}>الدولة</label>
            <select value={form.country || ''} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} style={inputStyle}>
              <option value="">اختر</option>
              {countriesList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ color: '#3E1C00', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: 3 }}>رقم الهاتف</label>
            <input value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+49..." style={inputStyle} />
          </div>
          <button onClick={saveAddress} disabled={saving} style={{ background: saving ? '#E2C9A8' : 'linear-gradient(to left, #7b192c, #a82040)', color: saving ? '#9C6B4E' : '#f4be69', padding: '9px 0', borderRadius: 8, fontWeight: 700, fontSize: '0.82rem', border: 'none', cursor: 'pointer', fontFamily: 'Amiri, serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <FiCheck size={13} /> {saving ? 'جاري الحفظ...' : 'حفظ العنوان'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <p style={{ color: '#3E1C00', fontWeight: 700, fontSize: '0.85rem' }}>{addr.street}</p>
          {addr.zip && <p style={{ color: '#9C6B4E', fontSize: '0.78rem' }}>الرمز البريدي: {addr.zip}</p>}
          <p style={{ color: '#9C6B4E', fontSize: '0.78rem' }}>{addr.city} — {addr.country}</p>
          {addr.phone && (
            <p style={{ color: '#9C6B4E', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              <FiPhone size={11} /> {addr.phone}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCountry, setFilterCountry] = useState('الكل')
  const [filterGender, setFilterGender] = useState('الكل')
  const [filterBanned, setFilterBanned] = useState('الكل')
  const [viewing, setViewing] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [adminNote, setAdminNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('info')
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({ label: '', street: '', city: '', zip: '', country: '', phone: '' })
  const [savingAddress, setSavingAddress] = useState(false)

  useEffect(() => {
    const unsub1 = onSnapshot(
      query(collection(db, 'users'), orderBy('createdAt', 'desc')),
      snap => { setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false) }
    )
    const unsub2 = onSnapshot(collection(db, 'orders'), snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => { unsub1(); unsub2() }
  }, [])

  function getCustomerOrders(uid) {
    return orders.filter(o => o.customer?.uid === uid).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  function getCustomerTotal(uid) {
    return getCustomerOrders(uid).reduce((s, o) => s + (o.pricing?.total || 0), 0)
  }

  function getLastOrder(uid) {
    const co = getCustomerOrders(uid)
    return co.length > 0 ? co[0] : null
  }

  function getMostUsedPayment(uid) {
    const co = getCustomerOrders(uid)
    if (!co.length) return '—'
    const freq = {}
    co.forEach(o => { const m = o.payment?.method || 'unknown'; freq[m] = (freq[m] || 0) + 1 })
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]
  }

  function getMostBoughtProduct(uid) {
    const co = getCustomerOrders(uid)
    if (!co.length) return '—'
    const freq = {}
    co.forEach(o => o.items?.forEach(item => { freq[item.name] = (freq[item.name] || 0) + item.qty }))
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1])
    return sorted.length ? sorted[0][0] : '—'
  }

  const filtered = customers.filter(c => {
    const name = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase()
    const matchSearch = name.includes(search.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || '').includes(search)
    const matchCountry = filterCountry === 'الكل' || c.country === filterCountry
    const matchGender = filterGender === 'الكل' || c.gender === filterGender
    const matchBanned = filterBanned === 'الكل' || (filterBanned === 'محظور' ? c.banned : !c.banned)
    return matchSearch && matchCountry && matchGender && matchBanned
  })

  async function toggleBan(customerId, currentBanned) {
    try {
      await updateDoc(doc(db, 'users', customerId), { banned: !currentBanned })
      if (viewing?.id === customerId) setViewing(v => ({ ...v, banned: !currentBanned }))
      toast.success(currentBanned ? 'تم رفع الحظر' : 'تم حظر العميل')
    } catch (err) {
      toast.error('فشل: ' + err.message)
    }
  }

  async function deleteCustomer(customerId) {
    if (!confirm('هل أنت متأكد من حذف هذا العميل؟')) return
    try {
      await deleteDoc(doc(db, 'users', customerId))
      setViewing(null)
      toast.success('تم حذف العميل')
    } catch (err) {
      toast.error('فشل الحذف: ' + err.message)
    }
  }

  async function saveEdit() {
    if (!viewing) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'users', viewing.id), editForm)
      setViewing(v => ({ ...v, ...editForm }))
      setEditing(false)
      toast.success('تم حفظ البيانات!')
    } catch (err) {
      toast.error('فشل الحفظ: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function saveAdminNote() {
    if (!viewing) return
    setSavingNote(true)
    try {
      await updateDoc(doc(db, 'users', viewing.id), { adminNote })
      setViewing(v => ({ ...v, adminNote }))
      toast.success('تم حفظ الملاحظات!')
    } catch (err) {
      toast.error('فشل: ' + err.message)
    } finally {
      setSavingNote(false)
    }
  }

  async function addNewAddress() {
    if (!newAddress.street || !newAddress.city || !newAddress.country) return
    setSavingAddress(true)
    try {
      const addresses = [...(viewing.addresses || []), newAddress]
      await updateDoc(doc(db, 'users', viewing.id), { addresses })
      setViewing(v => ({ ...v, addresses }))
      setNewAddress({ label: '', street: '', city: '', zip: '', country: '', phone: '' })
      setShowAddAddress(false)
      toast.success('تمت إضافة العنوان!')
    } catch (err) {
      toast.error('فشل: ' + err.message)
    } finally {
      setSavingAddress(false)
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    border: '2px solid #E2C9A8', fontSize: '0.85rem', color: '#3E1C00',
    fontFamily: 'Amiri, serif', outline: 'none', background: '#FFFBF5', boxSizing: 'border-box',
  }

  const labelStyle = { color: '#3E1C00', fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: 4 }

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#7b192c' }}>جاري تحميل العملاء...</div>

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: '1.4rem', color: '#3E1C00', fontFamily: 'Amiri, serif' }}>العملاء</h1>
        <p style={{ color: '#9C6B4E', fontSize: '0.85rem' }}>{customers.length} عميل مسجل</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'إجمالي العملاء', value: customers.length, color: '#7b192c' },
          { label: 'محظورين', value: customers.filter(c => c.banned).length, color: '#DC2626' },
          { label: 'لديهم طلبات', value: customers.filter(c => getCustomerOrders(c.id).length > 0).length, color: '#16A34A' },
          { label: 'بدون طلبات', value: customers.filter(c => getCustomerOrders(c.id).length === 0).length, color: '#D97706' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '14px 12px', border: '1px solid #E2C9A8', textAlign: 'center' }}>
            <p style={{ color: s.color, fontWeight: 900, fontSize: '1.4rem' }}>{s.value}</p>
            <p style={{ color: '#9C6B4E', fontSize: '0.7rem', marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <FiSearch style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 12, color: '#9C6B4E', pointerEvents: 'none' }} size={15} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث باسم أو إيميل أو هاتف..." style={{ width: '100%', padding: '10px 38px 10px 12px', borderRadius: 50, border: '2px solid #E2C9A8', fontSize: '0.85rem', color: '#3E1C00', fontFamily: 'Amiri, serif', outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
        </div>
        <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)} style={{ padding: '10px 12px', borderRadius: 50, border: '2px solid #E2C9A8', fontSize: '0.82rem', color: '#3E1C00', fontFamily: 'Amiri, serif', outline: 'none', background: '#fff', cursor: 'pointer' }}>
          {['الكل', ...countriesList].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterGender} onChange={e => setFilterGender(e.target.value)} style={{ padding: '10px 12px', borderRadius: 50, border: '2px solid #E2C9A8', fontSize: '0.82rem', color: '#3E1C00', fontFamily: 'Amiri, serif', outline: 'none', background: '#fff', cursor: 'pointer' }}>
          <option value="الكل">كل الجنس</option>
          <option value="male">ذكر</option>
          <option value="female">أنثى</option>
        </select>
        <select value={filterBanned} onChange={e => setFilterBanned(e.target.value)} style={{ padding: '10px 12px', borderRadius: 50, border: '2px solid #E2C9A8', fontSize: '0.82rem', color: '#3E1C00', fontFamily: 'Amiri, serif', outline: 'none', background: '#fff', cursor: 'pointer' }}>
          <option value="الكل">الكل</option>
          <option value="نشط">نشط</option>
          <option value="محظور">محظور</option>
        </select>
      </div>

      <p style={{ color: '#9C6B4E', fontSize: '0.78rem', marginBottom: 12 }}>{filtered.length} نتيجة</p>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E2C9A8', boxShadow: '0 2px 12px rgba(62,28,0,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F5E6D3' }}>
                {['العميل', 'الدولة', 'الجنس', 'الهاتف', 'الطلبات', 'الإجمالي', 'آخر طلب', 'الحالة', ''].map((h, i) => (
                  <th key={i} style={{ padding: '12px 14px', textAlign: 'right', color: '#6B3A2A', fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap', borderBottom: '1px solid #E2C9A8' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const co = getCustomerOrders(c.id)
                const total = getCustomerTotal(c.id)
                const lastOrder = getLastOrder(c.id)
                const initials = `${c.firstName?.charAt(0) || ''}${c.lastName?.charAt(0) || ''}`.toUpperCase() || '?'
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid #F5E6D3', background: c.banned ? '#FEF2F2' : i % 2 === 0 ? '#fff' : '#FFFBF5' }}>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: c.banned ? '#FCA5A5' : 'linear-gradient(135deg, #7b192c, #a82040)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.78rem', flexShrink: 0, overflow: 'hidden' }}>
                          {c.photoURL ? <img src={c.photoURL} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : initials}
                        </div>
                        <div>
                          <p style={{ color: '#3E1C00', fontWeight: 700, fontSize: '0.82rem' }}>{c.firstName} {c.lastName}</p>
                          <p style={{ color: '#9C6B4E', fontSize: '0.7rem' }}>{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '11px 14px', color: '#6B3A2A', fontSize: '0.8rem' }}>{c.country || '—'}</td>
                    <td style={{ padding: '11px 14px', color: '#6B3A2A', fontSize: '0.8rem' }}>{c.gender === 'male' ? 'ذكر' : c.gender === 'female' ? 'أنثى' : '—'}</td>
                    <td style={{ padding: '11px 14px', color: '#6B3A2A', fontSize: '0.78rem', direction: 'ltr' }}>{c.phone || '—'}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ background: '#fdf0f2', color: '#7b192c', padding: '2px 9px', borderRadius: 50, fontSize: '0.73rem', fontWeight: 700 }}>{co.length}</span>
                    </td>
                    <td style={{ padding: '11px 14px', color: '#7b192c', fontWeight: 700, fontSize: '0.8rem' }}>€{total.toFixed(2)}</td>
                    <td style={{ padding: '11px 14px', color: '#9C6B4E', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{lastOrder ? formatDate(lastOrder.createdAt) : '—'}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ background: c.banned ? '#FEF2F2' : '#F0FDF4', color: c.banned ? '#DC2626' : '#16A34A', padding: '2px 9px', borderRadius: 50, fontSize: '0.7rem', fontWeight: 700 }}>
                        {c.banned ? 'محظور' : 'نشط'}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => { setViewing(c); setEditing(false); setActiveTab('info'); setAdminNote(c.adminNote || ''); setShowAddAddress(false) }} style={{ width: 26, height: 26, borderRadius: 6, background: '#fdf0f2', border: 'none', color: '#7b192c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FiEye size={11} />
                        </button>
                        <button onClick={() => toggleBan(c.id, c.banned)} style={{ width: 26, height: 26, borderRadius: 6, background: c.banned ? '#F0FDF4' : '#FEF3C7', border: 'none', color: c.banned ? '#16A34A' : '#D97706', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FiSlash size={11} />
                        </button>
                        <button onClick={() => deleteCustomer(c.id)} style={{ width: 26, height: 26, borderRadius: 6, background: '#FEE2E2', border: 'none', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FiTrash2 size={11} />
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
          <div style={{ textAlign: 'center', padding: '40px', color: '#9C6B4E', fontSize: '0.88rem' }}>لا يوجد عملاء</div>
        )}
      </div>

      {/* Modal */}
      {viewing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '22px 18px', width: '100%', maxWidth: 560, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: viewing.banned ? '#FCA5A5' : 'linear-gradient(135deg, #7b192c, #a82040)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '1.1rem', overflow: 'hidden', flexShrink: 0 }}>
                  {viewing.photoURL ? <img src={viewing.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : `${viewing.firstName?.charAt(0) || ''}${viewing.lastName?.charAt(0) || ''}`}
                </div>
                <div>
                  <h3 style={{ color: '#3E1C00', fontWeight: 700, fontSize: '1rem' }}>{viewing.firstName} {viewing.lastName}</h3>
                  <p style={{ color: '#9C6B4E', fontSize: '0.75rem' }}>{viewing.email}</p>
                  {viewing.banned && <span style={{ background: '#FEF2F2', color: '#DC2626', padding: '1px 8px', borderRadius: 50, fontSize: '0.68rem', fontWeight: 700 }}>محظور</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {!editing && (
                  <button onClick={() => { setEditing(true); setEditForm({ firstName: viewing.firstName || '', lastName: viewing.lastName || '', phone: viewing.phone || '', country: viewing.country || '', gender: viewing.gender || '' }) }} style={{ background: '#fdf0f2', border: 'none', borderRadius: 7, padding: '5px 9px', cursor: 'pointer', color: '#7b192c', display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.75rem', fontWeight: 600 }}>
                    <FiEdit2 size={11} /> تعديل
                  </button>
                )}
                <button onClick={() => toggleBan(viewing.id, viewing.banned)} style={{ background: viewing.banned ? '#F0FDF4' : '#FEF3C7', border: 'none', borderRadius: 7, padding: '5px 9px', cursor: 'pointer', color: viewing.banned ? '#16A34A' : '#D97706', display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.75rem', fontWeight: 600 }}>
                  <FiSlash size={11} /> {viewing.banned ? 'رفع الحظر' : 'حظر'}
                </button>
                <button onClick={() => deleteCustomer(viewing.id)} style={{ background: '#FEE2E2', border: 'none', borderRadius: 7, padding: '5px 9px', cursor: 'pointer', color: '#DC2626', display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.75rem', fontWeight: 600 }}>
                  <FiTrash2 size={11} /> حذف
                </button>
                <button onClick={() => setViewing(null)} style={{ background: '#F5E6D3', border: 'none', borderRadius: 7, padding: 6, cursor: 'pointer', color: '#6B3A2A' }}>
                  <FiX size={14} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, borderBottom: '2px solid #F5E6D3', paddingBottom: 12, flexWrap: 'wrap' }}>
              {[
                { id: 'info', label: 'المعلومات' },
                { id: 'addresses', label: `العناوين (${(viewing.addresses || []).length})` },
                { id: 'orders', label: `الطلبات (${getCustomerOrders(viewing.id).length})` },
                { id: 'stats', label: 'الإحصائيات' },
                { id: 'notes', label: 'ملاحظات' },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '6px 12px', borderRadius: 8, border: '2px solid', borderColor: activeTab === tab.id ? '#7b192c' : '#E2C9A8', background: activeTab === tab.id ? 'linear-gradient(to left, #7b192c, #a82040)' : '#fff', color: activeTab === tab.id ? '#f4be69' : '#6B3A2A', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'Amiri, serif', whiteSpace: 'nowrap' }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: المعلومات */}
            {activeTab === 'info' && (
              <div>
                {editing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={labelStyle}>الاسم الأول</label>
                        <input value={editForm.firstName} onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>الاسم الثاني</label>
                        <input value={editForm.lastName} onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))} style={inputStyle} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>الهاتف</label>
                      <input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>الدولة</label>
                      <select value={editForm.country} onChange={e => setEditForm(f => ({ ...f, country: e.target.value }))} style={inputStyle}>
                        <option value="">اختر</option>
                        {countriesList.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>الجنس</label>
                      <select value={editForm.gender} onChange={e => setEditForm(f => ({ ...f, gender: e.target.value }))} style={inputStyle}>
                        <option value="">اختر</option>
                        <option value="male">ذكر</option>
                        <option value="female">أنثى</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={saveEdit} disabled={saving} style={{ flex: 1, background: 'linear-gradient(to left, #7b192c, #a82040)', color: '#f4be69', padding: '10px 0', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: 'Amiri, serif' }}>
                        <FiCheck size={13} /> {saving ? 'جاري الحفظ...' : 'حفظ'}
                      </button>
                      <button onClick={() => setEditing(false)} style={{ padding: '10px 14px', borderRadius: 10, border: '2px solid #E2C9A8', background: '#fff', color: '#6B3A2A', cursor: 'pointer', fontFamily: 'Amiri, serif' }}>إلغاء</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {[
                      { icon: <FiMail size={13} color="#7b192c" />, label: 'البريد الإلكتروني', value: viewing.email },
                      { icon: <FiPhone size={13} color="#7b192c" />, label: 'رقم الهاتف', value: viewing.phone || '—' },
                      { icon: <FiMapPin size={13} color="#7b192c" />, label: 'الدولة', value: viewing.country || '—' },
                      { label: 'الجنس', value: viewing.gender === 'male' ? 'ذكر' : viewing.gender === 'female' ? 'أنثى' : '—' },
                      { icon: <FiCalendar size={13} color="#7b192c" />, label: 'تاريخ الانضمام', value: formatDate(viewing.createdAt) },
                      { label: 'طريقة الدخول', value: viewing.provider === 'google' ? 'Google' : 'بريد إلكتروني' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: '#F5E6D3', borderRadius: 8 }}>
                        <span style={{ color: '#9C6B4E', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 5 }}>{item.icon}{item.label}</span>
                        <span style={{ color: '#3E1C00', fontWeight: 700, fontSize: '0.8rem' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: العناوين */}
            {activeTab === 'addresses' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <p style={{ color: '#3E1C00', fontWeight: 700, fontSize: '0.88rem' }}>عناوين التوصيل</p>
                  <button onClick={() => setShowAddAddress(!showAddAddress)} style={{ background: 'linear-gradient(to left, #7b192c, #a82040)', color: '#f4be69', border: 'none', borderRadius: 50, padding: '6px 12px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Amiri, serif' }}>
                    <FiPlus size={12} /> إضافة عنوان
                  </button>
                </div>

                {showAddAddress && (
                  <div style={{ background: '#fdf0f2', borderRadius: 12, padding: '14px 16px', marginBottom: 12, border: '2px solid #7b192c' }}>
                    <p style={{ color: '#7b192c', fontWeight: 700, fontSize: '0.82rem', marginBottom: 10 }}>عنوان جديد</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div>
                        <label style={{ color: '#3E1C00', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: 3 }}>التسمية</label>
                        <input value={newAddress.label} onChange={e => setNewAddress(f => ({ ...f, label: e.target.value }))} placeholder="مثل: البيت، العمل" style={inputStyle} />
                      </div>
                      <div>
                        <label style={{ color: '#3E1C00', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: 3 }}>الشارع والرقم *</label>
                        <input value={newAddress.street} onChange={e => setNewAddress(f => ({ ...f, street: e.target.value }))} style={inputStyle} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div>
                          <label style={{ color: '#3E1C00', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: 3 }}>المدينة *</label>
                          <input value={newAddress.city} onChange={e => setNewAddress(f => ({ ...f, city: e.target.value }))} style={inputStyle} />
                        </div>
                        <div>
                          <label style={{ color: '#3E1C00', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: 3 }}>الرمز البريدي</label>
                          <input value={newAddress.zip} onChange={e => setNewAddress(f => ({ ...f, zip: e.target.value }))} style={inputStyle} />
                        </div>
                      </div>
                      <div>
                        <label style={{ color: '#3E1C00', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: 3 }}>الدولة *</label>
                        <select value={newAddress.country} onChange={e => setNewAddress(f => ({ ...f, country: e.target.value }))} style={inputStyle}>
                          <option value="">اختر</option>
                          {countriesList.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ color: '#3E1C00', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: 3 }}>رقم الهاتف</label>
                        <input value={newAddress.phone} onChange={e => setNewAddress(f => ({ ...f, phone: e.target.value }))} placeholder="+49..." style={inputStyle} />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={addNewAddress} disabled={savingAddress} style={{ flex: 1, background: 'linear-gradient(to left, #7b192c, #a82040)', color: '#f4be69', padding: '9px 0', borderRadius: 8, fontWeight: 700, fontSize: '0.82rem', border: 'none', cursor: 'pointer', fontFamily: 'Amiri, serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                          <FiCheck size={13} /> {savingAddress ? 'جاري الحفظ...' : 'حفظ'}
                        </button>
                        <button onClick={() => setShowAddAddress(false)} style={{ padding: '9px 14px', borderRadius: 8, border: '2px solid #E2C9A8', background: '#fff', color: '#6B3A2A', cursor: 'pointer', fontFamily: 'Amiri, serif' }}>إلغاء</button>
                      </div>
                    </div>
                  </div>
                )}

                {(viewing.addresses || []).length === 0 && !showAddAddress ? (
                  <p style={{ color: '#9C6B4E', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>لا يوجد عناوين محفوظة</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(viewing.addresses || []).map((addr, i) => (
                      <AddressEditor key={i} addr={addr} index={i} viewing={viewing} setViewing={setViewing} inputStyle={inputStyle} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: الطلبات */}
            {activeTab === 'orders' && (
              <div>
                {getCustomerOrders(viewing.id).length === 0 ? (
                  <p style={{ color: '#9C6B4E', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>لا يوجد طلبات</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {getCustomerOrders(viewing.id).map((o, i) => (
                      <div key={i} style={{ background: '#fdf0f2', borderRadius: 12, padding: '14px 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <p style={{ color: '#7b192c', fontWeight: 700, fontSize: '0.85rem' }}>{o.orderNumber}</p>
                          <span style={{ color: '#7b192c', fontWeight: 900, fontSize: '0.9rem' }}>€{o.pricing?.total?.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                          <span style={{ background: '#fff', color: '#9C6B4E', padding: '2px 8px', borderRadius: 50, fontSize: '0.7rem', border: '1px solid #E2C9A8' }}>{formatDate(o.createdAt)}</span>
                          <span style={{ background: o.payment?.status === 'paid' ? '#F0FDF4' : '#FEF3C7', color: o.payment?.status === 'paid' ? '#16A34A' : '#D97706', padding: '2px 8px', borderRadius: 50, fontSize: '0.7rem', fontWeight: 700 }}>
                            {o.payment?.status === 'paid' ? 'مدفوع' : 'لم يُسدَّد'}
                          </span>
                          <span style={{ background: '#fff', color: '#6B3A2A', padding: '2px 8px', borderRadius: 50, fontSize: '0.7rem', border: '1px solid #E2C9A8' }}>{o.payment?.method}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          {(o.items || []).map((item, j) => (
                            <p key={j} style={{ color: '#6B3A2A', fontSize: '0.78rem' }}>• {item.name} — {item.size} × {item.qty}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: الإحصائيات */}
            {activeTab === 'stats' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  { icon: <FiShoppingBag size={13} color="#7b192c" />, label: 'عدد الطلبات', value: getCustomerOrders(viewing.id).length },
                  { label: 'إجمالي المشتريات', value: `€${getCustomerTotal(viewing.id).toFixed(2)}` },
                  { label: 'متوسط قيمة الطلب', value: getCustomerOrders(viewing.id).length > 0 ? `€${(getCustomerTotal(viewing.id) / getCustomerOrders(viewing.id).length).toFixed(2)}` : '—' },
                  { icon: <FiCalendar size={13} color="#7b192c" />, label: 'آخر طلب', value: getLastOrder(viewing.id) ? formatDate(getLastOrder(viewing.id).createdAt) : '—' },
                  { label: 'أكثر منتج مشترى', value: getMostBoughtProduct(viewing.id) },
                  { label: 'طريقة الدفع المفضلة', value: getMostUsedPayment(viewing.id) },
                  { label: 'الطلبات المدفوعة', value: getCustomerOrders(viewing.id).filter(o => o.payment?.status === 'paid').length },
                  { label: 'الطلبات الملغية', value: getCustomerOrders(viewing.id).filter(o => o.status === 'cancelled').length },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: '#F5E6D3', borderRadius: 8 }}>
                    <span style={{ color: '#9C6B4E', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 5 }}>{item.icon}{item.label}</span>
                    <span style={{ color: '#3E1C00', fontWeight: 700, fontSize: '0.8rem' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: ملاحظات */}
            {activeTab === 'notes' && (
              <div>
                <p style={{ color: '#9C6B4E', fontSize: '0.78rem', marginBottom: 8 }}>ملاحظات داخلية — مرئية للأدمن فقط</p>
                <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={6} placeholder="أضف ملاحظاتك عن هذا العميل..." style={{ ...inputStyle, resize: 'vertical', marginBottom: 10 }} />
                <button onClick={saveAdminNote} disabled={savingNote} style={{ width: '100%', background: savingNote ? '#E2C9A8' : 'linear-gradient(to left, #7b192c, #a82040)', color: savingNote ? '#9C6B4E' : '#f4be69', padding: '11px 0', borderRadius: 10, fontWeight: 700, fontSize: '0.88rem', border: 'none', cursor: 'pointer', fontFamily: 'Amiri, serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <FiCheck size={14} /> {savingNote ? 'جاري الحفظ...' : 'حفظ الملاحظات'}
                </button>
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <button onClick={() => setViewing(null)} style={{ width: '100%', padding: '11px', borderRadius: 10, border: '2px solid #E2C9A8', background: '#fff', color: '#6B3A2A', cursor: 'pointer', fontFamily: 'Amiri, serif', fontWeight: 600 }}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}