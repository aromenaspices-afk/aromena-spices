import { useEffect } from 'react'
import { doc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

// يزامن سلّة المستخدم المسجّل إلى Firestore (abandoned_carts/{uid})
// لتفعيل تذكير السلّة المتروكة. عند تفريغ السلّة (أو إتمام الطلب) تُحذف الوثيقة.
export default function CartSync() {
  const { items, total } = useCart()
  const { user, profile } = useAuth()

  useEffect(() => {
    if (!user) return
    const ref = doc(db, 'abandoned_carts', user.uid)

    // تأخير بسيط لتفادي كتابات متكرّرة أثناء تعديل الكمّيّات
    const t = setTimeout(async () => {
      try {
        if (!items.length) {
          await deleteDoc(ref).catch(() => {})
          return
        }
        await setDoc(ref, {
          uid: user.uid,
          email: user.email || profile?.email || '',
          firstName: profile?.firstName || (user.displayName ? user.displayName.split(' ')[0] : '') || '',
          items: items.map(i => ({ name: i.name || '', price: Number(i.price) || 0, qty: Number(i.qty) || 1, size: i.size || '' })),
          total: Number(total) || 0,
          updatedAt: new Date().toISOString(),
          reminded: false,
        }, { merge: true })
      } catch { /* صامت */ }
    }, 2500)

    return () => clearTimeout(t)
  }, [items, total, user, profile])

  return null
}
