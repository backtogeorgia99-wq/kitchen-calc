import { useState } from 'react'
import { loginUser, saveCurrentUser, isSupabaseConfigured } from '../lib/supabase'

export default function LoginPage({ onLogin, theme }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isDark = theme === 'dark'

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

  return (
    <div style={{
      minHeight: '100dvh',
      background: isDark ? '#111111' : '#f8f6f2',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 20px',
      fontFamily: "'Noto Sans Georgian', sans-serif",
    }}>

      {/* LOGO AREA */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          width: 72, height: 72,
          background: isDark ? '#1e1e1e' : '#ffffff',
          borderRadius: 24,
          boxShadow: isDark
            ? '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)'
            : '0 8px 32px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.06)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36, margin: '0 auto 20px',
        }}>
          🍳
        </div>
        <div style={{
          fontSize: 26, fontWeight: 800,
          color: isDark ? '#f2ede6' : '#1a1410',
          letterSpacing: '-0.03em',
          marginBottom: 6,
        }}>
          რესტორანი "ტიფლისი"
        </div>
        <div style={{
          fontSize: 13, color: isDark ? '#5e5045' : '#b0a090',
          fontWeight: 500,
        }}>
          კალკულაციების სისტემა
        </div>
      </div>

      {/* LOGIN CARD */}
      <div style={{
        width: '100%', maxWidth: 380,
        background: isDark ? '#1e1e1e' : '#ffffff',
        borderRadius: 24,
        boxShadow: isDark
          ? '0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)'
          : '0 8px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)',
        padding: '28px 24px',
        animation: 'fadeUp 0.4s ease',
      }}>
        <div style={{
          fontSize: 15, fontWeight: 700,
          color: isDark ? '#f2ede6' : '#1a1410',
          marginBottom: 22,
          textAlign: 'center',
        }}>
          შესვლა
        </div>

        {!isSupabaseConfigured() && (
          <div style={{
            marginBottom: 18,
            padding: '12px 14px',
            borderRadius: 12,
            background: isDark ? 'rgba(232,150,15,0.12)' : 'rgba(232,150,15,0.14)',
            border: `1px solid ${isDark ? 'rgba(232,150,15,0.35)' : 'rgba(200,130,20,0.35)'}`,
            fontSize: 12,
            lineHeight: 1.5,
            color: isDark ? '#e8c48a' : '#7a5a20',
            textAlign: 'left',
          }}>
            <strong>ლოკალური პარამეტრები არ არის.</strong> პროექტის ფოლდერში შექმენით ფაილი{' '}
            <code style={{ fontSize: 11, padding: '2px 6px', borderRadius: 6, background: isDark ? '#2a2418' : '#f0e8d8' }}>.env</code>
            {' '}(შეგიძლიათ დააკოპიროთ <code style={{ fontSize: 11 }}>.env.example</code>) და ჩასვით Supabase-იდან{' '}
            <code style={{ fontSize: 11 }}>VITE_SUPABASE_URL</code> და{' '}
            <code style={{ fontSize: 11 }}>VITE_SUPABASE_ANON_KEY</code>. შემდეგ გაჩერებით გაუშვით თავიდან{' '}
            <code style={{ fontSize: 11 }}>npm run dev</code>.
          </div>
        )}

        {/* EMAIL */}
        <div style={{ marginBottom: 14 }}>
          <div style={{
            fontSize: 11, fontWeight: 700,
            color: isDark ? '#9e9080' : '#b0a090',
            marginBottom: 7,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            Email
          </div>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="თქვენი email"
            style={{
              width: '100%', padding: '13px 16px',
              background: isDark ? '#242424' : '#f8f6f2',
              border: `1.5px solid ${isDark ? '#2a2a2a' : '#ede8e0'}`,
              borderRadius: 12,
              color: isDark ? '#f2ede6' : '#1a1410',
              fontSize: 14, outline: 'none',
              fontFamily: "'Noto Sans Georgian', sans-serif",
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#e8960f'}
            onBlur={e => e.target.style.borderColor = isDark ? '#2a2a2a' : '#ede8e0'}
          />
        </div>

        {/* PASSWORD */}
        <div style={{ marginBottom: 22 }}>
          <div style={{
            fontSize: 11, fontWeight: 700,
            color: isDark ? '#9e9080' : '#b0a090',
            marginBottom: 7,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            პაროლი
          </div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && login()}
            style={{
              width: '100%', padding: '13px 16px',
              background: isDark ? '#242424' : '#f8f6f2',
              border: `1.5px solid ${isDark ? '#2a2a2a' : '#ede8e0'}`,
              borderRadius: 12,
              color: isDark ? '#f2ede6' : '#1a1410',
              fontSize: 14, outline: 'none',
              fontFamily: "'Noto Sans Georgian', sans-serif",
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#e8960f'}
            onBlur={e => e.target.style.borderColor = isDark ? '#2a2a2a' : '#ede8e0'}
          />
        </div>

        {/* ERROR */}
        {error && (
          <div style={{
            background: 'rgba(220,68,68,0.08)',
            border: '1px solid rgba(220,68,68,0.2)',
            borderRadius: 10, padding: '10px 14px',
            color: '#dc4444', fontSize: 13,
            marginBottom: 16, textAlign: 'center',
            fontWeight: 500,
          }}>
            {error}
          </div>
        )}

        {/* BUTTON */}
        <button
          onClick={login}
          disabled={loading}
          style={{
            width: '100%', padding: '14px',
            background: loading ? '#c47a0a' : '#e8960f',
            color: '#000', border: 'none',
            borderRadius: 12,
            fontSize: 15, fontWeight: 800,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: "'Noto Sans Georgian', sans-serif",
            letterSpacing: '-0.01em',
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8,
          }}
        >
          {loading ? (
            <span style={{
              width: 18, height: 18,
              border: '2px solid rgba(0,0,0,0.25)',
              borderTopColor: '#000',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
              display: 'inline-block',
            }} />
          ) : '🔑 შესვლა'}
        </button>
      </div>

      <div style={{
        marginTop: 28, fontSize: 11,
        color: isDark ? '#3a3a3a' : '#d0c8bc',
        textAlign: 'center',
      }}>
        © 2026 რესტორანი ტიფლისი
      </div>
    </div>
  )
}