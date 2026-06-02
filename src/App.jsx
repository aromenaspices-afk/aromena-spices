import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { useVisitorTracker } from './hooks/useVisitorTracker'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Packages from './pages/Packages'
import About from './pages/About'
import Contact from './pages/Contact'
import Wholesale from './pages/Wholesale'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Register from './pages/Register'
import Account from './pages/Account'
import NotFound from './pages/NotFound'
import AdminApp from './admin/AdminApp'
import SplashScreen from './components/SplashScreen'
import CookieBanner from './components/CookieBanner'
import { CurrencyProvider } from './context/CurrencyContext'
import WhatsAppButton from './components/WhatsAppButton'
import PrivacyPolicy  from './pages/PrivacyPolicy'
import ShippingPolicy from './pages/ShippingPolicy'
import SalesContract  from './pages/SalesContract'
import LandingPage from './pages/LandingPage'

function VisitorTracker() {
  useVisitorTracker()
  return null
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false)

  return (
    <BrowserRouter>
      <AuthProvider>
        <CurrencyProvider>
        <CartProvider>
          {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
          <ScrollToTop />
          <VisitorTracker />
          <CookieBanner />
          <WhatsAppButton />
          <Routes>
            <Route path="/admin/*" element={<AdminApp />} />
            <Route path="/*" element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/"                element={<Home />} />
                  <Route path="/products"        element={<Products />} />
                  <Route path="/products/:slug"  element={<ProductDetail />} />
                  <Route path="/packages"        element={<Packages />} />
                  <Route path="/about"           element={<About />} />
                  <Route path="/contact"         element={<Contact />} />
                  <Route path="/wholesale"       element={<Wholesale />} />
                  <Route path="/checkout"        element={<Checkout />} />
                  <Route path="/login"           element={<Login />} />
                  <Route path="/register"        element={<Register />} />
                  <Route path="/account"         element={<Account />} />
                  <Route path="/privacy"         element={<PrivacyPolicy />} />
                  <Route path="/shipping-policy" element={<ShippingPolicy />} />
                  <Route path="/sales-contract"  element={<SalesContract />} />
                  <Route path="*"                element={<NotFound />} />
                  <Route path="/promo" element={<LandingPage />} />
                </Routes>
                <Footer />
              </>
            } />
          </Routes>
        </CartProvider>
        </CurrencyProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}