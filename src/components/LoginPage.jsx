import { useState } from 'react'
import { loginUser, saveCurrentUser } from '../lib/supabase'

export default function LoginPage({ onLogin, theme }) {
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

  const isDark = theme === 'dark'

  return (
    <div style={{
      minHeight: '100dvh',
      background: isDark ? '#0d0d0d' : '#f5f0e8',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: "'Noto Sans Georgian', sans-serif",
    }}>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🍳</div>
        <div style={{
          fontSize: 24, fontWeight: 800,
          color: '#e8960f', letterSpacing: '-0.01em',
        }}>რესტორანი "ტიფლისი"</div>
        <div style={{
          fontSize: 13, marginTop: 6,
          color: isDark ? '#9e9080' : '#7a6a55',
        }}>შეფ-მზარეული: მეგი ბერიძე</div>
      </div>

      <div style={{
        width: '100%', maxWidth: 360,
        background: isDark ? '#181818' : '#ffffff',
        border: `1px solid ${isDark ? '#2e2e2e' : '#e0d8cc'}`,
        borderRadius: 16, padding: 24,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }}>
        <div style={{
          fontSize: 16, fontWeight: 700,
          color: isDark ? '#f2ede6' : '#2a1f0f',
          marginBottom: 20, textAlign: 'center',
        }}>შესვლა</div>

        <div style={{ marginBottom: 14 }}>
          <div style={{
            fontSize: 11, fontWeight: 600,
            color: isDark ? '#9e9080' : '#7a6a55',
            marginBottom: 6,
          }}>EMAIL</div>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="თქვენი email"
            style={{
              width: '100%', padding: '11px 14px',
              background: isDark ? '#202020' : '#f5f0e8',
              border: `1px solid ${isDark ? '#2e2e2e' : '#e0d8cc'}`,
              borderRadius: 10, color: isDark ? '#f2ede6' : '#2a1f0f',
              fontSize: 14, outline: 'none',
              fontFamily: "'Noto Sans Georgian', sans-serif",
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 11, fontWeight: 600,
            color: isDark ? '#9e9080' : '#7a6a55',
            marginBottom: 6,
          }}>პაროლი</div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && login()}
            style={{
              width: '100%', padding: '11px 14px',
              background: isDark ? '#202020' : '#f5f0e8',
              border: `1px solid ${isDark ? '#2e2e2e' : '#e0d8cc'}`,
              borderRadius: 10, color: isDark ? '#f2ede6' : '#2a1f0f',
              fontSize: 14, outline: 'none',
              fontFamily: "'Noto Sans Georgian', sans-serif",
            }}
          />
        </div>

        {error && (
          <div style={{
            background: 'rgba(224,80,80,0.1)',
            border: '1px solid rgba(224,80,80,0.3)',
            borderRadius: 8, padding: '10px 14px',
            color: '#e05050', fontSize: 13,
            marginBottom: 16, textAlign: 'center',
          }}>{error}</div>
        )}

        <button
          onClick={login}
          disabled={loading}
          style={{
            width: '100%', padding: 13,
            background: '#e8960f', color: '#000',
            border: 'none', borderRadius: 10,
            fontSize: 15, fontWeight: 700,
            cursor: 'pointer',
            fontFamily: "'Noto Sans Georgian', sans-serif",
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8,
          }}
        >
          {loading ? (
            <span style={{
              width: 18, height: 18,
              border: '2px solid rgba(0,0,0,0.3)',
              borderTopColor: '#000',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
              display: 'inline-block',
            }} />
          ) : '🔑 შესვლა'}
        </button>
      </div>

      <div style={{
        marginTop: 24, fontSize: 11,
        color: isDark ? '#5e5045' : '#a09080',
        textAlign: 'center',
      }}>
        კალკულაციების სისტემა © 2024
      </div>
    </div>
  )
}