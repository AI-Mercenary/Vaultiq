import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth } from './firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  updateDisplayName: (name: string) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  updateDisplayName: async () => {},
  changePassword: async () => {},
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  const updateDisplayName = async (name: string) => {
    if (!auth.currentUser) return
    await updateProfile(auth.currentUser, { displayName: name })
    // updateProfile doesn't trigger onAuthStateChanged, so refresh local state manually
    setUser({ ...auth.currentUser } as User)
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!auth.currentUser || !auth.currentUser.email) throw new Error('Not signed in.')
    // Firebase requires a recent sign-in before allowing a password change
    const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword)
    await reauthenticateWithCredential(auth.currentUser, credential)
    await updatePassword(auth.currentUser, newPassword)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, updateDisplayName, changePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
