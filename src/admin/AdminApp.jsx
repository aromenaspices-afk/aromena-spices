import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import AdminLogin from './AdminLogin'
import AdminLayout from './AdminLayout'
import Dashboard from './pages/Dashboard'
import AdminProducts from './pages/Products'
import AdminPackages from './pages/Packages'
import AdminOrders from './pages/Orders'
import AdminCustomers from './pages/Customers'
import AdminWholesale from './pages/Wholesale'
import AdminCurrencies from './pages/Currencies'
import AdminShipping from './pages/Shipping'
import AdminPromoCodes from './pages/PromoCodes'
import AdminSettings from './pages/Settings'
import AdminReviews from './pages/Reviews'
import AdminMarketing from './pages/Marketing'
import Newsletter from './pages/Newsletter'
import AdminLocations from './pages/Locations'
import AdminCustomBox from './pages/CustomBox'
import AdminAnalytics from './pages/Analytics'


const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD || 'aromena2026'

// جلب JSON مع مهلة زمنيّة
async function fetchJson(url, ms = 3500) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  try {
    const r = await fetch(url, { signal: ctrl.signal })
    return await r.json()
  } finally {
    clearTimeout(t)
  }
}

export default function AdminApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem('aromena_admin') === 'true'
  )

  async function handleLogin(pass) {
    const valid = (pass || '').trim() === ADMIN_PASS.trim()

    // جلب الموقع الجغرافي عبر IP — سلسلة بدائل (إن حُجبت خدمة جُرِّبت التالية)
    let geo = {}
    const geoProviders = [
      async () => {
        const j = await fetchJson('https://ipwho.is/')
        if (j && j.success !== false) return { country: j.country, countryCode: j.country_code, city: j.city, ip: j.ip }
      },
      async () => {
        const j = await fetchJson('https://ipapi.co/json/')
        if (j && !j.error) return { country: j.country_name, countryCode: j.country_code, city: j.city, ip: j.ip }
      },
      async () => {
        const j = await fetchJson('https://api.country.is/')
        if (j && j.country) return { country: j.country, countryCode: j.country, city: '', ip: j.ip }
      },
    ]
    for (const provider of geoProviders) {
      try {
        const g = await provider()
        if (g && g.countryCode) {
          geo = { country: g.country || '', countryCode: g.countryCode || '', city: g.city || '', ip: g.ip || '' }
          break
        }
      } catch { /* جرّب الخدمة التالية */ }
    }

    // تسجيل المحاولة في سجلّ النشاط
    try {
      await addDoc(collection(db, 'activity_log'), {
        type: 'login',
        success: valid,
        at: serverTimestamp(),
        userAgent: navigator.userAgent || '',
        platform: navigator.platform || '',
        ...geo,
      })
    } catch { /* السجلّ ليس حرجاً */ }

    if (valid) {
      localStorage.setItem('aromena_admin', 'true')
      setIsLoggedIn(true)
      return true
    }
    return false
  }

  function handleLogout() {
    localStorage.removeItem('aromena_admin')
    setIsLoggedIn(false)
  }

  if (!isLoggedIn) return <AdminLogin onLogin={handleLogin} />

  return (
    <AdminLayout onLogout={handleLogout}>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"  element={<Dashboard />} />
        <Route path="products"   element={<AdminProducts />} />
        <Route path="packages"   element={<AdminPackages />} />
        <Route path="orders"     element={<AdminOrders />} />
        <Route path="customers"  element={<AdminCustomers />} />
        <Route path="wholesale"  element={<AdminWholesale />} />
        <Route path="currencies" element={<AdminCurrencies />} />
        <Route path="shipping"   element={<AdminShipping />} />
        <Route path="promocodes" element={<AdminPromoCodes />} />
        <Route path="reviews"    element={<AdminReviews />} />
        <Route path="marketing"  element={<AdminMarketing />} />
        <Route path="newsletter" element={<Newsletter />} />
        <Route path="settings"   element={<AdminSettings />} />
        <Route path="locations"  element={<AdminLocations />} />
        <Route path="custom-box" element={<AdminCustomBox />} />
        <Route path="analytics"  element={<AdminAnalytics />} />
      </Routes>
    </AdminLayout>
  )
}