// OA PROPOSAL GENERATOR — main.jsx
// Auth gate. Two access paths:
// 1. Token URL: /proposal/:token — public client access, no login required
// 2. /admin — internal OA team access via magic link + OTP

import { StrictMode, useState, useEffect, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import ProposalApp from './ProposalApp.jsx'

const SUPABASE_URL = 'https://rfzztndieqiixcauxdvj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmenp0bmRpZXFpaXhjYXV4ZHZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MDIyNzYsImV4cCI6MjA5MzQ3ODI3Nn0.N7WByLEE_VhdBaFoOctIygXhrkAdCiK4XoVUqRJwFvU'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// withTimeout: 3s ceiling on all auth/async. No unbounded waits.
const withTimeout = (promise, ms = 3000, label = 'op') => {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`[auth] ${label} timed out`)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

// Detect if this is a token URL (/proposal/:token) or admin URL
const getPathMode = () => {
  const path = window.location.pathname
  if (path.startsWith('/proposal/')) return { mode: 'client', token: path.split('/proposal/')[1] }
  if (path.startsWith('/admin')) return { mode: 'admin' }
  return { mode: 'admin' } // default to admin for internal use during build phase
}

// ── ADMIN LOGIN SCREEN ────────────────────────────────────────
const AdminLoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [phase, setPhase] = useState('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSend = async () => {
    if (!email.trim()) return
    setLoading(true); setError('')
    try {
      const { error: e } = await withTimeout(
        supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: false } }),
        5000, 'sendOTP'
      )
      if (e) throw e
      setPhase('otp')
    } catch (e) {
      setError(e.message.includes('Signups not allowed') ? 'Email not recognised. Contact Tyler.' : e.message)
    } finally { setLoading(false) }
  }

  const handleVerify = async () => {
    if (otp.length < 6) return
    setLoading(true); setError('')
    try {
      const { data, error: e } = await withTimeout(
        supabase.auth.verifyOtp({ email: email.trim(), token: otp.trim(), type: 'email' }),
        5000, 'verifyOTP'
      )
      if (e) throw e
      if (data?.session) onLogin(data.session)
    } catch (e) { setError('Invalid or expired code.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf8f5' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '2rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, paddingBottom: '1rem', borderBottom: '1px solid #9e8959', marginBottom: '0.75rem' }}>
            <div style={{ width: 34, height: 34, background: '#1a1a1a', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#9e8959', fontFamily: 'Cormorant Garamond', fontSize: '16px', fontWeight: 600 }}>OA</span>
            </div>
            <span style={{ fontFamily: 'Cormorant Garamond', fontSize: '20px', fontWeight: 300, letterSpacing: '0.1em', color: '#1a1a1a' }}>PROPOSAL STUDIO</span>
          </div>
          <p style={{ fontSize: '12px', color: '#8a8070', letterSpacing: '0.04em' }}>Custom Home Interiors — Internal Access</p>
        </div>

        {/* Form */}
        <div style={{ background: '#fff', border: '1px solid #e8e2d9', borderRadius: '4px', padding: '2.5rem', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
          {phase === 'email' ? (
            <>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, letterSpacing: '0.15em', color: '#8a8070', textTransform: 'uppercase', marginBottom: '0.5rem' }}>OA Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="you@obviousadvantage.ca" autoFocus
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #d4cdc4', borderRadius: '3px', fontSize: '15px', fontFamily: 'DM Sans', outline: 'none', marginBottom: '1rem' }} />
              <button onClick={handleSend} disabled={loading || !email.trim()}
                style={{ width: '100%', padding: '0.875rem', background: '#9e8959', color: '#fff', border: 'none', borderRadius: '3px', fontSize: '12px', fontFamily: 'DM Sans', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Sending…' : 'Send Access Code'}
              </button>
            </>
          ) : (
            <>
              <p style={{ fontSize: '13px', color: '#5a5248', marginBottom: '1.25rem', lineHeight: 1.6 }}>Code sent to <strong>{email}</strong></p>
              <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))} onKeyDown={e => e.key === 'Enter' && handleVerify()}
                placeholder="Enter code" autoFocus
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d4cdc4', borderRadius: '3px', fontSize: '24px', textAlign: 'center', letterSpacing: '0.3em', fontFamily: 'DM Sans', outline: 'none', marginBottom: '1rem' }} />
              <button onClick={handleVerify} disabled={loading || otp.length < 6}
                style={{ width: '100%', padding: '0.875rem', background: '#9e8959', color: '#fff', border: 'none', borderRadius: '3px', fontSize: '12px', fontFamily: 'DM Sans', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', opacity: loading ? 0.7 : 1, marginBottom: '0.75rem' }}>
                {loading ? 'Verifying…' : 'Sign In'}
              </button>
              <button onClick={() => { setPhase('email'); setOtp(''); setError('') }}
                style={{ width: '100%', padding: '0.5rem', background: 'transparent', color: '#8a8070', border: 'none', fontSize: '13px', cursor: 'pointer', fontFamily: 'DM Sans' }}>
                ← Different email
              </button>
            </>
          )}
          {error && <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fef3f2', border: '1px solid #fca5a5', borderRadius: '3px', fontSize: '13px', color: '#b91c1c' }}>{error}</div>}
        </div>
      </div>
    </div>
  )
}

// ── AUTH GATE ─────────────────────────────────────────────────
const AuthGate = () => {
  const [bootState, setBootState] = useState('booting')
  const [userProfile, setUserProfile] = useState(null)
  const { mode, token } = getPathMode()

  const fetchProfile = useCallback(async (sess) => {
    console.log('[auth] fetchProfile', sess.user.email)
    try {
      const { data } = await withTimeout(
        supabase.from('app_users').select('*').eq('email', sess.user.email).maybeSingle(),
        3000, 'fetchProfile'
      )
      if (data) {
        setUserProfile(data)
      } else {
        await withTimeout(
          supabase.from('app_users').insert({ email: sess.user.email, display_name: sess.user.email.split('@')[0], role: 'user' }),
          3000, 'insertProfile'
        )
        setUserProfile({ email: sess.user.email, display_name: sess.user.email.split('@')[0], role: 'user' })
      }
      setBootState('ready')
    } catch (e) {
      console.warn('[auth] fetchProfile failed:', e.message)
      setUserProfile({ email: sess.user.email, display_name: sess.user.email.split('@')[0], role: 'user' })
      setBootState('ready')
    }
  }, [])

  useEffect(() => {
    // Client token path — no auth needed, load proposal by token
    if (mode === 'client' && token) {
      setBootState('ready')
      return
    }

    // Admin path — require auth
    withTimeout(supabase.auth.getSession(), 3000, 'getSession')
      .then(({ data }) => {
        if (data?.session) fetchProfile(data.session)
        else setBootState('login')
      })
      .catch(() => setBootState('login'))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
      if (event === 'SIGNED_IN' && sess) fetchProfile(sess)
      if (event === 'SIGNED_OUT') { setBootState('login'); setUserProfile(null) }
    })
    return () => subscription.unsubscribe()
  }, [fetchProfile, mode, token])

  if (bootState === 'booting') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf8f5' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Cormorant Garamond', fontSize: '22px', color: '#9e8959', letterSpacing: '0.1em' }}>OA PROPOSAL STUDIO</div>
        <div style={{ fontSize: '12px', color: '#c5b798', marginTop: '0.75rem' }}>Loading…</div>
      </div>
    </div>
  )

  if (bootState === 'login') return <AdminLoginScreen onLogin={fetchProfile} />

  return (
    <ProposalApp
      supabase={supabase}
      userProfile={userProfile}
      mode={mode}
      token={token || null}
    />
  )
}

createRoot(document.getElementById('root')).render(<StrictMode><AuthGate /></StrictMode>)
