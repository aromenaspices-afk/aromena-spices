import { useState, useEffect } from 'react'
import { db } from '../firebase'
import {
  collection, doc, getDocs, setDoc, deleteDoc, onSnapshot, orderBy, query
} from 'firebase/firestore'

export function useCollection(collectionName, options = {}) {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // لو في orderBy نستخدمه، وإلا نرتب بـ order field تلقائياً للمنتجات والباقات
    const autoOrderCollections = ['products']
    const col = collection(db, collectionName)
    const q = options.orderBy
      ? query(col, orderBy(options.orderBy, options.direction || 'asc'))
      : autoOrderCollections.includes(collectionName)
        ? query(col, orderBy('order', 'asc'))
        : col

    const unsub = onSnapshot(q, snapshot => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      // fallback: لو ما في order field نرتب بـ createdAt أو نبقي كما هو
      const sorted = docs.every(d => d.order !== undefined)
        ? docs
        : docs.sort((a, b) => {
            if (a.order !== undefined && b.order !== undefined) return a.order - b.order
            if (a.order !== undefined) return -1
            if (b.order !== undefined) return 1
            return 0
          })
      setData(sorted)
      setLoading(false)
    }, () => {
      // لو فشل الـ query (index مش موجود) نرجع بدون orderBy
      const unsub2 = onSnapshot(col, snapshot => {
        setData(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
      })
      return () => unsub2()
    })
    return () => unsub()
  }, [collectionName])

  return { data, loading }
}

export async function saveDoc(collectionName, id, data) {
  await setDoc(doc(db, collectionName, String(id)), data)
}

export async function deleteDocument(collectionName, id) {
  await deleteDoc(doc(db, collectionName, String(id)))
}

export async function getCollection(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName))
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
}