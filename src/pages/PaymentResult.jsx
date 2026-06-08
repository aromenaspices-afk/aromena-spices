import { useEffect, useState, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useCart } from '../context/CartContext'
import { useTranslation } from 'react-i18next'
import { FiCheckCircle, FiXCircle, FiLoader, FiShoppingBag, FiHome } from 'react-icons/fi'
import { sendOrderConfirmEmail, sendAdminNewOrderEmail } from '../utils/emailService'

export default function PaymentResult() {
  const [params] = useSearchParams()
  const { clearCart } = useCart()
  const { i18n } = useTranslation()
  const isAr = i18n.language === 'ar'
  const [state, setState] = useState('loading') // loading | success | failure
  const [orderNumber, setOrderNumber] = useState('')
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const token = params.get('token')
    const urlStatus = params.get('status')

    async function finalize() {
      if (!token) { setState(urlStatus === 'success' ? 'success' : 'failure'); return }
      try {
        const res = await fetch('/.netlify/functions/iyzico-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        const data = await res.json()
        if (!data.success || !data.orderId) { setState('failure'); return }

        // قراءة الطلب وتحديثه (مرّة واحدة)
        const ref = doc(db, 'orders', data.orderId)
        const snap = await getDoc(ref)
        if (!snap.exists()) { setState('success'); return }
        const order = snap.data()
        setOrderNumber(order.orderNumber || '')

        if (order.payment?.status !== 'paid') {
          await updateDoc(ref, {
            status: 'confirmed',
            payment: { method: 'card', status: 'paid', provider: 'iyzico', paymentId: data.paymentId || null, paidAt: new Date().toISOString() },
          })
          // إرسال الإيميلات مرّة واحدة
          try {
            const payload = { orderNumber: order.orderNumber, customer: order.customer, items: order.items, pricing: order.pricing, pricingTRY: order.pricingTRY || order.pricing, payment: { method: 'card' }, createdAt: order.createdAt }
            await sendOrderConfirmEmail({ ...payload, customer: order.customer })
            await sendAdminNewOrderEmail(payload)
          } catch {}
          try { clearCart(); localStorage.removeItem('checkout_form'); localStorage.removeItem('checkout_payment') } catch {}
        }
        setState('success')
      } catch {
        setState('failure')
      }
    }
    finalize()
  }, [params, clearCart])

  const wrap = { background: '#F5E6D3', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, direction: isAr ? 'rtl' : 'ltr' }
  const card = { background: '#fff', borderRadius: 24, padding: '44px 32px', maxWidth: 440, width: '100%', textAlign: 'center', boxShadow: '0 14px 50px rgba(123,25,44,0.12)' }
  const btn = { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(to left, #7b192c, #a82040)', color: '#f4be69', padding: '12px 26px', borderRadius: 50, fontWeight: 700, textDecoration: 'none', fontFamily: 'Amiri, serif' }
  const ghost = { ...btn, background: '#fff', color: '#7b192c', border: '2px solid #E2C9A8' }

  if (state === 'loading') return (
    <div style={wrap}><div style={card}>
      <FiLoader size={50} color="#7b192c" style={{ animation: 'spin 1s linear infinite' }} />
      <h2 style={{ color: '#3E1C00', fontFamily: 'Amiri, serif', margin: '18px 0 6px' }}>{isAr ? 'جارٍ تأكيد الدفع…' : 'Confirming payment…'}</h2>
      <p style={{ color: '#9C6B4E', fontSize: '0.9rem' }}>{isAr ? 'لحظات من فضلك' : 'Just a moment'}</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div></div>
  )

  if (state === 'success') return (
    <div style={wrap}><div style={card}>
      <FiCheckCircle size={62} color="#16A34A" />
      <h2 style={{ color: '#3E1C00', fontFamily: 'Amiri, serif', margin: '18px 0 8px', fontSize: '1.5rem' }}>{isAr ? 'تمّ الدفع بنجاح!' : 'Payment Successful!'}</h2>
      <p style={{ color: '#6B3A2A', fontSize: '0.92rem', lineHeight: 1.7 }}>
        {isAr ? 'شكراً لك! تمّ تأكيد طلبك وسنبدأ بتجهيزه.' : 'Thank you! Your order is confirmed and being prepared.'}
      </p>
      {orderNumber && <p style={{ color: '#7b192c', fontWeight: 800, fontFamily: 'Amiri, serif', margin: '12px 0', fontSize: '1.05rem' }}>{isAr ? 'رقم الطلب: ' : 'Order #'}{orderNumber}</p>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
        <Link to="/products" style={btn}><FiShoppingBag size={16} /> {isAr ? 'متابعة التسوّق' : 'Continue Shopping'}</Link>
        <Link to="/" style={ghost}><FiHome size={16} /> {isAr ? 'الرئيسيّة' : 'Home'}</Link>
      </div>
    </div></div>
  )

  return (
    <div style={wrap}><div style={card}>
      <FiXCircle size={62} color="#DC2626" />
      <h2 style={{ color: '#3E1C00', fontFamily: 'Amiri, serif', margin: '18px 0 8px', fontSize: '1.5rem' }}>{isAr ? 'لم يكتمل الدفع' : 'Payment Not Completed'}</h2>
      <p style={{ color: '#6B3A2A', fontSize: '0.92rem', lineHeight: 1.7 }}>
        {isAr ? 'لم تتمّ عمليّة الدفع. لم يُخصم أيّ مبلغ. يمكنك المحاولة مجدّداً.' : 'The payment did not go through. No amount was charged. You can try again.'}
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
        <Link to="/checkout" style={btn}>{isAr ? 'إعادة المحاولة' : 'Try Again'}</Link>
        <Link to="/" style={ghost}><FiHome size={16} /> {isAr ? 'الرئيسيّة' : 'Home'}</Link>
      </div>
    </div></div>
  )
}
