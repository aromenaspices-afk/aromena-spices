import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
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

  function handleLogin(pass) {
    if (pass === ADMIN_PASS) {
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