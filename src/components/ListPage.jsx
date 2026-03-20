import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { canEdit } from '../lib/supabase'
import DetailModal from './DetailModal'

export default function ListPage({ user, theme }) {
  const [calcs, setCalcs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const isDark = theme === 'dark'

  useEffect(() => {
    load()

    const channel = supabase
      .channel('calculations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'calculations' }, () => {
        load()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('calculations')
      .select('*')
      .order('created_at', { ascending: false })
    setCalcs(data || [])
    setLoading(false)
  }

  const deleteCalc = async (id) => {
    if (!window.confirm('წაშალოს?')) return
    await supabase.from('calculations').delete().eq('id', id)
    setSelected(null)
    load()
  }

  const displayed = calcs
    .filter(c => filter === 'all' || c.type === filter)
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.category || '').toLowerCase().includes(search.toLowerCase()))

  const s = {
    page: { padding: '14px 14px 48px', animation: 'fadeIn 0.2s ease' },
    searchBox: {
      width: '100%', padding: '10px 14px',
      background: isDark ? '#181818' : '#ffffff',
      border: `1px solid ${isDark ? '#2e2e2e' : '#e0d8cc'}`,
      borderRadius: 9, color: isDark ? '#f2ede6' : '#2a1f0f',
      fontSize: 13, outline: 'none', marginBottom: 12,
      fontFamily: "'Noto Sans Georgian', sans-serif",
    },
    filterRow: {
      display: 'flex', gap: 7, marginBottom: 14,
      overflowX: 'auto', paddingBottom: 4,
    },
    chip: {
      whiteSpace: 'nowrap', padding: '7px 16px',
      background: isDark ? '#181818' : '#ffffff',
      border: `1px solid ${isDark ? '#2e2e2e' : '#e0d8cc'}`,
      borderRadius: 20, color: isDark ? '#9e9080' : '#7a6a55',
      fontSize: 12, cursor: 'pointer', flexShrink: 0,
      fontFamily: "'Noto Sans Georgian', sans-serif",
    },
    chipActive: {
      background: '#e8960f', color: '#000',
      border: '1px solid #e8960f', fontWeight: 700,
    },
    card: {
      background: isDark ? '#181818' : '#ffffff',
      border: `1px solid ${isDark ? '#2e2e2e' : '#e0d8cc'}`,
      borderRadius: 14, padding: '14px',
      marginBottom: 10, cursor: 'pointer',
      position: 'relative', overflow: 'hidden',
    },
    cardTop: {
      display: 'flex', alignItems: 'flex-start',
      justifyContent: 'space-between', gap: 8, marginBottom: 6,
    },
    cardName: {
      fontSize: 15, fontWeight: 700,
      color: isDark ? '#f2ede6' : '#2a1f0f',
    },
    badge: {
      fontSize: 10, padding: '3px 9px',
      borderRadius: 20, fontWeight: 700,
      whiteSpace: 'nowrap', flexShrink: 0,
    },
    cardMeta: {
      fontSize: 12,
      color: isDark ? '#5e5045' : '#a09080',
      marginBottom: 4,
    },
    cardBottom: {
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', marginTop: 8,
    },
    cardCost: { fontSize: 17, fontWeight: 800, color: '#e8960f' },
    cardDate: { fontSize: 10, color: isDark ? '#5e5045' : '#a09080' },
    accentBar: {
      position: 'absolute', left: 0, top: 0, bottom: 0,
      width: 3, borderRadius: '3px 0 0 3px',
    },
    empty: {
      textAlign: 'center', padding: '56px 24px',
      color: isDark ? '#5e5045' : '#a09080',
    },
    spinner: {
      width: 28, height: 28,
      border: `2px solid ${isDark ? '#2e2e2e' : '#e0d8cc'}`,
      borderTopColor: '#e8960f',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      margin: '40px auto',
    },
  }

  return (
    <div style={s.page}>
      <input
        style={s.searchBox}
        placeholder="🔍 ძიება..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div style={s.filterRow}>
        {[
          { key: 'all', label: '🗂 ყველა' },
          { key: 'bulk', label: '🧪 ნ/ფაბრიკატი' },
          { key: 'portion', label: '🍽️ 1 ულუფა' },
        ].map(f => (
          <button
            key={f.key}
            style={{ ...s.chip, ...(filter === f.key ? s.chipActive : {}) }}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={s.spinner} />
      ) : displayed.length === 0 ? (
        <div style={s.empty}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{search ? '🔍' : '📋'}</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
            {search ? 'ვერ მოიძებნა' : 'ჩანაწერი არ არის'}
          </div>
        </div>
      ) : (
        displayed.map(c => {
          const isBulk = c.type === 'bulk'
          const date = new Date(c.created_at).toLocaleDateString('ka-GE')
          const barColor = isBulk ? '#4a90e0' : '#4ab86a'
          const badgeStyle = isBulk
            ? { ...s.badge, background: 'rgba(74,144,224,0.12)', color: '#4a90e0', border: '1px solid rgba(74,144,224,0.3)' }
            : { ...s.badge, background: 'rgba(74,184,106,0.12)', color: '#4ab86a', border: '1px solid rgba(74,184,106,0.3)' }

          return (
            <div key={c.id} style={s.card} onClick={() => setSelected(c)}>
              <div style={{ ...s.accentBar, background: barColor }} />
              <div style={{ paddingLeft: 8 }}>
                <div style={s.cardTop}>
                  <div style={s.cardName}>{c.name}</div>
                  <span style={badgeStyle}>{isBulk ? 'ნ/ფაბრ.' : '1 ულ.'}</span>
                </div>
                <div style={s.cardMeta}>
                  {c.category}
                  {isBulk && c.servings ? ` · ${c.servings} ულუფა` : ''}
                  {c.yield_amount ? ` · ${c.yield_amount}${c.yield_unit}` : ''}
                  {c.created_by ? ` · ${c.created_by}` : ''}
                </div>
                <div style={s.cardBottom}>
                  <span style={s.cardCost}>₾ {parseFloat(c.total_cost || 0).toFixed(2)}</span>
                  <span style={s.cardDate}>{date}</span>
                </div>
              </div>
            </div>
          )
        })
      )}

      {selected && (
        <DetailModal
          calc={selected}
          user={user}
          theme={theme}
          onClose={() => setSelected(null)}
          onDelete={canEdit(user) ? deleteCalc : null}
        />
      )}
    </div>
  )
}