import { useState } from 'react'
import { supabase } from '../supabase'

function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleAuth = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setSuccess('Account created! Check your email to confirm, then log in.')
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px', background: '#0D1117',
    border: '1px solid #21262D', borderRadius: '10px', color: 'white',
    fontSize: '15px', fontFamily: 'Barlow, sans-serif', marginTop: '6px'
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0D1117',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>💎</div>
          <h1 style={{ color: '#E85D24', fontSize: '36px', marginBottom: '8px' }}>DiamondStat</h1>
          <p style={{ color: '#888', fontSize: '14px' }}>Your AI baseball training platform</p>
        </div>

        {/* Card */}
        <div style={{ background: '#161B22', borderRadius: '16px', padding: '2rem', border: '1px solid #21262D' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }}
                style={{
                  flex: 1, padding: '10px', border: 'none', borderRadius: '8px',
                  background: mode === m ? '#E85D24' : '#21262D',
                  color: mode === m ? '#fff' : '#888',
                  fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                  fontFamily: 'Barlow, sans-serif', textTransform: 'capitalize'
                }}>
                {m === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#888', fontSize: '13px' }}>Email</label>
            <input style={inputStyle} type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: '#888', fontSize: '13px' }}>Password</label>
            <input style={inputStyle} type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAuth()} />
          </div>

          {/* Error / success */}
          {error && (
            <div style={{ background: '#F8514922', border: '1px solid #F85149', borderRadius: '8px', padding: '10px 14px', color: '#F85149', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: '#3FB95022', border: '1px solid #3FB950', borderRadius: '8px', padding: '10px 14px', color: '#3FB950', fontSize: '13px', marginBottom: '16px' }}>
              {success}
            </div>
          )}

          {/* Button */}
          <button onClick={handleAuth} disabled={loading || !email || !password}
            style={{
              width: '100%', padding: '14px', background: loading ? '#555' : '#E85D24',
              border: 'none', borderRadius: '10px', color: 'white',
              fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Barlow, sans-serif'
            }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Log In →' : 'Create Account →'}
          </button>

        </div>

        <div style={{ textAlign: 'center', color: '#555', fontSize: '12px', marginTop: '1.5rem' }}>
          Your data is private and secure
        </div>
      </div>
    </div>
  )
}

export default Auth