import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import DetailModal from './DetailModal'

const s = {
  page: { padding: '14px 14px 48px', animation: 'fadeIn 0.2s ease' },
  filterRow: {
    display: 'flex', gap: 7, marginBottom: 14,
    overflowX: 'auto', paddingBottom: 4,
  },
  chip: {
    whiteSpace: 'nowrap', padding: '7px 16px',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 20, color: 'var(--text2)',
    fontSize: 12, cursor: 'pointer',
    transition: 'all 0.18s',
    flexShrink: 0,
  },
  chipActive: {
    background: 'var(--accent)', color: '#000',
    border: '1px solid var(--accent)', fontWeight: 700,
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '14px', marginBottom: 10,
    cursor: 'pointer', transition: 'border-color 0.18s',
    position: 'relative', overflow: 'hidden',
  },
  cardTop: {
    display: 'flex', alignItems: 'flex-start',
    justifyContent: 'space-between', gap: 8, marginBottom: 6,
  },
  cardName: { fontSize: 15, fontWeight: 700, color: 'var(--text)' },
  badge: {
    fontSize: 10, padding: '3px 9px',
    borderRadius: 20, fontWeight: 700,
    whiteSpace: 'nowrap', flexShrink: 0,
  },
  cardMeta: { fontSize: 12, color: 'var(--text3)', marginBottom: 4 },
  cardBottom: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginTop: 8,
  },
  cardCost: { fontSize: 17, fontWeight: 800, color: 'var(--accent)' },
  cardDate: { fontSize: 10, color: 'var(--text3)' },
  accentBar: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: 3, borderRadius: '3px 0 0 3px',
  },
  empty: {
    textAlign: 'center', padding: '56px 24px',
    color: 'var(--text3)',
  },
  emptyIcon: { fontSize: 52, marginBottom: 14 },
  loadingWrap: {
    display: 'flex', justifyContent: 'center',
    padding: '40px 0',
  },
  spinner: {
    width: 28, height: 28,
    border: '2px solid var(--border)',
    borderTopColor: 'var(--accent)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  searchBox: {
    width: '100%', padding: '10px 14px',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text)', fontSize: 13,
    outline: 'none', marginBottom: 12,
  },
}

const FILTERS = [
  { key: 'all', label: '🗂 ყველა' },
  { key: 'bulk', label: '🧪 ნ/ფაბრიკატი' },
  { key: 'portion', label: '🍽️ 1 ულუფა' },
]

export default function ListPage() {
  const [calcs, setCalcs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('calculations')
      .select('*')
      .order('created_at', { ascending: false })
    setCalcs(data || [])
    setLoading(false)
  }

  const displayed = calcs
    .filter(c => filter === 'all' || c.type === filter)
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.category || '').toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={s.page}>
      <input
        style={s.searchBox}
        placeholder="🔍 ძიება სახელი / კატეგორია..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div style={s.filterRow}>
        {FILTERS.map(f => (
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
        <div style={s.loadingWrap}><div style={s.spinner} /></div>
      ) : displayed.length === 0 ? (
        <div style={s.empty}>
          <div style={s.emptyIcon}>{search ? '🔍' : '📋'}</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
            {search ? 'ვერ მოიძებნა' : 'ჩანაწერი არ არის'}
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.7 }}>
            {search ? 'სხვა საძიებო სიტყვა სცადეთ' : 'დაამატეთ პირველი კალკულაცია ⬆️'}
          </div>
        </div>
      ) : (
        displayed.map(c => {
          const isBulk = c.type === 'bulk'
          const date = new Date(c.created_at).toLocaleDateString('ka-GE')
          const barColor = isBulk ? 'var(--blue)' : 'var(--green)'
          const badgeStyle = isBulk
            ? { ...s.badge, background: 'var(--blue-dim)', color: 'var(--blue)', border: '1px solid rgba(74,144,224,0.3)' }
            : { ...s.badge, background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid rgba(74,184,106,0.3)' }

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

      {selected && <DetailModal calc={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
