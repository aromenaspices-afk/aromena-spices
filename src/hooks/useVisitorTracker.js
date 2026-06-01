import { useEffect } from 'react'
import { db } from '../firebase'
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore'

export function useVisitorTracker() {
  useEffect(() => {
    // تجنب التسجيل المكرر بنفس الجلسة
    if (sessionStorage.getItem('aromena_tracked')) return

    async function track() {
      try {
        // جيب معلومات الزائر من الـ IP
        const res = await fetch('https://ipapi.co/json/')
        const data = await res.json()

        const country = data.country_name || 'Unknown'
        const countryCode = data.country_code || 'XX'
        const city = data.city || 'Unknown'

        // التاريخ الحالي
        const today = new Date().toISOString().split('T')[0]
        const docRef = doc(db, 'visitors', today)
        const snap = await getDoc(docRef)

        if (snap.exists()) {
          // اليوم موجود — نحدّث العداد
          const existing = snap.data()
          const countries = existing.countries || {}
          countries[countryCode] = {
            name: country,
            code: countryCode,
            count: (countries[countryCode]?.count || 0) + 1,
          }
          await updateDoc(docRef, {
            count: increment(1),
            countries,
            lastVisit: new Date().toISOString(),
          })
        } else {
          // أول زيارة اليوم
          await setDoc(docRef, {
            date: today,
            count: 1,
            countries: {
              [countryCode]: {
                name: country,
                code: countryCode,
                count: 1,
              }
            },
            lastVisit: new Date().toISOString(),
          })
        }

        sessionStorage.setItem('aromena_tracked', '1')
      } catch (err) {
        console.log('Visitor tracking error:', err)
      }
    }

    track()
  }, [])
}