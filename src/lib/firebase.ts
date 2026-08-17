import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Firebase apiKey/appId are client identifiers, not secrets — safe to ship in frontend code.
// Security is enforced by Firebase Auth/Firestore rules, not by hiding this config.
const firebaseConfig = {
  apiKey: 'AIzaSyCRCFKEj2TMCPzvmCyClWJbjFlhZqXDr-8',
  authDomain: 'vaultiq-990.firebaseapp.com',
  projectId: 'vaultiq-990',
  storageBucket: 'vaultiq-990.firebasestorage.app',
  messagingSenderId: '637366980457',
  appId: '1:637366980457:web:72a2841f269733330d37f8',
  measurementId: 'G-9K6B9B8F49',
}

export const firebaseApp = initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
