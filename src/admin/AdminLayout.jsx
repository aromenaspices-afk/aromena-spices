import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import {
  FiGrid, FiPackage, FiShoppingBag, FiShoppingCart,
  FiUsers, FiBriefcase, FiDollarSign, FiTruck,
  FiTag, FiSettings, FiLogOut, FiMenu, FiX, FiStar,
  FiTrendingUp, FiMail, FiMapPin, FiBox
} from 'react-icons/fi'

const BORDEAUX = '#7b192c'
const GOLD     = '#f4be69'
const FALLBACK_LOGO = 'https://res.cloudinary.com/dvt0nntn7/image/upload/v1775408607/02_fwrhni.png'

const menuItems = [
  { path: '/admin/dashboard',  icon: <FiGrid size={18} />,         label_ar: 'لوحة التحكم' },
  { path: '/admin/products',   icon: <FiPackage size={18} />,      label_ar: 'المنتجات' },
  { path: '/admin/packages',   icon: <FiShoppingBag size={18} />,  label_ar: 'الباقات' },
  { path: '/admin/custom-box', icon: <FiBox size={18} />,          label_ar: 'الباكج المخصص' },
  { path: '/admin/orders',     icon: <FiShoppingCart size={18} />, label_ar: 'الطلبات' },
  { path: '/admin/customers',  icon: <FiUsers size={18} />,        label_ar: 'العملاء' },
  { path: '/admin/wholesale',  icon: <FiBriefcase size={18} />,    label_ar: 'طلبات الجملة' },
  { path: '/admin/currencies', icon: <FiDollarSign size={18} />,   label_ar: 'العملات' },
  { path: '/admin/shipping',   icon: <FiTruck size={18} />,        label_ar: 'الشحن' },
  { path: '/admin/promocodes', icon: <FiTag size={18} />,          label_ar: 'كودات الخصم' },
  { path: '/admin/reviews',    icon: <FiStar size={18} />,         label_ar: 'التقييمات' },
  { path: '/admin/marketing',  icon: <FiTrendingUp size={18} />,   label_ar: 'التسويق' },
  { path: '/admin/newsletter', icon: <FiMail size={18} />,         label_ar: 'النيوز ليتر' },
  { path: '/admin/locations',  icon: <FiMapPin size={18} />,       label_ar: 'نقاط البيع' },
  { path: '/admin/settings',   icon: <FiSettings size={18} />,     label_ar: 'الإعدادات' },
]

export default function AdminLayout({ children, onLogout }) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [logoUrl,     setLogoUrl]     = useState(FALLBACK_LOGO)

  useEffect(() => {
    getDoc(doc(db, 'settings', 'main'))
      .then(snap => { const url = snap.data()?.logo_url; if (url) setLogoUrl(url) })
      .catch(() => {})
  }, [])

  const sidebarContent = (
    <div style={{ width: 240, height: '100%', background: '#2a0d15', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <div style={{ padding: '18px 16px', borderBottom: '1px solid rgba(244,190,105,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', background: 'rgba(244,190,105,0.06)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={logoUrl} alt="Aromena" style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'screen' }} onError={() => setLogoUrl(FALLBACK_LOGO)} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ color: GOLD, fontWeight: 700, fontSize: '0.92rem', fontFamily: 'Amiri, serif' }}>Aromena</p>
            <p style={{ color: 'rgba(244,190,105,0.45)', fontSize: '0.68rem' }}>Admin Panel</p>
          </div>
        </div>
        <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(244,190,105,0.4)', cursor: 'pointer', flexShrink: 0 }} className="sidebar-close">
          <FiX size={17} />
        </button>
      </div>

      {/* Menu */}
      <nav style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
        {menuItems.map(item => {
          const isActive = location.pathname === item.path
          return (
            <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: 11,
              padding: '10px 13px', borderRadius: 11, marginBottom: 3,
              textDecoration: 'none',
              background: isActive ? `linear-gradient(to left, ${BORDEAUX}, #a82040)` : 'transparent',
              color: isActive ? GOLD : 'rgba(244,190,105,0.55)',
              fontWeight: isActive ? 700 : 400, fontSize: '0.87rem', transition: 'all 0.15s',
              borderRight: isActive ? `3px solid ${GOLD}` : '3px solid transparent',
            }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(244,190,105,0.06)'; e.currentTarget.style.color = GOLD } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(244,190,105,0.55)' } }}
            >
              {item.icon}
              {item.label_ar}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '14px 10px', borderTop: '1px solid rgba(244,190,105,0.08)' }}>
        <button onClick={onLogout} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 13px', borderRadius: 11,
          background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.2)',
          color: '#FCA5A5', cursor: 'pointer', fontSize: '0.87rem', fontWeight: 600,
          fontFamily: 'Amiri, serif', transition: 'background 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(220,38,38,0.12)'}
        >
          <FiLogOut size={16} /> تسجيل الخروج
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5E6D3', direction: 'rtl' }}>

      <div style={{ position: 'fixed', top: 0, right: 0, height: '100vh', zIndex: 100 }} className="admin-sidebar-desktop">
        {sidebarContent}
      </div>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200 }} />}
      {sidebarOpen && <div style={{ position: 'fixed', top: 0, right: 0, height: '100vh', zIndex: 201 }}>{sidebarContent}</div>}

      <div style={{ flex: 1, marginRight: 240, minHeight: '100vh', display: 'flex', flexDirection: 'column' }} className="admin-main">
        <div style={{
          background: '#fff', padding: '0 24px', height: 62,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid #E2C9A8', position: 'sticky', top: 0, zIndex: 50,
          boxShadow: '0 2px 8px rgba(62,28,0,0.06)',
        }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3E1C00', display: 'none', padding: 0 }} className="admin-hamburger">
            <FiMenu size={22} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ height: 38, maxWidth: 130, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
              <img src={logoUrl} alt="Aromena" style={{ height: '100%', objectFit: 'contain' }} onError={() => setLogoUrl(FALLBACK_LOGO)} />
            </div>
            <div style={{ borderRight: '1px solid #E2C9A8', paddingRight: 10 }}>
              <p style={{ color: '#3E1C00', fontWeight: 700, fontSize: '0.84rem' }}>Admin</p>
              <p style={{ color: '#9C6B4E', fontSize: '0.71rem' }}>aromena.official@gmail.com</p>
            </div>
          </div>
          <div style={{ background: 'rgba(123,25,44,0.07)', border: '1px solid rgba(123,25,44,0.15)', borderRadius: 50, padding: '5px 14px', fontSize: '0.78rem', color: BORDEAUX, fontWeight: 700 }}>
            Admin
          </div>
        </div>

        <div style={{ flex: 1, padding: '26px 24px' }}>{children}</div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar-desktop { display: none !important; }
          .admin-hamburger { display: flex !important; }
          .admin-main { margin-right: 0 !important; }
        }
      `}</style>
    </div>
  )
}