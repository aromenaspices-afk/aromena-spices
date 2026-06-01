import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBscR9mr_iGGJhIExdJYFqXF1GpOyzw89U",
  authDomain: "aromena-spices-storage.firebaseapp.com",
  projectId: "aromena-spices-storage",
  storageBucket: "aromena-spices-storage.firebasestorage.app",
  messagingSenderId: "837601798137",
  appId: "1:837601798137:web:da30b5208b84384e8dff28"
}

const app = initializeApp(firebaseConfig)
export const db      = getFirestore(app)
export const storage = getStorage(app)
export const auth    = getAuth(app)