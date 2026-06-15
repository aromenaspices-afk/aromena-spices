import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { db } from '../firebase'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { getStatus } from '../utils/orderStatus'
import {
  FiLogOut, FiUser, FiEdit2, FiCheck,
  FiPlus, FiTrash2, FiLock, FiMapPin, FiPhone,
  FiShoppingBag, FiPackage, FiChevronDown, FiChevronUp,
  FiAlertCircle,
} from 'react-icons/fi'

// الحالات من المصدر الموحّد عبر getStatus(order.status) — تُغطّي كلّ حالات الإدارة

const paymentConfig = {
  pending:          { label_ar: 'لم يُسدَّد',  label_en: 'Unpaid',          bg: '#FEF3C7', color: '#D97706' },
  receipt_uploaded: { label_ar: 'إيصال مرفوع', label_en: 'Receipt Uploaded', bg: '#FFF7ED', color: '#EA580C' },
  paid:     { label_ar: 'مدفوع',      label_en: 'Paid',      bg: '#F0FDF4', color: '#16A34A' },
  failed:   { label_ar: 'فشل',        label_en: 'Failed',    bg: '#FEF2F2', color: '#DC2626' },
  refunded: { label_ar: 'مُسترجع',    label_en: 'Refunded',  bg: '#F5F3FF', color: '#7C3AED' },
}

export default function Account() {
  const { i18n } = useTranslation()
  const isAr = i18n.language === 'ar'
  const { user, profile, updateUserProfile, changePassword, logout } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('orders')
  const [myOrders, setMyOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState(null)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const prevStatusRef = useRef(null) // لكشف تغيّر الحالة وإظهار تنبيه فوريّ

  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)

  const [showAddAddress, setShowAddAddress] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [addressForm, setAddressForm] = useState({ label: '', street: '', city: '', country: '', zip: '', phone: '' })
  const [savingAddress, setSavingAddress] = useState(false)

  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const countries = [
    'السعودية', 'الإمارات', 'الكويت', 'قطر', 'البحرين', 'عمان',
    'الأردن', 'سوريا', 'لبنان', 'مصر', 'العراق',
    'Germany', 'Netherlands', 'France', 'Belgium', 'Sweden', 'UK', 'Other'
  ]

  
  useEffect(() => {
    if (!user) return

    prevStatusRef.current = null // بداية نظيفة لكلّ مستخدم
    setOrdersLoading(true)
    setOrdersError(null)

    let q
    try {
      q = query(
        collection(db, 'orders'),
        where('customer.uid', '==', user.uid),
        orderBy('createdAt', 'desc')
      )
    } catch (err) {
      console.error('Query build error:', err)
      setOrdersLoading(false)
      setOrdersError(err.message)
      return
    }

    const unsub = onSnapshot(
      q,
      (snap) => {
        const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        // تنبيه فوريّ عند تغيّر حالة طلب موجود (لا يظهر عند أوّل تحميل)
        const prev = prevStatusRef.current
        if (prev) {
          orders.forEach(o => {
            if (prev[o.id] && prev[o.id] !== o.status) {
              const lbl = isAr ? getStatus(o.status).label_ar : getStatus(o.status).label_en
              toast.success(isAr ? `تحدّثت حالة طلبك ${o.orderNumber || ''}: ${lbl}` : `Order ${o.orderNumber || ''} updated: ${lbl}`)
            }
          })
        }
        prevStatusRef.current = Object.fromEntries(orders.map(o => [o.id, o.status]))
        setMyOrders(orders)
        setOrdersLoading(false)
        setOrdersError(null)
      },
      (err) => {
        console.error('Orders snapshot error:', err)

        setOrdersLoading(false)
        if (err.code === 'failed-precondition') {
          
          setOrdersError('index')
        } else if (err.code === 'permission-denied') {
          setOrdersError('permission')
        } else {
          setOrdersError('unknown')
        }
      }
    )

    return () => unsub()
  }, [user])

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    borderRadius: 10, border: '2px solid #E2C9A8',
    fontSize: '0.9rem', color: '#3E1C00',
    fontFamily: 'Tajawal, sans-serif', outline: 'none',
    background: '#FFFBF5', boxSizing: 'border-box',
  }

  const labelStyle = {
    color: '#3E1C00', fontSize: '0.82rem',
    fontWeight: 600, display: 'block', marginBottom: 5,
  }

  if (!user) return (
    <div style={{ background: '#F5E6D3', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#3E1C00', fontFamily: 'Tajawal, sans-serif', marginBottom: 12 }}>
          {isAr ? 'يجب تسجيل الدخول أولاً' : 'Please login first'}
        </h2>
        <Link to="/login" style={{ background: 'linear-gradient(to left, #7b192c, #a82040)', color: '#f4be69', padding: '12px 32px', borderRadius: 50, fontWeight: 700, textDecoration: 'none' }}>
          {isAr ? 'تسجيل الدخول' : 'Login'}
        </Link>
      </div>
    </div>
  )

  function startEditProfile() {
    setProfileForm({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      gender: profile?.gender || '',
      phone: profile?.phone || '',
      country: profile?.country || '',
    })
    setEditingProfile(true)
  }

  async function saveProfile() {
    setSavingProfile(true)
    try {
      await updateUserProfile(profileForm)
      setEditingProfile(false)
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch { alert(isAr ? 'فشل الحفظ' : 'Save failed') }
    finally { setSavingProfile(false) }
  }

  async function saveAddress() {
    if (!addressForm.street || !addressForm.city || !addressForm.country) return
    setSavingAddress(true)
    try {
      const addresses = [...(profile?.addresses || [])]
      if (editingAddress !== null) { addresses[editingAddress] = addressForm }
      else { addresses.push(addressForm) }
      await updateUserProfile({ addresses })
      setShowAddAddress(false)
      setEditingAddress(null)
      setAddressForm({ label: '', street: '', city: '', country: '', zip: '', phone: '' })
    } catch { alert(isAr ? 'فشل الحفظ' : 'Save failed') }
    finally { setSavingAddress(false) }
  }

  async function deleteAddress(i) {
    if (!confirm(isAr ? 'حذف العنوان؟' : 'Delete address?')) return
    const addresses = (profile?.addresses || []).filter((_, idx) => idx !== i)
    await updateUserProfile({ addresses })
  }

  function editAddress(i) {
    setAddressForm(profile.addresses[i])
    setEditingAddress(i)
    setShowAddAddress(true)
  }

  async function handleChangePassword() {
    if (!passwordForm.current || !passwordForm.newPass) return
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match')
      return
    }
    if (passwordForm.newPass.length < 6) {
      setPasswordError(isAr ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Min 6 characters')
      return
    }
    setPasswordLoading(true)
    setPasswordError('')
    try {
      await changePassword(passwordForm.current, passwordForm.newPass)
      setPasswordSuccess(true)
      setPasswordForm({ current: '', newPass: '', confirm: '' })
      setTimeout(() => setPasswordSuccess(false), 4000)
    } catch (err) {
      if (err.code === 'auth/wrong-password') {
        setPasswordError(isAr ? 'كلمة المرور الحالية غير صحيحة' : 'Current password is wrong')
      } else {
        setPasswordError(isAr ? 'حدث خطأ، حاول مرة ثانية' : 'Something went wrong')
      }
    } finally { setPasswordLoading(false) }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  }

  const tabs = [
    { id: 'orders',    label: isAr ? `طلباتي (${myOrders.length})` : `My Orders (${myOrders.length})` },
    { id: 'profile',   label: isAr ? 'البروفايل' : 'Profile' },
    { id: 'addresses', label: isAr ? 'العناوين' : 'Addresses' },
    { id: 'password',  label: isAr ? 'كلمة المرور' : 'Password' },
  ]

  // مكوّن عرض حالة الطلبات (loading / error / empty / list)
  function renderOrders() {
    if (ordersLoading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px', color: '#7b192c', fontSize: '0.9rem' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #E2C9A8', borderTopColor: '#7b192c', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
          {isAr ? 'جاري تحميل الطّلبات...' : 'Loading orders...'}
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )
    }

    if (ordersError) {
      let msg = isAr ? 'حدث خطأ أثناء تحميل الطّلبات.' : 'Error loading orders.'
      let hint = null

      if (ordersError === 'index') {
        msg = isAr
          ? 'يحتاج الموقع إعداداً بسيطاً في Firebase.'
          : 'Firebase index setup required.'
        hint = isAr
          ? 'افتح Console المتصفح (F12) وانقر على الرابط الأزرق لإنشاء الـ Index تلقائياً، ثم أعد تحميل الصفحة.'
          : 'Open browser Console (F12) and click the blue link to create the Index automatically, then reload.'
      } else if (ordersError === 'permission') {
        msg = isAr ? 'لا توجد صلاحية لعرض الطّلبات.' : 'Permission denied.'
        hint = isAr ? 'تأكّد من إعدادات Firestore Security Rules.' : 'Check Firestore Security Rules.'
      }

      return (
        <div style={{ background: '#FEF2F2', borderRadius: 16, border: '1px solid #FCA5A5', padding: '24px', textAlign: 'center' }}>
          <FiAlertCircle size={32} color="#DC2626" style={{ marginBottom: 10 }} />
          <p style={{ color: '#DC2626', fontWeight: 700, fontSize: '0.9rem', marginBottom: 6 }}>{msg}</p>
          {hint && <p style={{ color: '#9C6B4E', fontSize: '0.8rem', lineHeight: 1.6 }}>{hint}</p>}
          <button
            onClick={() => { setOrdersLoading(true); setOrdersError(null) }}
            style={{ marginTop: 14, background: 'linear-gradient(to left, #7b192c, #a82040)', color: '#f4be69', border: 'none', borderRadius: 50, padding: '8px 20px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', fontFamily: 'Tajawal, sans-serif' }}
          >
            {isAr ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      )
    }

    if (myOrders.length === 0) {
      return (
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E2C9A8', padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fdf0f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <FiShoppingBag size={28} color="#7b192c" />
          </div>
          <h3 style={{ color: '#3E1C00', fontFamily: 'Tajawal, sans-serif', marginBottom: 8, fontSize: '1rem' }}>
            {isAr ? 'لا يوجد طلبات بعد' : 'No orders yet'}
          </h3>
          <p style={{ color: '#9C6B4E', fontSize: '0.85rem', marginBottom: 20 }}>
            {isAr ? 'ابدأ التّسوّق الآن!' : 'Start shopping now!'}
          </p>
          <Link to="/products" style={{ background: 'linear-gradient(to left, #7b192c, #a82040)', color: '#f4be69', padding: '10px 24px', borderRadius: 50, fontWeight: 700, textDecoration: 'none', fontSize: '0.88rem' }}>
            {isAr ? 'تسوّق الآن' : 'Shop Now'}
          </Link>
        </div>
      )
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {myOrders.map(order => {
          const st = getStatus(order.status)
          const pst = paymentConfig[order.payment?.status] || paymentConfig.pending
          const isExpanded = expandedOrder === order.id

          return (
            <div key={order.id} style={{ background: '#fff', borderRadius: 18, border: '1px solid #E2C9A8', boxShadow: '0 2px 12px rgba(123,25,44,0.05)', overflow: 'hidden' }}>

              {/* Order Header */}
              <div
                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                style={{ padding: '16px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: st.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FiPackage size={20} color={st.color} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <p style={{ color: '#7b192c', fontWeight: 800, fontSize: '0.88rem' }}>
                      {order.orderNumber}
                    </p>
                    <span style={{ background: st.bg, color: st.color, padding: '2px 8px', borderRadius: 50, fontSize: '0.68rem', fontWeight: 700 }}>
                      {isAr ? st.label_ar : st.label_en}
                    </span>
                    <span style={{ background: pst.bg, color: pst.color, padding: '2px 8px', borderRadius: 50, fontSize: '0.68rem', fontWeight: 700 }}>
                      {isAr ? pst.label_ar : pst.label_en}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <p style={{ color: '#9C6B4E', fontSize: '0.75rem' }}>{formatDate(order.createdAt)}</p>
                    <p style={{ color: '#9C6B4E', fontSize: '0.75rem' }}>
                      {order.items?.length} {isAr ? 'منتج' : 'items'}
                    </p>
                    <p style={{ color: '#7b192c', fontWeight: 700, fontSize: '0.78rem' }}>
                      €{order.pricing?.total?.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div style={{ color: '#9C6B4E', flexShrink: 0 }}>
                  {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                </div>
              </div>

              {/* Order Details */}
              {isExpanded && (
                <div style={{ padding: '0 18px 18px', borderTop: '1px solid #F5E6D3' }}>

                  {/* المنتجات */}
                  <p style={{ color: '#3E1C00', fontWeight: 700, fontSize: '0.85rem', margin: '14px 0 8px' }}>
                    {isAr ? 'المنتجات' : 'Products'}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                    {(order.items || []).map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fdf0f2', borderRadius: 10, padding: '9px 12px' }}>
                        {item.image
                          ? <img src={item.image} alt="" style={{ width: 36, height: 36, borderRadius: 7, objectFit: 'cover', flexShrink: 0 }} />
                          : <div style={{ width: 36, height: 36, borderRadius: 7, background: '#E2C9A8', flexShrink: 0 }} />
                        }
                        <div style={{ flex: 1 }}>
                          <p style={{ color: '#3E1C00', fontWeight: 600, fontSize: '0.83rem' }}>{item.name}</p>
                          <p style={{ color: '#9C6B4E', fontSize: '0.73rem' }}>{item.size} × {item.qty}</p>
                          {item.pkgItems?.length > 0 && (
                            <p style={{ color: '#7b192c', fontSize: '0.72rem', marginTop: 4, lineHeight: 1.6 }}>
                              📦 {item.pkgItems.map(pi => `${pi.name}${pi.qty > 1 ? ` ×${pi.qty}` : ''}`).join('، ')}
                            </p>
                          )}
                        </div>
                        <p style={{ color: '#7b192c', fontWeight: 700, fontSize: '0.82rem' }}>
                          €{(item.price * item.qty).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* ملخص التسعير */}
                  <div style={{ background: '#F5E6D3', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#9C6B4E', fontSize: '0.8rem' }}>{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
                        <span style={{ color: '#3E1C00', fontWeight: 600, fontSize: '0.8rem' }}>€{order.pricing?.subtotal?.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#9C6B4E', fontSize: '0.8rem' }}>{isAr ? 'الشّحن' : 'Shipping'}</span>
                        <span style={{ color: order.pricing?.shipping === 0 ? '#16A34A' : '#3E1C00', fontWeight: 600, fontSize: '0.8rem' }}>
                          {order.pricing?.shipping === 0 ? (isAr ? 'مجاني' : 'Free') : `€${order.pricing?.shipping?.toFixed(2)}`}
                        </span>
                      </div>
                      {order.pricing?.discount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#9C6B4E', fontSize: '0.8rem' }}>{isAr ? 'الخصم' : 'Discount'}</span>
                          <span style={{ color: '#16A34A', fontWeight: 600, fontSize: '0.8rem' }}>-€{order.pricing?.discount?.toFixed(2)}</span>
                        </div>
                      )}
                      <div style={{ borderTop: '1px solid #E2C9A8', paddingTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#3E1C00', fontWeight: 700, fontSize: '0.85rem' }}>{isAr ? 'الإجمالي' : 'Total'}</span>
                        <span style={{ color: '#7b192c', fontWeight: 900, fontSize: '0.95rem' }}>€{order.pricing?.total?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* معلومات إضافية */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={{ background: '#F5E6D3', borderRadius: 8, padding: '10px 12px' }}>
                      <p style={{ color: '#9C6B4E', fontSize: '0.72rem', marginBottom: 3 }}>{isAr ? 'طريقة الدفع' : 'Payment'}</p>
                      <p style={{ color: '#3E1C00', fontWeight: 600, fontSize: '0.82rem' }}>{order.payment?.method || '—'}</p>
                    </div>
                    <div style={{ background: '#F5E6D3', borderRadius: 8, padding: '10px 12px' }}>
                      <p style={{ color: '#9C6B4E', fontSize: '0.72rem', marginBottom: 3 }}>{isAr ? 'عنوان الشّحن' : 'Ship to'}</p>
                      <p style={{ color: '#3E1C00', fontWeight: 600, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {order.customer?.city}, {order.customer?.country}
                      </p>
                    </div>
                  </div>

                  {/* رقم التتبع */}
                  {order.tracking && (
                    <div style={{ background: '#F0FDF4', borderRadius: 8, padding: '10px 12px', marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FiPackage size={14} color="#16A34A" />
                      <div>
                        <p style={{ color: '#16A34A', fontWeight: 700, fontSize: '0.8rem' }}>{isAr ? 'رقم التتبع' : 'Tracking'}</p>
                        <p style={{ color: '#3E1C00', fontSize: '0.82rem', fontWeight: 600 }}>{order.tracking}</p>
                      </div>
                    </div>
                  )}

                  {/* زر إعادة الطلب */}
                  <Link to="/products" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, background: 'linear-gradient(to left, #7b192c, #a82040)', color: '#f4be69', padding: '10px 0', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', fontFamily: 'Tajawal, sans-serif' }}>
                    <FiShoppingBag size={14} />
                    {isAr ? 'اطلب مرة أخرى' : 'Order Again'}
                  </Link>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div style={{ background: '#F5E6D3', minHeight: '100vh', padding: '24px 16px 40px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #7b192c, #a82040)', borderRadius: 20, padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(244,190,105,0.15)', border: '2px solid rgba(244,190,105,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
            {user.photoURL
              ? <img src={user.photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <FiUser size={28} color="#f4be69" />
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ color: '#f4be69', fontFamily: 'Tajawal, sans-serif', fontSize: '1.2rem', marginBottom: 3 }}>
              {profile?.firstName ? `${profile.firstName} ${profile.lastName}` : user.displayName || (isAr ? 'مرحباً!' : 'Welcome!')}
            </h2>
            <p style={{ color: 'rgba(244,190,105,0.7)', fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </p>
            <p style={{ color: 'rgba(244,190,105,0.5)', fontSize: '0.75rem', marginTop: 2 }}>
              {myOrders.length} {isAr ? 'طلب' : 'orders'} · €{myOrders.reduce((s, o) => s + (o.pricing?.total || 0), 0).toFixed(2)} {isAr ? 'إجمالي' : 'total'}
            </p>
          </div>
          <button onClick={async () => { await logout(); navigate('/') }} style={{ background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.4)', color: '#FCA5A5', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', fontFamily: 'Tajawal, sans-serif', flexShrink: 0 }}>
            <FiLogOut size={13} />
            {isAr ? 'خروج' : 'Logout'}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '9px 16px', borderRadius: 50, border: '2px solid', borderColor: activeTab === tab.id ? '#7b192c' : '#E2C9A8', background: activeTab === tab.id ? 'linear-gradient(to left, #7b192c, #a82040)' : '#fff', color: activeTab === tab.id ? '#f4be69' : '#6B3A2A', fontWeight: 700, fontSize: '0.83rem', cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', whiteSpace: 'nowrap' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══ طلباتي ══ */}
        {activeTab === 'orders' && renderOrders()}

        {/* ══ Profile ══ */}
        {activeTab === 'profile' && (
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E2C9A8', padding: '22px', boxShadow: '0 2px 12px rgba(123,25,44,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ color: '#3E1C00', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiUser size={15} color="#7b192c" />
                {isAr ? 'معلومات الحساب' : 'Account Info'}
              </h3>
              {!editingProfile && (
                <button onClick={startEditProfile} style={{ background: '#fdf0f2', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#7b192c', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', fontWeight: 600, fontFamily: 'Tajawal, sans-serif' }}>
                  <FiEdit2 size={12} /> {isAr ? 'تعديل' : 'Edit'}
                </button>
              )}
            </div>

            {profileSuccess && (
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '9px 12px', marginBottom: 14, color: '#16A34A', fontWeight: 600, fontSize: '0.85rem' }}>
                {isAr ? 'تمَّ حفظ البيانات!' : 'Profile saved!'}
              </div>
            )}

            {editingProfile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={labelStyle}>{isAr ? 'الاسم الأول' : 'First Name'}</label>
                    <input value={profileForm.firstName} onChange={e => setProfileForm(f => ({ ...f, firstName: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>{isAr ? 'الاسم الثاني' : 'Last Name'}</label>
                    <input value={profileForm.lastName} onChange={e => setProfileForm(f => ({ ...f, lastName: e.target.value }))} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>{isAr ? 'الجنس' : 'Gender'}</label>
                  <select value={profileForm.gender} onChange={e => setProfileForm(f => ({ ...f, gender: e.target.value }))} style={inputStyle}>
                    <option value="">{isAr ? 'اختر' : 'Select'}</option>
                    <option value="male">{isAr ? 'ذكر' : 'Male'}</option>
                    <option value="female">{isAr ? 'أنثى' : 'Female'}</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{isAr ? 'رقم الهاتف' : 'Phone'}</label>
                  <input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} placeholder="+49..." style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{isAr ? 'الدولة' : 'Country'}</label>
                  <select value={profileForm.country} onChange={e => setProfileForm(f => ({ ...f, country: e.target.value }))} style={inputStyle}>
                    <option value="">{isAr ? 'اختر الدولة' : 'Select country'}</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={saveProfile} disabled={savingProfile} style={{ flex: 1, background: savingProfile ? '#E2C9A8' : 'linear-gradient(to left, #7b192c, #a82040)', color: savingProfile ? '#9C6B4E' : '#f4be69', padding: '11px 0', borderRadius: 10, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <FiCheck size={14} />
                    {savingProfile ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ' : 'Save')}
                  </button>
                  <button onClick={() => setEditingProfile(false)} style={{ padding: '11px 16px', borderRadius: 10, border: '2px solid #E2C9A8', background: '#fff', color: '#6B3A2A', cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: isAr ? 'الاسم الأول' : 'First Name', value: profile?.firstName || '—' },
                  { label: isAr ? 'الاسم الثاني' : 'Last Name', value: profile?.lastName || '—' },
                  { label: isAr ? 'البريد الإلكتروني' : 'Email', value: user.email },
                  { label: isAr ? 'الجنس' : 'Gender', value: profile?.gender === 'male' ? (isAr ? 'ذكر' : 'Male') : profile?.gender === 'female' ? (isAr ? 'أنثى' : 'Female') : '—' },
                  { label: isAr ? 'الهاتف' : 'Phone', value: profile?.phone || '—' },
                  { label: isAr ? 'الدولة' : 'Country', value: profile?.country || '—' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: '#F5E6D3', borderRadius: 8 }}>
                    <span style={{ color: '#9C6B4E', fontSize: '0.82rem' }}>{item.label}</span>
                    <span style={{ color: '#3E1C00', fontWeight: 600, fontSize: '0.82rem' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ Addresses ══ */}
        {activeTab === 'addresses' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#3E1C00', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiMapPin size={15} color="#7b192c" />
                {isAr ? 'عناوين التوصيل' : 'Delivery Addresses'}
              </h3>
              <button onClick={() => { setShowAddAddress(true); setEditingAddress(null); setAddressForm({ label: '', street: '', city: '', country: '', zip: '', phone: '' }) }} style={{ background: 'linear-gradient(to left, #7b192c, #a82040)', color: '#f4be69', border: 'none', borderRadius: 50, padding: '7px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', fontWeight: 700, fontFamily: 'Tajawal, sans-serif' }}>
                <FiPlus size={13} /> {isAr ? 'إضافة عنوان' : 'Add Address'}
              </button>
            </div>

            {(profile?.addresses || []).length === 0 && !showAddAddress && (
              <div style={{ background: '#fff', borderRadius: 16, padding: '36px', textAlign: 'center', border: '1px solid #E2C9A8', color: '#9C6B4E', fontSize: '0.88rem' }}>
                {isAr ? 'لا يوجد عناوين بعد' : 'No addresses yet'}
              </div>
            )}

            {(profile?.addresses || []).map((addr, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2C9A8', padding: '16px 18px', boxShadow: '0 2px 8px rgba(123,25,44,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    {addr.label && (
                      <span style={{ background: '#fdf0f2', color: '#7b192c', padding: '2px 8px', borderRadius: 50, fontSize: '0.72rem', fontWeight: 700, marginBottom: 6, display: 'inline-block' }}>
                        {addr.label}
                      </span>
                    )}
                    <p style={{ color: '#3E1C00', fontWeight: 600, fontSize: '0.88rem', marginTop: 4 }}>{addr.street}</p>
                    <p style={{ color: '#9C6B4E', fontSize: '0.82rem', marginTop: 2 }}>{addr.city}{addr.zip ? `, ${addr.zip}` : ''} — {addr.country}</p>
                    {addr.phone && (
                      <p style={{ color: '#9C6B4E', fontSize: '0.78rem', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FiPhone size={11} /> {addr.phone}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => editAddress(i)} style={{ width: 30, height: 30, borderRadius: 7, background: '#fdf0f2', border: 'none', color: '#7b192c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiEdit2 size={12} />
                    </button>
                    <button onClick={() => deleteAddress(i)} style={{ width: 30, height: 30, borderRadius: 7, background: '#FEE2E2', border: 'none', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {showAddAddress && (
              <div style={{ background: '#fff', borderRadius: 18, border: '2px solid #7b192c', padding: '22px', boxShadow: '0 4px 16px rgba(123,25,44,0.1)' }}>
                <h4 style={{ color: '#3E1C00', fontWeight: 700, marginBottom: 14, fontSize: '0.92rem' }}>
                  {editingAddress !== null ? (isAr ? 'تعديل العنوان' : 'Edit Address') : (isAr ? 'عنوان جديد' : 'New Address')}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label style={labelStyle}>{isAr ? 'تسمية (اختياري)' : 'Label (optional)'}</label>
                    <input value={addressForm.label} onChange={e => setAddressForm(f => ({ ...f, label: e.target.value }))} placeholder={isAr ? 'مثل: البيت، العمل' : 'e.g. Home, Work'} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>{isAr ? 'الشارع والرقم *' : 'Street & Number *'}</label>
                    <input value={addressForm.street} onChange={e => setAddressForm(f => ({ ...f, street: e.target.value }))} style={inputStyle} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={labelStyle}>{isAr ? 'المدينة *' : 'City *'}</label>
                      <input value={addressForm.city} onChange={e => setAddressForm(f => ({ ...f, city: e.target.value }))} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>{isAr ? 'الرمز البريدي' : 'ZIP'}</label>
                      <input value={addressForm.zip} onChange={e => setAddressForm(f => ({ ...f, zip: e.target.value }))} style={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>{isAr ? 'الدولة *' : 'Country *'}</label>
                    <select value={addressForm.country} onChange={e => setAddressForm(f => ({ ...f, country: e.target.value }))} style={inputStyle}>
                      <option value="">{isAr ? 'اختر الدولة' : 'Select country'}</option>
                      {countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>{isAr ? 'رقم الهاتف' : 'Phone'}</label>
                    <input value={addressForm.phone} onChange={e => setAddressForm(f => ({ ...f, phone: e.target.value }))} placeholder="+49..." style={inputStyle} />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={saveAddress} disabled={savingAddress} style={{ flex: 1, background: savingAddress ? '#E2C9A8' : 'linear-gradient(to left, #7b192c, #a82040)', color: savingAddress ? '#9C6B4E' : '#f4be69', padding: '11px 0', borderRadius: 10, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <FiCheck size={14} />
                      {savingAddress ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ العنوان' : 'Save Address')}
                    </button>
                    <button onClick={() => { setShowAddAddress(false); setEditingAddress(null) }} style={{ padding: '11px 16px', borderRadius: 10, border: '2px solid #E2C9A8', background: '#fff', color: '#6B3A2A', cursor: 'pointer', fontFamily: 'Tajawal, sans-serif' }}>
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ Password ══ */}
        {activeTab === 'password' && (
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E2C9A8', padding: '22px', boxShadow: '0 2px 12px rgba(123,25,44,0.05)' }}>
            <h3 style={{ color: '#3E1C00', fontWeight: 700, fontSize: '0.95rem', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiLock size={15} color="#7b192c" />
              {isAr ? 'تغيير كلمة المرور' : 'Change Password'}
            </h3>

            {passwordSuccess && (
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '9px 12px', marginBottom: 14, color: '#16A34A', fontWeight: 600, fontSize: '0.85rem' }}>
                {isAr ? 'تمَّ تغيير كلمة المرور!' : 'Password changed!'}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={labelStyle}>{isAr ? 'كلمة المرور الحالية' : 'Current Password'}</label>
                <input type="password" value={passwordForm.current} onChange={e => { setPasswordForm(f => ({ ...f, current: e.target.value })); setPasswordError('') }} placeholder="••••••••" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{isAr ? 'كلمة المرور الجديدة' : 'New Password'}</label>
                <input type="password" value={passwordForm.newPass} onChange={e => { setPasswordForm(f => ({ ...f, newPass: e.target.value })); setPasswordError('') }} placeholder="••••••••" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{isAr ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}</label>
                <input type="password" value={passwordForm.confirm} onChange={e => { setPasswordForm(f => ({ ...f, confirm: e.target.value })); setPasswordError('') }} placeholder="••••••••" style={inputStyle} />
              </div>

              {passwordError && (
                <div style={{ background: '#FEE2E2', borderRadius: 8, padding: '9px 12px', color: '#DC2626', fontSize: '0.82rem', fontWeight: 600 }}>
                  {passwordError}
                </div>
              )}

              <div style={{ background: '#fdf0f2', borderRadius: 8, padding: '9px 12px', color: '#7b192c', fontSize: '0.8rem' }}>
                {isAr ? 'سيتم إرسال إيميل تأكيد لبريدك بعد تغيير كلمة المرور.' : 'A confirmation email will be sent after changing your password.'}
              </div>

              <button onClick={handleChangePassword} disabled={passwordLoading} style={{ background: passwordLoading ? '#E2C9A8' : 'linear-gradient(to left, #7b192c, #a82040)', color: passwordLoading ? '#9C6B4E' : '#f4be69', padding: '12px 0', borderRadius: 10, fontWeight: 700, fontSize: '0.92rem', border: 'none', cursor: passwordLoading ? 'not-allowed' : 'pointer', fontFamily: 'Tajawal, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <FiLock size={14} />
                {passwordLoading ? (isAr ? 'جاري التغيير...' : 'Changing...') : (isAr ? 'تغيير كلمة المرور' : 'Change Password')}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}