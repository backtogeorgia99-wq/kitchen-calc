import { useState, useEffect } from 'react'
import { supabase, canEdit } from '../lib/supabase'
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'calculations' }, () => load())
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

  return (
    <div style={{ padding: '16px 16px 48px', animation: 'fadeUp 0.3s ease' }}>

      {/* SEARCH */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <div style={{
          position: 'absolute', left: 14, top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 14, color: isDark ? '#5e5045' : '#b0a090',
          pointerEvents: 'none',
        }}>🔍</div>
        <input
          placeholder="ძიება..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '12px 14px 12px 38px',
            background: isDark ? '#1e1e1e' : '#ffffff',
            border: `1.5px solid ${isDark ? '#2a2a2a' : '#ede8e0'}`,
            borderRadius: 14,
            color: isDark ? '#f2ede6' : '#1a1410',
            fontSize: 13, outline: 'none',
            fontFamily: "'Noto Sans Georgian', sans-serif",
            boxShadow: isDark
              ? '0 4px 20px rgba(0,0,0,0.3)'
              : '0 4px 20px rgba(0,0,0,0.06)',
          }}
        />
      </div>

      {/* FILTERS */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 2 }}>
        {[
          { key: 'all', label: '🗂 ყველა' },
          { key: 'bulk', label: '🧪 ნ/ფაბრიკატი' },
          { key: 'portion', label: '🍽️ 1 ულუფა' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            whiteSpace: 'nowrap', padding: '8px 16px',
            background: filter === f.key
              ? '#e8960f'
              : (isDark ? '#1e1e1e' : '#ffffff'),
            border: `1.5px solid ${filter === f.key ? '#e8960f' : (isDark ? '#2a2a2a' : '#ede8e0')}`,
            borderRadius: 20,
            color: filter === f.key ? '#000' : (isDark ? '#9e9080' : '#7a6a55'),
            fontSize: 12, fontWeight: filter === f.key ? 800 : 500,
            cursor: 'pointer', flexShrink: 0,
            fontFamily: "'Noto Sans Georgian', sans-serif",
            boxShadow: filter === f.key ? '0 4px 12px rgba(232,150,15,0.3)' : 'none',
            transition: 'all 0.2s',
          }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* LIST */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <div style={{
            width: 32, height: 32,
            border: `3px solid ${isDark ? '#2a2a2a' : '#ede8e0'}`,
            borderTopColor: '#e8960f',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '56px 24px' }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>{search ? '🔍' : '📋'}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: isDark ? '#f2ede6' : '#1a1410', marginBottom: 6 }}>
            {search ? 'ვერ მოიძებნა' : 'ჩანაწერი არ არის'}
          </div>
          <div style={{ fontSize: 12, color: isDark ? '#5e5045' : '#b0a090' }}>
            {search ? 'სხვა სიტყვა სცადეთ' : 'დაამატეთ პირველი კალკულაცია'}
          </div>
        </div>
      ) : displayed.map((c, i) => {
        const isBulk = c.type === 'bulk'
        const date = new Date(c.created_at).toLocaleDateString('ka-GE')
        const accentColor = isBulk ? '#2d6fe0' : '#2d9e5f'

        return (
          <div key={c.id} onClick={() => setSelected(c)} style={{
            background: isDark ? '#1e1e1e' : '#ffffff',
            borderRadius: 18,
            boxShadow: isDark
              ? '0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)'
              : '0 4px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
            padding: '14px 16px',
            marginBottom: 10, cursor: 'pointer',
            position: 'relative', overflow: 'hidden',
            animation: `fadeUp 0.3s ease ${i * 0.04}s both`,
            transition: 'transform 0.15s',
          }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: 4, background: accentColor,
              borderRadius: '4px 0 0 4px',
            }} />
            <div style={{ paddingLeft: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: isDark ? '#f2ede6' : '#1a1410', letterSpacing: '-0.01em' }}>
                  {c.name}
                </div>
                <span style={{
                  fontSize: 10, padding: '3px 9px',
                  borderRadius: 20, fontWeight: 700,
                  background: isBulk
                    ? (isDark ? 'rgba(45,111,224,0.15)' : 'rgba(45,111,224,0.1)')
                    : (isDark ? 'rgba(45,158,95,0.15)' : 'rgba(45,158,95,0.1)'),
                  color: accentColor,
                  border: `1px solid ${isBulk ? 'rgba(45,111,224,0.25)' : 'rgba(45,158,95,0.25)'}`,
                }}>
                  {isBulk ? 'ნ/ფაბრ.' : '1 ულ.'}
                </span>
              </div>
              <div style={{ fontSize: 12, color: isDark ? '#5e5045' : '#b0a090', marginBottom: 8 }}>
                {c.category}
                {isBulk && c.servings ? ` · ${c.servings} ულუფა` : ''}
                {c.yield_amount ? ` · ${c.yield_amount}${c.yield_unit}` : ''}
                {c.created_by ? ` · ${c.created_by}` : ''}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#e8960f', letterSpacing: '-0.02em' }}>
                  ₾ {parseFloat(c.total_cost || 0).toFixed(2)}
                </span>
                <span style={{ fontSize: 11, color: isDark ? '#3a3a3a' : '#d0c8bc' }}>{date}</span>
              </div>
            </div>
          </div>
        )
      })}

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