import { useState, useEffect, useMemo } from 'react'
import { supabase, canEdit } from '../lib/supabase'
import { useAppSettings, formatMoney, displaySellingPrice } from '../lib/formatMoney'
import { exportCalculationsCsv, exportCalculationsXlsx, printCalculationsReport } from '../lib/exportCalculations'
import { logAudit } from '../lib/auditLog'
import DetailModal from './DetailModal'
import BulkFabLogo from './BulkFabLogo'
import { showToast } from './Toast'

function ListSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <div
          key={i}
          style={{
            height: 88,
            borderRadius: 18,
            background: 'var(--surface)',
            border: '1px solid var(--border-card)',
            animation: 'pulse 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.08}s`,
          }}
        />
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:0.45} 50%{opacity:0.9} }`}</style>
    </div>
  )
}

export default function ListPage({ user, theme }) {
  const [calcs, setCalcs] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selected, setSelected] = useState(null)

  const isDark = theme === 'dark'
  const settings = useAppSettings()

  const load = async () => {
    setLoading(true)
    setLoadError(null)
    const { data, error } = await supabase
      .from('calculations')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      setLoadError(error.message)
      setCalcs([])
    } else {
      setCalcs(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    const channel = supabase
      .channel('calculations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'calculations' }, () => load())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const categories = useMemo(() => {
    const s = new Set()
    calcs.forEach(c => { if (c.category && String(c.category).trim()) s.add(c.category.trim()) })
    return [...s].sort((a, b) => a.localeCompare(b, 'ka'))
  }, [calcs])

  const startOfDay = (d) => {
    const x = new Date(d)
    x.setHours(0, 0, 0, 0)
    return x.getTime()
  }
  const endOfDay = (d) => {
    const x = new Date(d)
    x.setHours(23, 59, 59, 999)
    return x.getTime()
  }

  const displayed = useMemo(() => {
    const q = search.trim().toLowerCase()
    return calcs
      .filter(c => filter === 'all' || c.type === filter)
      .filter(c => {
        if (!q) return true
        const inName = (c.name || '').toLowerCase().includes(q)
        const inCat = (c.category || '').toLowerCase().includes(q)
        const inNote = (c.note || '').toLowerCase().includes(q)
        const inCreated = (c.created_by || '').toLowerCase().includes(q)
        return inName || inCat || inNote || inCreated
      })
      .filter(c => {
        if (!categoryFilter) return true
        return (c.category || '').trim() === categoryFilter
      })
      .filter(c => {
        const t = c.created_at ? new Date(c.created_at).getTime() : 0
        if (dateFrom) {
          if (t < startOfDay(dateFrom)) return false
        }
        if (dateTo) {
          if (t > endOfDay(dateTo)) return false
        }
        return true
      })
  }, [calcs, filter, search, categoryFilter, dateFrom, dateTo])

  const deleteCalc = async (id) => {
    if (!window.confirm('წაშალოს?')) return
    const row = calcs.find(c => c.id === id)
    await supabase.from('calculations').delete().eq('id', id)
    await logAudit(user, 'delete', 'calculation', id, { name: row?.name })
    setSelected(null)
    load()
  }

  const doExport = (kind) => {
    if (!displayed.length) { showToast('ექსპორტისთვის ჩანაწერი არ არის', 'error'); return }
    try {
      if (kind === 'csv') exportCalculationsCsv(displayed, settings)
      else if (kind === 'xlsx') exportCalculationsXlsx(displayed, settings)
      else printCalculationsReport(displayed, settings)
      logAudit(user, `export_${kind}`, 'calculations', null, { count: displayed.length })
      showToast('✅ ექსპორტი')
    } catch (e) {
      showToast(String(e.message || e), 'error')
    }
  }

  return (
    <div style={{ padding: '16px 16px 48px', animation: 'fadeUp 0.3s ease' }}>

      {/* SEARCH */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <div style={{
          position: 'absolute', left: 14, top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 14, color: 'var(--text-muted)',
          pointerEvents: 'none',
        }}>🔍</div>
        <input
          placeholder="ძიება (სახელი, კატეგორია, შენიშვნა, ავტორი)..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '12px 14px 12px 38px',
            background: 'var(--input-fill)',
            border: '1.5px solid var(--input-border)',
            borderRadius: 16,
            color: 'var(--text)',
            fontSize: 13, outline: 'none',
            fontFamily: "'Noto Sans Georgian', sans-serif",
            boxShadow: 'var(--shadow-sm)',
          }}
        />
      </div>

      {/* DATE + CATEGORY */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        marginBottom: 10,
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>დან თარიღი</div>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px',
              background: 'var(--input-fill)',
              border: '1.5px solid var(--input-border)',
              borderRadius: 12,
              color: 'var(--text)',
              fontSize: 12,
              fontFamily: "'Noto Sans Georgian', sans-serif",
            }}
          />
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>მდე თარიღი</div>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px',
              background: 'var(--input-fill)',
              border: '1.5px solid var(--input-border)',
              borderRadius: 12,
              color: 'var(--text)',
              fontSize: 12,
              fontFamily: "'Noto Sans Georgian', sans-serif",
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>კატეგორია</div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          style={{
            width: '100%', padding: '10px 12px',
            background: 'var(--input-fill)',
            border: '1.5px solid var(--input-border)',
            borderRadius: 12,
            color: 'var(--text)',
            fontSize: 13,
            fontFamily: "'Noto Sans Georgian', sans-serif",
          }}
        >
          <option value="">ყველა კატეგორია</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* TYPE FILTERS */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, overflowX: 'auto', paddingBottom: 2 }}>
        {[
          { key: 'all', label: '🗂 ყველა', bulk: false },
          { key: 'bulk', label: 'ნ/ფაბრიკატი', bulk: true },
          { key: 'portion', label: '🍽️ 1 ულუფა', bulk: false },
        ].map(f => (
          <button key={f.key} type="button" onClick={() => setFilter(f.key)} style={{
            whiteSpace: 'nowrap', padding: '9px 16px',
            background: filter === f.key
              ? 'var(--accent-gradient)'
              : 'var(--surface)',
            border: `1px solid ${filter === f.key ? 'var(--border-accent)' : 'var(--border-card)'}`,
            borderRadius: 22,
            color: filter === f.key ? '#1a1410' : 'var(--text2)',
            fontSize: 11, fontWeight: filter === f.key ? 800 : 600,
            letterSpacing: '0.04em',
            cursor: 'pointer', flexShrink: 0,
            fontFamily: "'Noto Sans Georgian', sans-serif",
            boxShadow: filter === f.key ? '0 4px 16px var(--accent-glow)' : 'var(--shadow-sm)',
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {f.bulk && <BulkFabLogo size={20} dimmed={filter !== f.key} />}
            {f.label}
          </button>
        ))}
      </div>

      {/* EXPORT */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16,
        padding: 14,
        borderRadius: 18,
        background: 'var(--accent-dim)',
        border: '1px solid var(--border-accent)',
      }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent-bright)', width: '100%', marginBottom: 4 }}>ექსპორტი (ფილტრის მიხედვით)</span>
        {[
          { k: 'csv', t: '📄 CSV' },
          { k: 'xlsx', t: '📊 Excel' },
          { k: 'pdf', t: '🖨 PDF / ბეჭდვა' },
        ].map(x => (
          <button
            key={x.k}
            type="button"
            onClick={() => doExport(x.k)}
            style={{
              padding: '8px 12px',
              background: isDark ? '#242424' : '#fff',
              border: `1.5px solid ${isDark ? '#3a3a3a' : '#ede8e0'}`,
              borderRadius: 10,
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              color: isDark ? '#f2ede6' : '#1a1410',
              fontFamily: "'Noto Sans Georgian', sans-serif",
            }}
          >
            {x.t}
          </button>
        ))}
      </div>

      {/* LIST */}
      {loading ? (
        <ListSkeleton />
      ) : loadError ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: isDark ? '#f2ede6' : '#1a1410', marginBottom: 8 }}>
            ჩატვირთვა ვერ მოხერხდა
          </div>
          <div style={{ fontSize: 12, color: isDark ? '#9e9080' : '#7a6a55', marginBottom: 16 }}>{loadError}</div>
          <button
            type="button"
            onClick={load}
            style={{
              padding: '10px 20px',
              background: 'var(--accent-gradient)',
              color: '#000',
              border: 'none',
              borderRadius: 12,
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: "'Noto Sans Georgian', sans-serif",
            }}
          >
            ხელახლა ცდა
          </button>
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '56px 24px' }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>{search || categoryFilter || dateFrom || dateTo ? '🔍' : '📋'}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: isDark ? '#f2ede6' : '#1a1410', marginBottom: 6 }}>
            {search || categoryFilter || dateFrom || dateTo ? 'ვერ მოიძებნა' : 'ჩანაწერი არ არის'}
          </div>
          <div style={{ fontSize: 12, color: isDark ? '#5e5045' : '#b0a090' }}>
            ფილტრები შეცვალეთ ან დაამატეთ კალკულაცია
          </div>
        </div>
      ) : displayed.map((c, i) => {
        const isBulk = c.type === 'bulk'
        const date = new Date(c.created_at).toLocaleDateString('ka-GE')
        const accentColor = isBulk ? 'var(--blue-bright)' : 'var(--green-bright)'
        const sell = displaySellingPrice(c.total_cost, settings)
        const showSell = (settings.markupPercent > 0 || settings.vatPercent > 0)

        return (
          <div key={c.id} onClick={() => setSelected(c)} style={{
            background: 'var(--surface-shine)',
            borderRadius: 22,
            border: '1px solid var(--border-card)',
            boxShadow: 'var(--shadow-card)',
            padding: '16px 18px',
            marginBottom: 12, cursor: 'pointer',
            position: 'relative', overflow: 'hidden',
            animation: `fadeUp 0.3s ease ${i * 0.04}s both`,
            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
          }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: 4, background: accentColor,
              borderRadius: '4px 0 0 4px',
            }} />
            <div style={{ paddingLeft: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 8 }}>
                <div style={{
                  fontSize: 15, fontWeight: 800, color: isDark ? '#f2ede6' : '#1a1410',
                  letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 8,
                  flex: 1, minWidth: 0,
                }}>
                  {isBulk && <BulkFabLogo size={28} />}
                  <span style={{ lineHeight: 1.25 }}>{c.name}</span>
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
                {isBulk && c.servings ? (
                  <> · <span style={{ color: 'var(--qty-red)', fontWeight: 800 }}>{c.servings} ულუფა</span></>
                ) : ''}
                {c.yield_amount ? (
                  <> · <span style={{ color: 'var(--qty-red)', fontWeight: 800 }}>{c.yield_amount}{c.yield_unit}</span></>
                ) : ''}
                {c.created_by ? ` · ${c.created_by}` : ''}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 6 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent-bright)', letterSpacing: '-0.02em' }}>
                    {formatMoney(c.total_cost, settings)}
                  </div>
                  {showSell && (
                    <div style={{ fontSize: 11, color: isDark ? '#6a5c50' : '#9a8a78', marginTop: 2 }}>
                      გასაყიდი: {formatMoney(sell, settings)}
                    </div>
                  )}
                </div>
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
          onChanged={load}
        />
      )}
    </div>
  )
}
