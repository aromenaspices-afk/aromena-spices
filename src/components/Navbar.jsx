import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { FiShoppingCart, FiMenu, FiX, FiGlobe, FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi'
import CurrencySelector from './CurrencySelector'

const LOGO = 'https://res.cloudinary.com/dvt0nntn7/image/upload/v1775408607/02_fwrhni.png'

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const { count } = useCart()
  const { user, logout } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const isAr = i18n.language === 'ar'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.dir = isAr ? 'rtl' : 'ltr'
    document.body.className = isAr ? '' : 'ltr'
    localStorage.setItem('aromena_lang', i18n.language)
  }, [i18n.language, isAr])

  useEffect(() => { setMenuOpen(false); setUserMenuOpen(false) }, [location])

  function toggleLang() { i18n.changeLanguage(isAr ? 'en' : 'ar') }

  const links = [
    { to: '/',          label: t('nav.home') },
    { to: '/products',  label: t('nav.products') },
    { to: '/packages',  label: t('nav.packages') },
    { to: '/wholesale', label: t('nav.wholesale') },
    { to: '/about',     label: t('nav.about') },
    { to: '/contact',   label: t('nav.contact') },
  ]

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled
          ? 'rgba(26, 6, 16, 0.97)'
          : 'linear-gradient(180deg, rgba(26,6,16,0.95) 0%, rgba(123,25,44,0.92) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: scrolled ? '1px solid rgba(244,190,105,0.12)' : '1px solid transparent',
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.4)' : 'none',
        transition: 'all 0.35s ease',
      }}>

        {/* Desktop */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }} className="desktop-only">

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
            <img src={LOGO} alt="Aromena Spices" style={{ height: 48, width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(244,190,105,0.2))' }} />
          </Link>

          {/* الروابط */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'center' }}>
            {links.map(link => (
              <Link key={link.to} to={link.to} style={{
                color: isActive(link.to) ? '#f4be69' : 'rgba(244,190,105,0.6)',
                padding: '8px 13px',
                borderRadius: 8,
                fontSize: '0.86rem',
                fontWeight: isActive(link.to) ? 700 : 400,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                letterSpacing: isActive(link.to) ? '0.02em' : '0',
                background: isActive(link.to) ? 'rgba(244,190,105,0.08)' : 'transparent',
                borderBottom: isActive(link.to) ? '1.5px solid rgba(244,190,105,0.5)' : '1.5px solid transparent',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { if (!isActive(link.to)) { e.currentTarget.style.color = '#f4be69'; e.currentTarget.style.background = 'rgba(244,190,105,0.05)' } }}
              onMouseLeave={e => { if (!isActive(link.to)) { e.currentTarget.style.color = 'rgba(244,190,105,0.6)'; e.currentTarget.style.background = 'transparent' } }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

            {/* فاصل */}
            <div style={{ width: 1, height: 24, background: 'rgba(244,190,105,0.15)' }} />

            {/* اللغة */}
            <button onClick={toggleLang} style={{
              background: 'rgba(244,190,105,0.07)',
              border: '1px solid rgba(244,190,105,0.2)',
              color: 'rgba(244,190,105,0.8)',
              padding: '6px 10px', borderRadius: 8,
              fontSize: '0.78rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
              transition: 'all 0.2s',
              fontFamily: 'Tajawal, sans-serif',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,190,105,0.12)'; e.currentTarget.style.color = '#f4be69' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(244,190,105,0.07)'; e.currentTarget.style.color = 'rgba(244,190,105,0.8)' }}
            >
              <FiGlobe size={12} />
              {isAr ? 'EN' : 'ع'}
            </button>

            {/* العملة */}
            <CurrencySelector />

            {/* فاصل */}
            <div style={{ width: 1, height: 24, background: 'rgba(244,190,105,0.15)' }} />

            {/* السلة */}
            <Link to="/checkout" style={{
              position: 'relative', color: 'rgba(244,190,105,0.8)',
              display: 'flex', alignItems: 'center',
              padding: '8px', borderRadius: 8, textDecoration: 'none',
              background: 'rgba(244,190,105,0.07)',
              border: '1px solid rgba(244,190,105,0.2)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,190,105,0.12)'; e.currentTarget.style.color = '#f4be69' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(244,190,105,0.07)'; e.currentTarget.style.color = 'rgba(244,190,105,0.8)' }}
            >
              <FiShoppingCart size={17} />
              {count > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: isAr ? 'auto' : -6, left: isAr ? -6 : 'auto',
                  background: '#DC2626', color: '#fff', borderRadius: '50%',
                  width: 17, height: 17, fontSize: '0.6rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, border: '2px solid #1a0610',
                }}>{count}</span>
              )}
            </Link>

            {/* المستخدم */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} style={{
                  background: 'rgba(244,190,105,0.07)',
                  border: '1px solid rgba(244,190,105,0.2)',
                  borderRadius: 8, padding: '6px 10px',
                  display: 'flex', alignItems: 'center', gap: 6,
                  cursor: 'pointer', color: 'rgba(244,190,105,0.8)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,190,105,0.12)'; e.currentTarget.style.color = '#f4be69' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(244,190,105,0.07)'; e.currentTarget.style.color = 'rgba(244,190,105,0.8)' }}
                >
                  {user.photoURL
                    ? <img src={user.photoURL} alt="avatar" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(244,190,105,0.4)' }} />
                    : <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(244,190,105,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiUser size={12} /></div>
                  }
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.displayName?.split(' ')[0] || (isAr ? 'حسابي' : 'Me')}
                  </span>
                  <FiChevronDown size={11} style={{ opacity: 0.6, transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </button>

                {userMenuOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)',
                    right: isAr ? 'auto' : 0, left: isAr ? 0 : 'auto',
                    background: '#fff', borderRadius: 14,
                    border: '1px solid #E2C9A8',
                    minWidth: 180,
                    boxShadow: '0 12px 40px rgba(123,25,44,0.15)',
                    overflow: 'hidden', zIndex: 100,
                  }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #F5E6D3', background: '#FFFBF5' }}>
                      <p style={{ color: '#3E1C00', fontWeight: 700, fontSize: '0.87rem' }}>{user.displayName || '—'}</p>
                      <p style={{ color: '#9C6B4E', fontSize: '0.72rem', marginTop: 2 }}>{user.email}</p>
                    </div>
                    <Link to="/account" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', color: '#3E1C00', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FDF5EE'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <FiUser size={13} color="#7b192c" />
                      {isAr ? 'حسابي' : 'My Account'}
                    </Link>
                    <button onClick={logout} style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '11px 16px', color: '#DC2626',
                      background: 'none', border: 'none',
                      borderTop: '1px solid #F5E6D3',
                      fontSize: '0.85rem', fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'Tajawal, sans-serif',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <FiLogOut size={13} />
                      {isAr ? 'تسجيل الخروج' : 'Logout'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" style={{
                background: 'rgba(244,190,105,0.07)',
                border: '1px solid rgba(244,190,105,0.2)',
                color: 'rgba(244,190,105,0.8)',
                padding: '6px 12px', borderRadius: 8,
                display: 'flex', alignItems: 'center', gap: 6,
                textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,190,105,0.12)'; e.currentTarget.style.color = '#f4be69' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(244,190,105,0.07)'; e.currentTarget.style.color = 'rgba(244,190,105,0.8)' }}
              >
                <FiUser size={13} />
                {isAr ? 'دخول' : 'Login'}
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Bar */}
        <div style={{ padding: '0 16px', height: 62, display: 'none', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }} className="mobile-bar">

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{
              background: 'rgba(244,190,105,0.08)',
              border: '1px solid rgba(244,190,105,0.15)',
              borderRadius: 8, color: '#f4be69',
              cursor: 'pointer', padding: '7px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
            <CurrencySelector size="small" />
          </div>

          <Link to="/" style={{ textDecoration: 'none', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            <img src={LOGO} alt="Aromena" style={{ height: 46, width: 150, objectFit: 'contain' }} />
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <button onClick={toggleLang} style={{ background: 'transparent', border: 'none', color: 'rgba(244,190,105,0.8)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2, padding: 0 }}>
              <FiGlobe size={15} />
              {isAr ? 'EN' : 'ع'}
            </button>
            <Link to="/checkout" style={{ position: 'relative', color: 'rgba(244,190,105,0.85)', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <FiShoppingCart size={22} />
              {count > 0 && (
                <span style={{ position: 'absolute', top: -5, right: isAr ? 'auto' : -7, left: isAr ? -7 : 'auto', background: '#DC2626', color: '#fff', borderRadius: '50%', width: 17, height: 17, fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, border: '2px solid #1a0610' }}>{count}</span>
              )}
            </Link>
            <Link to={user ? '/account' : '/login'} style={{ color: 'rgba(244,190,105,0.85)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              {user?.photoURL
                ? <img src={user.photoURL} alt="avatar" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(244,190,105,0.4)' }} />
                : <FiUser size={22} />
              }
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div style={{ background: 'rgba(20, 5, 12, 0.98)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(244,190,105,0.1)', padding: '10px 16px 20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {links.map(link => (
              <Link key={link.to} to={link.to} style={{
                color: isActive(link.to) ? '#f4be69' : 'rgba(244,190,105,0.65)',
                padding: '11px 14px', borderRadius: 10,
                fontSize: '0.95rem', fontWeight: isActive(link.to) ? 700 : 400,
                textDecoration: 'none', display: 'flex', alignItems: 'center',
                background: isActive(link.to) ? 'rgba(244,190,105,0.08)' : 'transparent',
                borderRight: isAr && isActive(link.to) ? '3px solid rgba(244,190,105,0.6)' : 'none',
                borderLeft: !isAr && isActive(link.to) ? '3px solid rgba(244,190,105,0.6)' : 'none',
                transition: 'all 0.15s',
              }}>
                {link.label}
              </Link>
            ))}

            <div style={{ borderTop: '1px solid rgba(244,190,105,0.1)', marginTop: 8, paddingTop: 10 }}>
              {user ? (
                <>
                  <div style={{ padding: '8px 14px', marginBottom: 4 }}>
                    <p style={{ color: '#f4be69', fontWeight: 700, fontSize: '0.88rem' }}>{user.displayName || user.email}</p>
                    <p style={{ color: 'rgba(244,190,105,0.5)', fontSize: '0.75rem', marginTop: 2 }}>{user.email}</p>
                  </div>
                  <Link to="/account" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 10, color: 'rgba(244,190,105,0.8)', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 600 }}>
                    <FiUser size={15} />
                    {isAr ? 'حسابي' : 'My Account'}
                  </Link>
                  <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 10, color: '#FCA5A5', background: 'none', border: 'none', fontSize: '0.92rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Tajawal, sans-serif', width: '100%' }}>
                    <FiLogOut size={15} />
                    {isAr ? 'تسجيل الخروج' : 'Logout'}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 10, color: 'rgba(244,190,105,0.8)', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 600 }}>
                    <FiUser size={15} />
                    {isAr ? 'تسجيل الدخول' : 'Login'}
                  </Link>
                  <Link to="/register" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 10, color: '#f4be69', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 700, background: 'rgba(244,190,105,0.08)', marginTop: 4 }}>
                    {isAr ? 'إنشاء حساب' : 'Create Account'}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <div style={{ height: 62 }} />

      <style>{`
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-bar { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-bar { display: none !important; }
          .desktop-only { display: flex !important; }
        }
      `}</style>
    </>
  )
}