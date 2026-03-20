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
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')
  const { toast } = useToast()

  useEffect(() => {
    const u = getCurrentUser()
    if (u) setUser(u)
  }, [])

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.body.style.background = theme === 'dark' ? '#0d0d0d' : '#f5f0e8'
  }, [theme])

  const logout = () => {
    logoutUser()
    setUser(null)
  }

  const toggleTheme = () => {
    setTheme(t => t === 'dark' ? 'light' : 'dark')
  }

  if (!user) return <LoginPage onLogin={setUser} theme={theme} />

  const isDark = theme === 'dark'

  const s = {
    app: {
      display: 'flex', flexDirection: 'column',
      height: '100dvh',
      background: isDark ? '#0d0d0d' : '#f5f0e8',
      maxWidth: 480, margin: '0 auto',
    },
    header: {
      padding: '12px 16px',
      borderBottom: `1px solid ${isDark ? '#2e2e2e' : '#e0d8cc'}`,
      background: isDark ? '#0d0d0d' : '#ffffff',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
    },
    headerTitle: {
      fontSize: 16, fontWeight: 800,
      color: '#e8960f',
    },
    headerSub: {
      fontSize: 10, marginTop: 2,
      color: isDark ? '#5e5045' : '#a09080',
    },
    navBar: {
      display: 'flex',
      borderBottom: `1px solid ${isDark ? '#2e2e2e' : '#e0d8cc'}`,
      background: isDark ? '#181818' : '#ffffff',
      flexShrink: 0,
    },
    navTab: {
      flex: 1, padding: '10px 4px',
      background: 'none', border: 'none',
      color: isDark ? '#5e5045' : '#a09080',
      cursor: 'pointer', fontSize: 10, fontWeight: 600,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 3,
      borderBottom: '2px solid transparent',
      transition: 'all 0.18s',
      fontFamily: "'Noto Sans Georgian', sans-serif",
    },
    navTabActive: {
      color: '#e8960f',
      borderBottomColor: '#e8960f',
      background: 'rgba(232,150,15,0.04)',
    },
    content: { flex: 1, overflowY: 'auto', overflowX: 'hidden' },
  }

  return (
    <div style={s.app}>
      <header style={s.header}>
        <div>
          <div style={s.headerTitle}>🍳 რესტორანი "ტიფლისი"</div>
          <div style={s.headerSub}>შეფ-მზარეული: მეგი ბერიძე</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: isDark ? '#9e9080' : '#7a6a55' }}>
            {ROLE_LABELS[user.role]}
          </div>
          <button
            style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: 4 }}
            onClick={toggleTheme}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <button
            style={{
              background: 'none', border: 'none',
              fontSize: 11, cursor: 'pointer', padding: '4px 8px',
              color: isDark ? '#5e5045' : '#a09080',
            }}
            onClick={logout}
          >
            გასვლა
          </button>
        </div>
      </header>

      <nav style={s.navBar}>
        {TABS.map(t => (
          <button
            key={t.key}
            style={{ ...s.navTab, ...(tab === t.key ? s.navTabActive : {}) }}
            onClick={() => setTab(t.key)}
          >
            <span style={{ fontSize: 19 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      <div style={s.content}>
        {tab === 'bulk' && <BulkCalcPage user={user} theme={theme} />}
        {tab === 'portion' && <PortionCalcPage user={user} theme={theme} />}
        {tab === 'list' && <ListPage user={user} theme={theme} />}
        {tab === 'categories' && <CategoriesPage user={user} theme={theme} />}
      </div>

      <Toast toast={toast} />
    </div>
  )
}