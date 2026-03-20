import { useState, useEffect } from 'react'
import { getCurrentUser, logoutUser } from './lib/supabase'
import LoginPage from './components/LoginPage'
import BulkCalcPage from './components/BulkCalcPage'
import PortionCalcPage from './components/PortionCalcPage'
import ListPage from './components/ListPage'
import CategoriesPage from './components/CategoriesPage'
import { Toast, useToast } from './components/Toast'

const TABS = [
  { key: 'bulk', icon: '🧪', label: 'ნ/ფაბრიკატი' },
  { key: 'portion', icon: '🍽️', label: '1 ულუფა' },
  { key: 'list', icon: '📋', label: 'სია' },
  { key: 'categories', icon: '🗂️', label: 'კატეგ.' },
]

const ROLE_LABELS = {
  admin: '🔑 ადმინი',
  chef: '👨‍🍳 შეფი',
  cook: '👤 მზარეული',
}

export default function App() {
  const [tab, setTab] = useState('bulk')
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
  const { toast } = useToast()

  useEffect(() => {
    const u = getCurrentUser()
    if (u) setUser(u)
  }, [])

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
    document.body.style.background = theme === 'dark' ? '#111111' : '#f8f6f2'
  }, [theme])

  const logout = () => { logoutUser(); setUser(null) }
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  if (!user) return <LoginPage onLogin={setUser} theme={theme} />

  const isDark = theme === 'dark'

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100dvh',
      background: 'var(--bg)',
      maxWidth: 480, margin: '0 auto',
    }}>
      {/* HEADER */}
      <header style={{
        padding: '14px 18px 12px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div>
          <div style={{
            fontSize: 17, fontWeight: 800,
            color: 'var(--accent)',
            letterSpacing: '-0.02em',
          }}>
            🍳 ტიფლისი
          </div>
          <div style={{
            fontSize: 10, color: 'var(--text3)',
            marginTop: 1,
          }}>
            შეფ-მზარეული: მეგი ბერიძე
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            fontSize: 11, fontWeight: 600,
            color: 'var(--text2)',
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '4px 10px',
          }}>
            {ROLE_LABELS[user.role]}
          </div>
          <button onClick={toggleTheme} style={{
            width: 34, height: 34,
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
          }}>
            {isDark ? '☀️' : '🌙'}
          </button>
          <button onClick={logout} style={{
            width: 34, height: 34,
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            fontSize: 13, cursor: 'pointer',
            color: 'var(--text3)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
          }}>
            ↩
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {tab === 'bulk' && <BulkCalcPage user={user} theme={theme} />}
        {tab === 'portion' && <PortionCalcPage user={user} theme={theme} />}
        {tab === 'list' && <ListPage user={user} theme={theme} />}
        {tab === 'categories' && <CategoriesPage user={user} theme={theme} />}
      </div>

      {/* BOTTOM NAV */}
      <nav style={{
        display: 'flex',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        padding: '8px 8px 12px',
        flexShrink: 0,
        boxShadow: isDark
          ? '0 -4px 20px rgba(0,0,0,0.3)'
          : '0 -4px 20px rgba(0,0,0,0.06)',
      }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, padding: '8px 4px',
              background: tab === t.key
                ? 'var(--accent-dim)'
                : 'transparent',
              border: 'none',
              borderRadius: 12,
              color: tab === t.key ? 'var(--accent)' : 'var(--text3)',
              cursor: 'pointer',
              fontSize: 10, fontWeight: 700,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 4,
              transition: 'all 0.2s',
              letterSpacing: '0.01em',
            }}
          >
            <span style={{
              fontSize: 20,
              filter: tab === t.key ? 'none' : 'grayscale(0.5) opacity(0.6)',
            }}>
              {t.icon}
            </span>
            {t.label}
          </button>
        ))}
      </nav>

      <Toast toast={toast} />
    </div>
  )
}