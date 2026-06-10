import { createContext, useContext, useState, useEffect } from 'react'
import { auth, db } from '../firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  updatePassword,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { sendWelcomeEmail } from '../utils/emailService'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      if (u) {
        const snap = await getDoc(doc(db, 'users', u.uid))
        setUser(u)
        setProfile(snap.exists() ? snap.data() : {})
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  async function register(email, password, firstName, lastName) {
    const cred     = await createUserWithEmailAndPassword(auth, email, password)
    const fullName = `${firstName} ${lastName}`.trim()
    await updateProfile(cred.user, { displayName: fullName })
    const profileData = {
      firstName, lastName, email,
      displayName: fullName,
      gender: '', phone: '', country: '',
      addresses: [],
      createdAt: new Date().toISOString(),
      orders: 0,
    }
    await setDoc(doc(db, 'users', cred.user.uid), profileData)
    setProfile(profileData)
    // إيميل ترحيب عبر Brevo
    await sendWelcomeEmail({ email, displayName: firstName })
    return cred.user
  }

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const snap = await getDoc(doc(db, 'users', cred.user.uid))
    if (snap.exists()) setProfile(snap.data())
    return cred.user
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider()
    const cred     = await signInWithPopup(auth, provider)
    const snap     = await getDoc(doc(db, 'users', cred.user.uid))
    if (!snap.exists()) {
      const nameParts   = (cred.user.displayName || '').split(' ')
      const profileData = {
        firstName:   nameParts[0] || '',
        lastName:    nameParts.slice(1).join(' ') || '',
        displayName: cred.user.displayName || '',
        email:       cred.user.email,
        gender: '', phone: '', country: '',
        addresses: [],
        createdAt: new Date().toISOString(),
        orders: 0,
      }
      await setDoc(doc(db, 'users', cred.user.uid), profileData)
      setProfile(profileData)
      // إيميل ترحيب عبر Brevo
      await sendWelcomeEmail({ email: cred.user.email, displayName: nameParts[0] || 'عزيزي العميل' })
    } else {
      setProfile(snap.data())
    }
    return cred.user
  }

  async function updateUserProfile(data) {
    if (!user) return
    await updateDoc(doc(db, 'users', user.uid), data)
    const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim()
    if (fullName) await updateProfile(user, { displayName: fullName })
    setProfile(prev => ({ ...prev, ...data }))
  }

  async function changePassword(currentPassword, newPassword) {
    if (!user) return
    const credential = EmailAuthProvider.credential(user.email, currentPassword)
    await reauthenticateWithCredential(user, credential)
    await updatePassword(user, newPassword)
  }

  async function resetPassword(email) {
    await sendPasswordResetEmail(auth, email)
  }

  async function logout() {
    await signOut(auth)
    setProfile(null)
    // تنظيف بيانات الشراء والسلّة كي لا تتسرّب لمستخدم آخر على جهاز مشترك
    try {
      localStorage.removeItem('checkout_form')
      localStorage.removeItem('checkout_payment')
      localStorage.removeItem('aromena_cart')
    } catch { /* */ }
  }

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      register, login, loginWithGoogle,
      updateUserProfile, changePassword, resetPassword, logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}