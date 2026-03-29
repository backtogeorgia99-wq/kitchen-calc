import { useState, useEffect } from 'react'
import { getCurrentUser, logoutUser } from './lib/supabase'
import LoginPage from './components/LoginPage'
import BulkCalcPage from './components/BulkCalcPage'
import PortionCalcPage from './components/PortionCalcPage'
import ListPage from './components/ListPage'
import CategoriesPage from './components/CategoriesPage'
import AdminPanelPage from './components/AdminPanelPage'
import BulkFabLogo from './components/BulkFabLogo'
import { Toast, useToast } from './components/Toast'

const TABS_BASE = [
  { key: 'bulk', icon: null, label: 'ნ/ფაბრიკატი' },
  { key: 'portion', icon: '🍽️', label: '1 ულუფა' },
  { key: 'list', icon: '📋', label: 'სია' },
]

const TAB_CATEGORIES = { key: 'categories', icon: '🗂️', label: 'კატეგ.' }

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
    document.body.style.background = ''
  }, [theme])

  const logout = () => { logoutUser(); setUser(null) }
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  if (!user) return <LoginPage onLogin={setUser} />

  const isDark = theme === 'dark'
  const isAdmin = user.role === 'admin'
  const bottomTabs = isAdmin ? TABS_BASE : [...TABS_BASE, TAB_CATEGORIES]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100dvh',
      background: 'transparent',
      maxWidth: 480, margin: '0 auto',
    }}>
      {/* HEADER */}
      <header style={{
        padding: '16px 18px 14px',
        background: 'var(--header-shine)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-card)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06), inset 0 -1px 0 rgba(72,209,204,0.2)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <div style={{
            fontSize: 18, fontWeight: 800,
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.02em',
          }}>
            🍳 ტიფლისი
          </div>
          <div style={{
            fontSize: 10, color: 'var(--text3)',
            marginTop: 3,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}>
            შეფ-მზარეული: მეგი ბერიძე
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            fontSize: 10, fontWeight: 700,
            color: 'var(--text2)',
            background: 'var(--surface2)',
            border: '1px solid var(--border-card)',
            borderRadius: 22,
            padding: '5px 11px',
            letterSpacing: '0.04em',
          }}>
            {ROLE_LABELS[user.role]}
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setTab('admin')}
              style={{
                padding: '7px 13px',
                background: tab === 'admin' ? 'var(--accent-gradient)' : 'var(--surface2)',
                border: tab === 'admin'
                  ? '1px solid var(--border-accent)'
                  : '1px solid var(--border-card)',
                borderRadius: 12,
                fontSize: 10, fontWeight: 800,
                cursor: 'pointer',
                color: tab === 'admin' ? '#1a1410' : 'var(--text2)',
                fontFamily: "'Noto Sans Georgian', sans-serif",
                whiteSpace: 'nowrap',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                boxShadow: tab === 'admin'
                  ? '0 4px 20px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.35)'
                  : 'none',
              }}
            >
              ⚙ ადმინი
            </button>
          )}
          <button type="button" onClick={toggleTheme} style={{
            width: 36, height: 36,
            background: 'var(--surface2)',
            border: '1px solid var(--border-card)',
            borderRadius: 12,
            fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}>
            {isDark ? '☀️' : '🌙'}
          </button>
          <button type="button" onClick={logout} style={{
            width: 36, height: 36,
            background: 'var(--surface2)',
            border: '1px solid var(--border-card)',
            borderRadius: 12,
            fontSize: 14, cursor: 'pointer',
            color: 'var(--text3)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
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
        {tab === 'admin' && <AdminPanelPage user={user} theme={theme} />}
      </div>

      {/* BOTTOM NAV */}
      <nav style={{
        display: 'flex',
        background: 'var(--nav-blur)',
        backdropFilter: 'blur(20px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
        borderTop: '1px solid var(--border-card)',
        padding: '10px 10px 14px',
        flexShrink: 0,
        boxShadow: '0 -8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(72,209,204,0.18)',
      }}>
        {bottomTabs.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, padding: '9px 4px',
              background: tab === t.key
                ? 'linear-gradient(165deg, var(--accent-dim), transparent)'
                : 'transparent',
              border: tab === t.key ? '1px solid var(--border-accent)' : '1px solid transparent',
              borderRadius: 14,
              color: tab === t.key ? 'var(--accent-bright)' : 'var(--text3)',
              cursor: 'pointer',
              fontSize: 9, fontWeight: 800,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 5,
              transition: 'all 0.22s ease',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            <span style={{
              fontSize: 20,
              filter: t.key === 'bulk' ? 'none' : (tab === t.key ? 'none' : 'grayscale(0.5) opacity(0.6)'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 24,
            }}>
              {t.key === 'bulk' ? (
                <BulkFabLogo size={26} dimmed={tab !== t.key} />
              ) : (
                t.icon
              )}
            </span>
            {t.label}
          </button>
        ))}
      </nav>

      <Toast toast={toast} />
    </div>
  )
}