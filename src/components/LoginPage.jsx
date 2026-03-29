import { useState } from 'react'
import { loginUser, saveCurrentUser, isSupabaseConfigured } from '../lib/supabase'

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const login = async () => {
    if (!email || !password) { setError('შეავსეთ ყველა ველი'); return }
    setLoading(true)
    setError('')
    const { user, error: err } = await loginUser(email, password)
    setLoading(false)
    if (err) { setError(err); return }
    saveCurrentUser(user)
    onLogin(user)
  }

  const field = {
    width: '100%', padding: '14px 16px',
    background: 'var(--input-fill)',
    border: '1.5px solid var(--input-border)',
    borderRadius: 14,
    color: 'var(--text)',
    fontSize: 14, outline: 'none',
    fontFamily: "'Noto Sans Georgian', sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  const label = {
    fontSize: 10, fontWeight: 800,
    color: 'var(--text-muted)',
    marginBottom: 8,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'transparent',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '28px 20px',
      fontFamily: "'Noto Sans Georgian', sans-serif",
    }}>

      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{
          width: 80, height: 80,
          background: 'var(--surface-shine)',
          borderRadius: 26,
          border: '1px solid var(--border-card)',
          boxShadow: 'var(--shadow-card)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center',
          fontSize: 38, margin: '0 auto 22px',
        }}>
          🍳
        </div>
        <div style={{
          fontSize: 28, fontWeight: 800,
          background: 'var(--accent-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '0.04em',
          marginBottom: 8,
        }}>
          რესტორანი „ტიფლისი“
        </div>
        <div style={{
          fontSize: 11, color: 'var(--text-muted)',
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}>
          კალკულაციების სისტემა
        </div>
      </div>

      <div style={{
        width: '100%', maxWidth: 380,
        background: 'var(--surface-shine)',
        borderRadius: 26,
        border: '1px solid var(--border-card)',
        boxShadow: 'var(--shadow-lg)',
        padding: '8px 8px 0',
        animation: 'fadeUp 0.5s ease',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          height: 3,
          background: 'var(--accent-gradient)',
          borderRadius: 2,
          margin: '0 12px 0',
          opacity: 0.95,
        }} />
        <div style={{ padding: '28px 24px 32px' }}>
          <div style={{
            fontSize: 11, fontWeight: 800,
            color: 'var(--text-muted)',
            marginBottom: 22,
            textAlign: 'center',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}>
            შესვლა
          </div>

          {!isSupabaseConfigured() && (
            <div style={{
              marginBottom: 20,
              padding: '14px 16px',
              borderRadius: 14,
              background: 'var(--accent-dim)',
              border: '1px solid var(--border-accent)',
              fontSize: 12,
              lineHeight: 1.55,
              color: 'var(--text2)',
              textAlign: 'left',
            }}>
              <strong style={{ color: 'var(--accent-bright)' }}>ლოკალური პარამეტრები არ არის.</strong> პროექტის ფოლდერში შექმენით ფაილი{' '}
              <code style={{ fontSize: 11, padding: '2px 6px', borderRadius: 6, background: 'var(--surface2)' }}>.env</code>
              {' '}(შეგიძლიათ დააკოპიროთ <code style={{ fontSize: 11 }}>.env.example</code>) და ჩასვით Supabase-იდან{' '}
              <code style={{ fontSize: 11 }}>VITE_SUPABASE_URL</code> და{' '}
              <code style={{ fontSize: 11 }}>VITE_SUPABASE_ANON_KEY</code>. შემდეგ გაჩერებით გაუშვით თავიდან{' '}
              <code style={{ fontSize: 11 }}>npm run dev</code>.
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <div style={label}>Email</div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="თქვენი email"
              style={field}
              onFocus={e => { e.target.style.borderColor = 'var(--accent-bright)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)' }}
              onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = 'none' }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={label}>პაროლი</div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && login()}
              style={field}
              onFocus={e => { e.target.style.borderColor = 'var(--accent-bright)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)' }}
              onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = 'none' }}
            />
          </div>

          {error && (
            <div style={{
              background: 'var(--red-dim)',
              border: '1px solid rgba(185,28,28,0.25)',
              borderRadius: 12, padding: '12px 14px',
              color: 'var(--red)', fontSize: 13,
              marginBottom: 18, textAlign: 'center',
              fontWeight: 600,
            }}>
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={login}
            disabled={loading}
            style={{
              width: '100%', padding: '16px',
              background: loading ? 'var(--accent)' : 'var(--accent-gradient)',
              color: '#1a1410',
              border: '1px solid var(--border-accent)',
              borderRadius: 14,
              fontSize: 12, fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Noto Sans Georgian', sans-serif",
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8,
              boxShadow: '0 8px 28px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.35)',
              opacity: loading ? 0.85 : 1,
            }}
          >
            {loading ? (
              <span style={{
                width: 18, height: 18,
                border: '2px solid rgba(0,0,0,0.2)',
                borderTopColor: '#1a1410',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
                display: 'inline-block',
              }} />
            ) : '🔑 შესვლა'}
          </button>
        </div>
      </div>

      <div style={{
        marginTop: 32, fontSize: 10,
        color: 'var(--text3)',
        textAlign: 'center',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        fontWeight: 600,
      }}>
        © 2026 რესტორანი ტიფლისი
      </div>
    </div>
  )
}
