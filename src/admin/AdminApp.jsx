import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { db } from '../firebase'
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore'
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


const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD || 'aromena2026'

export default function AdminApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem('aromena_admin') === 'true'
  )

  async function handleLogin(pass) {
    const entered = (pass || '').trim()

    // كلمة المرور المخزّنة في Firestore (admin/config) لها الأولويّة، وإلّا الافتراضيّة
    let stored = null
    try {
      const snap = await getDoc(doc(db, 'admin', 'config'))
      if (snap.exists() && snap.data().password) stored = String(snap.data().password)
    } catch { /* تجاهل أخطاء الشبكة ونرجع للافتراضيّة */ }

    const valid = entered === (stored || ADMIN_PASS).trim()

    // تسجيل المحاولة في سجلّ النشاط
    try {
      await addDoc(collection(db, 'activity_log'), {
        type: 'login',
        success: valid,
        at: serverTimestamp(),
        userAgent: navigator.userAgent || '',
        platform: navigator.platform || '',
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
      </Routes>
    </AdminLayout>
  )
}