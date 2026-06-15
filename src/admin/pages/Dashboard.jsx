import { useState, useEffect } from 'react'
import {
  FiShoppingCart, FiUsers, FiPackage, FiTrendingUp,
  FiBriefcase, FiGrid, FiArrowUpRight, FiClock,
  FiCheckCircle, FiXCircle, FiTruck, FiRefreshCw, FiAlertCircle,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { db } from '../../firebase'
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'

const BORDEAUX = '#7b192c'
const GOLD     = '#f4be69'
const BG       = '#F5E6D3'
const BG2      = '#EDD9C0'
const CARD     = '#ffffff'
const TEXT     = '#3E1C00'
const TEXT2    = '#9C6B4E'
const BORDER   = '#E2C9A8'

const statusConfig = {
  awaiting_payment: { label: 'بانتظار التحويل', color: '#D97706', bg: '#FEF3C7' },
  pending_payment:  { label: 'إيصال مرفوع',     color: '#2563EB', bg: '#EFF6FF' },
  receipt_uploaded: { label: 'إيصال مرفوع',     color: '#2563EB', bg: '#EFF6FF' },
  pending:          { label: 'قيد المراجعة',    color: '#7C3AED', bg: '#F5F3FF' },
  confirmed:        { label: 'مؤكد',            color: '#16A34A', bg: '#F0FDF4' },
  shipping:         { label: 'قيد الشحن',       color: '#0891B2', bg: '#ECFEFF' },
  delivered:        { label: 'تم التسليم',      color: '#16A34A', bg: '#F0FDF4' },
  cancelled:        { label: 'ملغي',            color: '#DC2626', bg: '#FEF2F2' },
}

const quickLinks = [
  { label: 'إضافة منتج جديد',  path: '/admin/products',    icon: '📦' },
  { label: 'عرض الطلبات',      path: '/admin/orders',      icon: '🛒' },
  { label: 'الباكج المخصص',    path: '/admin/custom-box',  icon: '🎨' },
  { label: 'كودات الخصم',      path: '/admin/promocodes',  icon: '🎟️' },
  { label: 'إعدادات الشحن',    path: '/admin/shipping',    icon: '🚚' },
  { label: 'إعدادات الموقع',   path: '/admin/settings',    icon: '⚙️' },
]

function fmt(n) {
  return `₺${Number(n || 0).toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function StatCard({ icon, label, value, sub, path, loading, highlight }) {
  return (
    <Link to={path} style={{ textDecoration: 'none' }}>
      <div style={{
        background: highlight ? `linear-gradient(135deg, ${BORDEAUX}, #a82040)` : CARD,
        borderRadius: 18, padding: '20px 18px',
        border: `1px solid ${highlight ? 'transparent' : BORDER}`,
        boxShadow: highlight ? '0 8px 24px rgba(123,25,44,0.25)' : '0 2px 12px rgba(62,28,0,0.05)',
        display: 'flex', flexDirection: 'column', gap: 12,
        transition: 'transform 0.18s, box-shadow 0.18s', cursor: 'pointer',
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: highlight ? 'rgba(244,190,105,0.2)' : 'linear-gradient(135deg, #7b192c, #a82040)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: highlight ? GOLD : GOLD, flexShrink: 0 }}>
            {icon}
          </div>
          <FiArrowUpRight size={14} color={highlight ? 'rgba(244,190,105,0.4)' : BORDER} />
        </div>
        <div>
          <p style={{ color: highlight ? 'rgba(244,190,105,0.65)' : TEXT2, fontSize: '0.78rem', marginBottom: 4 }}>{label}</p>
          {loading
            ? <div style={{ width: 70, height: 26, borderRadius: 7, background: highlight ? 'rgba(255,255,255,0.1)' : BG2, animation: 'pulse 1.2s ease-in-out infinite' }} />
            : <p style={{ color: highlight ? GOLD : TEXT, fontWeight: 900, fontSize: '1.55rem', lineHeight: 1, fontFamily: 'Tajawal, sans-serif' }}>{value}</p>
          }
          {sub && !loading && <p style={{ color: highlight ? 'rgba(244,190,105,0.55)' : TEXT2, fontSize: '0.72rem', marginTop: 4 }}>{sub}</p>}
        </div>
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const [orders,       setOrders]       = useState([])
  const [customers,    setCustomers]    = useState([])
  const [products,     setProducts]     = useState([])
  const [packages,     setPackages]     = useState([])
  const [wholesale,    setWholesale]    = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    const unsubs = []
    unsubs.push(onSnapshot(collection(db, 'orders'), snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }))
    const recentQ = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(6))
    unsubs.push(onSnapshot(recentQ, snap => {
      setRecentOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }))
    unsubs.push(onSnapshot(collection(db, 'users'), snap => setCustomers(snap.docs)))
    unsubs.push(onSnapshot(collection(db, 'products'), snap => setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })))))
    unsubs.push(onSnapshot(collection(db, 'packages'), snap => setPackages(snap.docs)))
    unsubs.push(onSnapshot(collection(db, 'wholesale'), snap => setWholesale(snap.docs)))
    return () => unsubs.forEach(u => u())
  }, [])

  const completedOrders = orders.filter(o => !['cancelled', 'awaiting_payment'].includes(o.status))
  const totalRevenue    = completedOrders.reduce((s, o) => s + (o.pricingTRY?.total || o.pricing?.total || 0), 0)
  const todayRevenue    = completedOrders.filter(o => o.createdAt?.startsWith(new Date().toISOString().slice(0, 10))).reduce((s, o) => s + (o.pricingTRY?.total || o.pricing?.total || 0), 0)
  const pendingPayment  = orders.filter(o => ['awaiting_payment', 'pending_payment', 'receipt_uploaded'].includes(o.status)).length
  const packageOrders   = orders.filter(o => o.items?.some(i => i.isPackage)).length

  const stats = [
    { icon: <FiTrendingUp size={19} />, label: 'إجمالي الإيرادات', value: fmt(totalRevenue), sub: `اليوم: ${fmt(todayRevenue)}`, path: '/admin/orders', highlight: true },
    { icon: <FiShoppingCart size={19} />, label: 'إجمالي الطلبات', value: orders.length, sub: pendingPayment > 0 ? `⚠️ ${pendingPayment} بانتظار الدفع` : 'كل الطلبات مراجعة', path: '/admin/orders' },
    { icon: <FiUsers size={19} />, label: 'العملاء المسجلين', value: customers.length, sub: 'حساب نشط', path: '/admin/customers' },
    { icon: <FiPackage size={19} />, label: 'المنتجات', value: products.length, sub: `${products.filter(p => p.inStock !== false).length} متاح`, path: '/admin/products' },
    { icon: <FiGrid size={19} />, label: 'الباقات', value: packages.length, sub: `${packageOrders} طلب من الباقات`, path: '/admin/packages' },
    { icon: <FiBriefcase size={19} />, label: 'طلبات الجملة', value: wholesale.length, sub: 'طلب جملة', path: '/admin/wholesale' },
  ]

  function formatDate(str) {
    if (!str) return '—'
    return new Date(str).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  function StatusBadge({ status }) {
    const cfg = statusConfig[status] || { label: status, color: '#6B7280', bg: '#F3F4F6' }
    return (
      <span style={{ background: cfg.bg, color: cfg.color, padding: '3px 9px', borderRadius: 50, fontSize: '0.68rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
        {cfg.label}
      </span>
    )
  }

  // تنبيه إيصالات منتظرة
  const receiptOrders = orders.filter(o => o.status === 'receipt_uploaded' || o.payment?.status === 'receipt_uploaded')

  return (
    <div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.4rem', color: TEXT, fontFamily: 'Tajawal, sans-serif', marginBottom: 4 }}>مرحباً 👋</h1>
        <p style={{ color: TEXT2, fontSize: '0.85rem' }}>ملخص نشاط متجر Aromena Spices — الأسعار بالليرة التركية ₺</p>
      </div>

      {/* تنبيه إيصالات */}
      {!loading && receiptOrders.length > 0 && (
        <div style={{ background: '#FEF3C7', border: '2px solid #F59E0B', borderRadius: 14, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <FiAlertCircle size={18} color="#D97706" />
          <p style={{ color: '#92400E', fontWeight: 700, fontSize: '0.88rem' }}>
            {receiptOrders.length} طلب فيه إيصال تحويل منتظر المراجعة —{' '}
            <Link to="/admin/orders" style={{ color: BORDEAUX, textDecoration: 'underline' }}>راجعهم الآن</Link>
          </p>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12, marginBottom: 24 }}>
        {stats.map((s, i) => <StatCard key={i} {...s} loading={loading} />)}
      </div>

      {/* حالات الطلبات */}
      <div style={{ background: CARD, borderRadius: 20, padding: '18px 20px', border: `1px solid ${BORDER}`, marginBottom: 20 }}>
        <h3 style={{ color: TEXT, fontWeight: 700, fontSize: '0.92rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
          <FiShoppingCart size={14} color={BORDEAUX} /> توزيع حالات الطلبات
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8 }}>
          {Object.entries(statusConfig).map(([key, val]) => {
            const count = orders.filter(o => o.status === key).length
            if (count === 0 && !loading) return null
            const pct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0
            return (
              <Link key={key} to="/admin/orders" style={{ textDecoration: 'none' }}>
                <div style={{ background: val.bg, borderRadius: 12, padding: '12px 10px', border: `1px solid ${val.color}22`, textAlign: 'center', transition: 'transform 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {loading
                    ? <div style={{ width: 30, height: 28, borderRadius: 5, background: '#fff', margin: '0 auto 5px', animation: 'pulse 1.2s ease-in-out infinite' }} />
                    : <p style={{ color: val.color, fontWeight: 900, fontSize: '1.5rem', lineHeight: 1 }}>{count}</p>
                  }
                  <p style={{ color: val.color, fontSize: '0.68rem', marginTop: 4, fontWeight: 600, lineHeight: 1.3 }}>{val.label}</p>
                  {!loading && orders.length > 0 && <p style={{ color: val.color, fontSize: '0.62rem', opacity: 0.6, marginTop: 2 }}>{pct}%</p>}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* الصف السفلي */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>

        {/* آخر الطلبات */}
        <div style={{ background: CARD, borderRadius: 20, padding: '20px', border: `1px solid ${BORDER}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ color: TEXT, fontWeight: 700, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: 7 }}>
              <FiClock size={14} color={BORDEAUX} /> آخر الطلبات
            </h3>
            <Link to="/admin/orders" style={{ color: BORDEAUX, fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
              عرض الكل <FiArrowUpRight size={12} />
            </Link>
          </div>
          {loading ? (
            [1,2,3].map(i => <div key={i} style={{ height: 50, borderRadius: 10, background: BG, marginBottom: 8, animation: 'pulse 1.2s ease-in-out infinite' }} />)
          ) : recentOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 0', color: TEXT2, fontSize: '0.85rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>📭</div>لا يوجد طلبات بعد
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {recentOrders.map(order => (
                <div key={order.id} style={{ background: BG, borderRadius: 11, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ color: BORDEAUX, fontWeight: 700, fontSize: '0.8rem' }}>{order.orderNumber || order.id.slice(0, 8)}</p>
                    <p style={{ color: TEXT2, fontSize: '0.7rem', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {order.customer?.firstName} {order.customer?.lastName} · {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                    <StatusBadge status={order.status} />
                    <p style={{ color: TEXT, fontWeight: 700, fontSize: '0.75rem' }}>
                      {fmt(order.pricingTRY?.total || order.pricing?.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* روابط سريعة */}
        <div style={{ background: CARD, borderRadius: 20, padding: '20px', border: `1px solid ${BORDER}` }}>
          <h3 style={{ color: TEXT, fontWeight: 700, fontSize: '0.92rem', marginBottom: 14 }}>⚡ روابط سريعة</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {quickLinks.map((link, i) => (
              <Link key={i} to={link.path} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 13px', borderRadius: 11, background: BG, textDecoration: 'none', color: TEXT, fontSize: '0.86rem', fontWeight: 600, transition: 'background 0.15s', border: '1px solid transparent' }}
                onMouseEnter={e => { e.currentTarget.style.background = BG2; e.currentTarget.style.borderColor = BORDER }}
                onMouseLeave={e => { e.currentTarget.style.background = BG; e.currentTarget.style.borderColor = 'transparent' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ fontSize: '0.95rem' }}>{link.icon}</span>
                  {link.label}
                </div>
                <FiArrowUpRight size={13} color={TEXT2} />
              </Link>
            ))}
          </div>
        </div>

        {/* حالة المتجر */}
        <div style={{ background: CARD, borderRadius: 20, padding: '20px', border: `1px solid ${BORDER}` }}>
          <h3 style={{ color: TEXT, fontWeight: 700, fontSize: '0.92rem', marginBottom: 14 }}>🏪 حالة المتجر</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'المنتجات النشطة',       value: loading ? '...' : `${products.filter(p => p.inStock !== false).length} منتج`, icon: <FiCheckCircle size={13} color="#16A34A" /> },
              { label: 'الباقات المتاحة',       value: loading ? '...' : `${packages.length} باقة`, icon: <FiPackage size={13} color={BORDEAUX} /> },
              { label: 'إيصالات تنتظر',         value: loading ? '...' : `${receiptOrders.length} طلب`, icon: <FiAlertCircle size={13} color={receiptOrders.length > 0 ? '#D97706' : '#16A34A'} /> },
              { label: 'بانتظار الشحن',         value: loading ? '...' : `${orders.filter(o => o.status === 'confirmed').length} طلب`, icon: <FiTruck size={13} color="#0891B2" /> },
              { label: 'ملغية',                  value: loading ? '...' : `${orders.filter(o => o.status === 'cancelled').length} طلب`, icon: <FiXCircle size={13} color="#DC2626" /> },
              { label: 'حالة المتجر',            value: '🟢 نشط', icon: <FiRefreshCw size={13} color="#16A34A" /> },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 13px', background: BG, borderRadius: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  {item.icon}
                  <span style={{ color: '#6B3A2A', fontSize: '0.81rem' }}>{item.label}</span>
                </div>
                {loading && item.value === '...'
                  ? <div style={{ width: 48, height: 14, borderRadius: 4, background: BG2, animation: 'pulse 1.2s ease-in-out infinite' }} />
                  : <span style={{ color: TEXT, fontWeight: 700, fontSize: '0.81rem' }}>{item.value}</span>
                }
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}