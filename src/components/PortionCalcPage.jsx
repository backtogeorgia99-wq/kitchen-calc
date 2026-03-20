import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import IngredientTable from './IngredientTable'
import { showToast } from './Toast'

const PORTION_UNITS = ['კგ', 'გ', 'ც', 'მლ', 'ლ']

function calcTotal(ingredients) {
  return ingredients.reduce((sum, r) => {
    const qty = parseFloat(r.qty) || 0
    const price = parseFloat(r.price) || 0
    return sum + qty * price
  }, 0)
}

const empty = () => ({ name: '', qty: '', price: '' })

export default function PortionCalcPage({ user, theme }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [weight, setWeight] = useState('')
  const [weightUnit, setWeightUnit] = useState('კგ')
  const [weightLocked, setWeightLocked] = useState(false)
  const [note, setNote] = useState('')
  const [ingredients, setIngredients] = useState([empty()])
  const [loading, setLoading] = useState(false)
  const [bulkList, setBulkList] = useState([])
  const [showBulkModal, setShowBulkModal] = useState(false)

  const isDark = theme === 'dark'
  const total = calcTotal(ingredients)

  useEffect(() => { loadBulkCalcs() }, [])

  const loadBulkCalcs = async () => {
    const { data } = await supabase
      .from('calculations')
      .select('*')
      .eq('type', 'bulk')
      .order('created_at', { ascending: false })
    setBulkList(data || [])
  }

  const insertBulk = (bulk) => {
    const perServing = bulk.ingredients.map(ing => ({
      name: ing.name,
      qty: bulk.servings > 0 ? (ing.qty_kg / bulk.servings).toFixed(4) : ing.qty_kg,
      price: ing.price_per_kg,
    }))
    setIngredients(prev => {
      const filtered = prev.filter(r => r.name.trim())
      return [...filtered, ...perServing]
    })
    if (bulk.yield_amount && bulk.servings > 0) {
      setWeight((bulk.yield_amount / bulk.servings).toFixed(4))
      setWeightUnit(bulk.yield_unit || 'კგ')
      setWeightLocked(true)
    }
    setShowBulkModal(false)
    showToast(`✅ "${bulk.name}" დაემატა`)
  }

  const clear = () => {
    setName(''); setCategory(''); setWeight('')
    setWeightUnit('კგ'); setWeightLocked(false)
    setNote(''); setIngredients([empty()])
  }

  const save = async () => {
    if (!name.trim()) { showToast('სახელი სავალდებულოა', 'error'); return }
    const filled = ingredients.filter(r => r.name.trim())
    if (!filled.length) { showToast('დაამატეთ ინგრედიენტი', 'error'); return }

    setLoading(true)
    const rows = filled.map(r => ({
      name: r.name.trim(),
      qty_kg: parseFloat(r.qty) || 0,
      price_per_kg: parseFloat(r.price) || 0,
      cost: (parseFloat(r.qty) || 0) * (parseFloat(r.price) || 0),
    }))

    const payload = {
      type: 'portion',
      name: name.trim(),
      category,
      servings: 1,
      yield_amount: parseFloat(weight) || null,
      yield_unit: weightUnit,
      ingredients: rows,
      total_cost: parseFloat(total.toFixed(4)),
      cost_per_serving: parseFloat(total.toFixed(4)),
      note: note.trim() || null,
      created_by: user?.name,
    }

    const { error } = await supabase.from('calculations').insert(payload)
    setLoading(false)
    if (error) { showToast('შეცდომა: ' + error.message, 'error'); return }
    showToast('✅ წარმატებით შეინახა!')
    clear()
  }

  const s = {
    page: { padding: '14px 14px 48px', animation: 'fadeIn 0.2s ease' },
    card: {
      background: isDark ? '#181818' : '#ffffff',
      border: `1px solid ${isDark ? '#2e2e2e' : '#e0d8cc'}`,
      borderRadius: 14, padding: '14px', marginBottom: 12,
    },
    cardTitle: {
      fontSize: 13, fontWeight: 700,
      color: '#4ab86a', marginBottom: 14,
    },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 },
    group: { display: 'flex', flexDirection: 'column', gap: 5 },
    label: { fontSize: 11, color: isDark ? '#9e9080' : '#7a6a55', fontWeight: 600 },
    input: {
      padding: '10px 12px',
      background: isDark ? '#202020' : '#f5f0e8',
      border: `1px solid ${isDark ? '#2e2e2e' : '#e0d8cc'}`,
      borderRadius: 9, color: isDark ? '#f2ede6' : '#2a1f0f',
      fontSize: 13, outline: 'none', width: '100%',
      fontFamily: "'Noto Sans Georgian', sans-serif",
    },
    select: {
      padding: '10px 12px',
      background: isDark ? '#202020' : '#f5f0e8',
      border: `1px solid ${isDark ? '#2e2e2e' : '#e0d8cc'}`,
      borderRadius: 9, color: isDark ? '#f2ede6' : '#2a1f0f',
      fontSize: 13, outline: 'none', width: '100%',
      fontFamily: "'Noto Sans Georgian', sans-serif",
    },
    textarea: {
      padding: '10px 12px',
      background: isDark ? '#202020' : '#f5f0e8',
      border: `1px solid ${isDark ? '#2e2e2e' : '#e0d8cc'}`,
      borderRadius: 9, color: isDark ? '#f2ede6' : '#2a1f0f',
      fontSize: 13, outline: 'none', resize: 'none',
      height: 72, width: '100%',
      fontFamily: "'Noto Sans Georgian', sans-serif",
    },
    summaryBox: {
      background: 'rgba(74,184,106,0.08)',
      border: '1px solid rgba(74,184,106,0.22)',
      borderRadius: 14, padding: '14px', marginBottom: 12,
    },
    summaryRow: {
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', padding: '6px 0',
      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`,
      fontSize: 13,
    },
    summaryLabel: { color: isDark ? '#9e9080' : '#7a6a55' },
    summaryVal: { fontWeight: 700, color: '#4ab86a' },
    summaryValBig: { fontWeight: 800, color: '#4ab86a', fontSize: 20 },
    actionRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 },
    btnSave: {
      padding: '13px', background: '#4ab86a',
      color: '#000', border: 'none', borderRadius: 14,
      fontSize: 14, fontWeight: 700, cursor: 'pointer',
      fontFamily: "'Noto Sans Georgian', sans-serif",
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    },
    btnClear: {
      padding: '13px', background: 'transparent',
      color: isDark ? '#9e9080' : '#7a6a55',
      border: `1px solid ${isDark ? '#2e2e2e' : '#e0d8cc'}`,
      borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: 'pointer',
      fontFamily: "'Noto Sans Georgian', sans-serif",
    },
    btnBulk: {
      width: '100%', padding: '10px',
      background: 'rgba(74,144,224,0.08)',
      border: '1px solid rgba(74,144,224,0.3)',
      borderRadius: 9, color: '#4a90e0',
      fontSize: 12, fontWeight: 600, cursor: 'pointer',
      marginBottom: 10,
      fontFamily: "'Noto Sans Georgian', sans-serif",
    },
    modalOverlay: {
      position: 'fixed', inset: 0, zIndex: 80,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'flex-end',
    },
    modalSheet: {
      background: isDark ? '#181818' : '#ffffff',
      borderRadius: '14px 14px 0 0',
      padding: '20px 16px 48px',
      width: '100%', maxHeight: '70vh',
      overflowY: 'auto',
    },
    modalTitle: {
      fontSize: 15, fontWeight: 700,
      color: isDark ? '#f2ede6' : '#2a1f0f',
      marginBottom: 14,
    },
    bulkItem: {
      padding: '12px',
      background: isDark ? '#202020' : '#f5f0e8',
      border: `1px solid ${isDark ? '#2e2e2e' : '#e0d8cc'}`,
      borderRadius: 9, marginBottom: 8,
      cursor: 'pointer',
    },
    bulkItemName: {
      fontSize: 14, fontWeight: 700,
      color: isDark ? '#f2ede6' : '#2a1f0f',
      marginBottom: 4,
    },
    bulkItemMeta: {
      fontSize: 12,
      color: isDark ? '#9e9080' : '#7a6a55',
    },
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.cardTitle}>🍽️ 1 ულუფის კალკულაცია</div>

        <div style={{ marginBottom: 10 }}>
          <div style={s.group}>
            <label style={s.label}>კერძის სახელი *</label>
            <input style={s.input} value={name} onChange={e => setName(e.target.value)} placeholder="მაგ: ხინკალი" />
          </div>
        </div>

        <div style={s.row}>
          <div style={s.group}>
            <label style={s.label}>კატეგორია</label>
            <input style={s.input} value={category} onChange={e => setCategory(e.target.value)} placeholder="მაგ: მეორე კერძი" />
          </div>
          <div style={s.group}>
            <label style={s.label}>
              ულუფის წონა {weightLocked && <span style={{ color: '#e8960f' }}>🔒</span>}
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                style={{
                  ...s.input,
                  color: weightLocked ? '#e8960f' : (isDark ? '#f2ede6' : '#2a1f0f'),
                  fontWeight: weightLocked ? 700 : 400,
                  opacity: weightLocked ? 0.85 : 1,
                }}
                type="number" min="0" step="0.001"
                value={weight}
                onChange={e => !weightLocked && setWeight(e.target.value)}
                placeholder="0.000"
                readOnly={weightLocked}
              />
              <select
                style={{ ...s.select, width: 70, flexShrink: 0, opacity: weightLocked ? 0.6 : 1 }}
                value={weightUnit}
                onChange={e => !weightLocked && setWeightUnit(e.target.value)}
                disabled={weightLocked}
              >
                {PORTION_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div style={s.card}>
        <div style={s.cardTitle}>🥩 ინგრედიენტები (1 ულუფა)</div>
        <button style={s.btnBulk} onClick={() => setShowBulkModal(true)}>
          🧪 + ნახევრადფაბრიკატიდან ჩასმა
        </button>
        <IngredientTable ingredients={ingredients} onChange={setIngredients} theme={theme} />
      </div>

      <div style={s.card}>
        <div style={{ ...s.cardTitle, color: isDark ? '#9e9080' : '#7a6a55' }}>📝 შენიშვნა</div>
        <textarea style={s.textarea} value={note} onChange={e => setNote(e.target.value)} placeholder="დამზადების წესი..." />
      </div>

      <div style={s.summaryBox}>
        <div style={s.summaryRow}>
          <span style={s.summaryLabel}>ინგრედიენტების ღირებულება</span>
          <span style={s.summaryVal}>₾ {total.toFixed(2)}</span>
        </div>
        <div style={{ ...s.summaryRow, borderBottom: 'none' }}>
          <span style={s.summaryLabel}>1 ულუფის ღირებულება</span>
          <span style={s.summaryValBig}>₾ {total.toFixed(2)}</span>
        </div>
      </div>

      <div style={s.actionRow}>
        <button style={s.btnClear} onClick={clear}>🗑️ გასუფთავება</button>
        <button style={s.btnSave} onClick={save} disabled={loading}>
          {loading ? '...' : '💾 შენახვა'}
        </button>
      </div>

      {showBulkModal && (
        <div style={s.modalOverlay} onClick={e => e.target === e.currentTarget && setShowBulkModal(false)}>
          <div style={s.modalSheet}>
            <div style={{ width: 40, height: 4, background: '#3a3a3a', borderRadius: 2, margin: '0 auto 16px' }} />
            <div style={s.modalTitle}>🧪 ნახევრადფაბრიკატის არჩევა</div>
            {bulkList.length === 0 ? (
              <div style={{ textAlign: 'center', color: isDark ? '#5e5045' : '#a09080', padding: 24 }}>
                ნახევრადფაბრიკატი არ მოიძებნა
              </div>
            ) : bulkList.map(b => (
              <div key={b.id} style={s.bulkItem} onClick={() => insertBulk(b)}>
                <div style={s.bulkItemName}>{b.name}</div>
                <div style={s.bulkItemMeta}>
                  {b.servings} ულუფა · ₾{parseFloat(b.cost_per_serving || 0).toFixed(2)}/ულუფა
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}