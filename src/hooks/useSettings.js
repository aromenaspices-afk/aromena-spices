import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { doc, onSnapshot } from 'firebase/firestore'

export function useSettings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'main'), snap => {
      if (snap.exists()) setSettings(snap.data())
      setLoading(false)
    })
    return () => unsub()
  }, [])

  return { settings, loading }
}