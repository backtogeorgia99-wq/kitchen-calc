import { useState } from 'react'
import BulkCalcPage from './components/BulkCalcPage'
import PortionCalcPage from './components/PortionCalcPage'
import ListPage from './components/ListPage'
import { Toast, useToast } from './components/Toast'

const TABS = [
  { key: 'bulk', icon: '🧪', label: 'ნ/ფაბრიკატი' },
  { key: 'portion', icon: '🍽️', label: '1 ულუფა' },
  { key: 'list', icon: '📋', label: 'სია' },
]

const s = {
  app: {
    display: 'flex', flexDirection: 'column',
    height: '100dvh', background: 'var(--bg)',
    maxWidth: 480, margin: '0 auto',
  },
  header: {
    padding: '14px 16px 12px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  headerLeft: {},
  headerTitle: {
    fontSize: 17, fontWeight: 800,
    color: 'var(--accent)',
    letterSpacing: '-0.01em',
  },
  headerSub: {
    fontSize: 10, color: 'var(--text3)', marginTop: 1,
    display: 'flex', alignItems: 'center', gap: 5,
  },
  dot: {
    width: 6, height: 6, borderRadius: '50%',
    background: 'var(--green)',
    animation: 'pulse 2.2s ease-in-out infinite',
    display: 'inline-block',
  },
  navBar: {
    display: 'flex',
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface)',
    flexShrink: 0,
  },
  navTab: {
    flex: 1, padding: '10px 4px',
    background: 'none', border: 'none',
    color: 'var(--text3)', cursor: 'pointer',
    fontSize: 11, fontWeight: 600,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 3,
    borderBottom: '2px solid transparent',
    transition: 'all 0.18s',
  },
  navTabActive: {
    color: 'var(--accent)',
    borderBottomColor: 'var(--accent)',
    background: 'rgba(232,150,15,0.04)',
  },
  tabIcon: { fontSize: 19 },
  content: { flex: 1, overflowY: 'auto', overflowX: 'hidden' },
}

export default function App() {
  const [tab, setTab] = useState('bulk')
  const { toast } = useToast()

  return (
    <div style={s.app}>
      <header style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.headerTitle}>🍳 კალკულაცია</div>
          <div style={s.headerSub}>
            <span style={s.dot} />
            Supabase-თან დაკავშირებულია
          </div>
        </div>
      </header>

      <nav style={s.navBar}>
        {TABS.map(t => (
          <button
            key={t.key}
            style={{ ...s.navTab, ...(tab === t.key ? s.navTabActive : {}) }}
            onClick={() => setTab(t.key)}
          >
            <span style={s.tabIcon}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      <div style={s.content}>
        {tab === 'bulk' && <BulkCalcPage />}
        {tab === 'portion' && <PortionCalcPage />}
        {tab === 'list' && <ListPage />}
      </div>

      <Toast toast={toast} />
    </div>
  )
}
