import React, { useState } from 'react'
import { useAuth } from './lib/AuthContext'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from './lib/firebase'

// ── Design tokens (matching App.tsx) ───────────────────────────────────────
const C = {
  bg: '#09090b',
  bg2: '#0d0d10',
  surface: '#111113',
  surface2: '#18181b',
  border: '#1f1f23',
  border2: '#27272a',
  indigo: '#6366f1',
  indigoDim: '#4f46e5',
  indigoGlow: 'rgba(99,102,241,0.12)',
  indigoRing: 'rgba(99,102,241,0.08)',
  indigoBorder: 'rgba(99,102,241,0.35)',
  text: '#f4f4f5',
  text2: '#e4e4e7',
  muted: '#a1a1aa',
  dim: '#71717a',
  faint: '#52525b',
  red: '#ef4444',
}

function VaultLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect x="2" y="4" width="17" height="17" rx="3.5" stroke="#6366f1" strokeWidth="1.5" />
      <rect x="5" y="7" width="11" height="11" rx="2" stroke="#818cf8" strokeWidth="1" opacity="0.4" />
      <circle cx="10.5" cy="12.5" r="3" stroke="#6366f1" strokeWidth="1.5" />
      <path d="M12.6 14.6L15 17" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M21 8h5M21 12h5M21 16h5" stroke="#818cf8" strokeWidth="1.25" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

export default function AuthPage() {
  const { signInWithGoogle } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setError(null)
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (err: any) {
      setError(err.message || 'An error occurred with Google Sign-In.')
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: C.bg,
        backgroundImage: `radial-gradient(circle at 50% -20%, ${C.indigoGlow} 0%, transparent 50%)`,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          padding: '40px',
          borderRadius: 16,
          backgroundColor: C.surface,
          border: `1px solid ${C.border}`,
          boxShadow: `0 0 0 1px ${C.border2}, 0 20px 40px rgba(0,0,0,0.4)`,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <div style={{ marginBottom: 16 }}>
            <VaultLogo size={42} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: C.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h1>
          <p style={{ fontSize: 14, color: C.dim, margin: 0 }}>
            {isSignUp ? 'Sign up to start searching your enterprise knowledge' : 'Sign in to your Vaultiq account'}
          </p>
        </div>

        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          style={{
            width: '100%',
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            backgroundColor: '#ffffff',
            color: '#1f2937',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 150ms ease',
            marginBottom: 24,
            opacity: loading ? 0.7 : 1,
          }}
          onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = '#f3f4f6')}
          onMouseLeave={e => !loading && (e.currentTarget.style.backgroundColor = '#ffffff')}
        >
          <GoogleIcon />
          <span>Continue with Google</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, backgroundColor: C.border2 }} />
          <span style={{ fontSize: 12, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Or
          </span>
          <div style={{ flex: 1, height: 1, backgroundColor: C.border2 }} />
        </div>

        <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: C.text2, marginBottom: 6, fontWeight: 500 }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="name@company.com"
              style={{
                width: '100%',
                height: 42,
                backgroundColor: C.surface2,
                border: `1px solid ${C.border2}`,
                borderRadius: 8,
                padding: '0 12px',
                color: C.text,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 150ms ease',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = C.indigo)}
              onBlur={e => (e.currentTarget.style.borderColor = C.border2)}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: C.text2, marginBottom: 6, fontWeight: 500 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                height: 42,
                backgroundColor: C.surface2,
                border: `1px solid ${C.border2}`,
                borderRadius: 8,
                padding: '0 12px',
                color: C.text,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 150ms ease',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = C.indigo)}
              onBlur={e => (e.currentTarget.style.borderColor = C.border2)}
            />
          </div>

          {error && (
            <div style={{ fontSize: 13, color: C.red, backgroundColor: `${C.red}15`, padding: 10, borderRadius: 6, border: `1px solid ${C.red}30` }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: 42,
              backgroundColor: C.indigo,
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 150ms ease',
              marginTop: 8,
              opacity: loading ? 0.8 : 1,
            }}
            onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = C.indigoDim)}
            onMouseLeave={e => !loading && (e.currentTarget.style.backgroundColor = C.indigo)}
          >
            {loading ? 'Processing...' : (isSignUp ? 'Sign up' : 'Sign in')}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: C.dim }}>
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            style={{
              background: 'none',
              border: 'none',
              color: C.indigo,
              cursor: 'pointer',
              padding: 0,
              fontSize: 13,
              fontWeight: 500,
            }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </div>
      </div>
    </div>
  )
}
