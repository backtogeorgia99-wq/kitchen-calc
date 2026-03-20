import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import IngredientTable from './IngredientTable'
import { showToast } from './Toast'

const UNITS = ['კგ', 'გ', 'ც', 'მლ', 'ლ']

function calcTotal(ingredients) {
  return ingredients.reduce((sum, r) => {
    const qty = parseFloat(r.qty) || 0
    const price = parseFloat(r.price) || 0
    return sum + qty * price
  }, 0)
}

const empty = () => ({ name: '', qty: '', price: '' })

export default function BulkCalcPage({ user, theme }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [servings, setServings] = useState('')
  const [portionWeight, setPortionWeight] = useState('')
  const [yieldAmt, setYieldAmt] = useState('')
  const [yieldUnit, setYieldUnit] = useState('კგ')
  const [ingredients, setIngredients] = useState([empty()])
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])

  const total = calcTotal(ingredients)
  const srv = parseFloat(servings) || 0
  const yld = parseFloat(yieldAmt) || 0
  const perServing = srv > 0 ? total / srv : 0
  const perUnit = yld > 0 ? total / yld : 0
  const isDark = theme === 'dark'

  useEffect(() => {
    supabase.from('categories').select('*').eq('type', 'bulk').order('name')
      .then(({ data }) => setCategories(data || []))
  }, [])

  const s = {
    page: { padding: '14px 14px 48px', animation: 'fadeIn 0.2s ease' },
    card: {
      background: isDark ? '#181818' : '#ffffff',
      border: `1px solid ${isDark ? '#2e2e2e' : '#e0d8cc'}`,
      borderRadius: 14, padding: '14px', marginBottom: 12,
    },
    cardTitle: {
      fontSize: 13, fontWeight: 700,
      color: '#e8960f', marginBottom: 14,
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
    summaryBox: {
      background: 'rgba(232,150,15,0.08)',
      border: '1px solid rgba(232,150,15,0.22)',
      borderRadius: 14, padding: '14px', marginBottom: 12,
    },
    summaryRow: {
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', padding: '6px 0',
      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`,
      fontSize: 13,
    },
    summaryLabel: { color: isDark ? '#9e9080' : '#7a6a55' },
    summaryVal: { fontWeight: 700, color: '#e8960f' },
    summaryValBig: { fontWeight: 800, color: '#e8960f', fontSize: 18 },
    actionRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 },
    btnSave: {
      padding: '13px', background: '#e8960f',
      color: '#000', border: 'none', borderRadius: 14,
      fontSize: 14, fontWeight: 700, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      fontFamily: "'Noto Sans Georgian', sans-serif",
    },
    btnClear: {
      padding: '13px', background: 'transparent',
      color: isDark ? '#9e9080' : '#7a6a55',
      border: `1px solid ${isDark ? '#2e2e2e' : '#e0d8cc'}`,
      borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: 'pointer',
      fontFamily: "'Noto Sans Georgian', sans-serif",
    },
  }

  const clear = () => {
    setName(''); setCategory(''); setServings('')
    setPortionWeight(''); setYieldAmt('')
    setYieldUnit('კგ'); setIngredients([empty()])
  }

  const save = async () => {
    if (!name.trim()) { showToast('სახელი სავალდებულოა', 'error'); return }
    if (srv <= 0) { showToast('ულუფების რაოდენობა სავალდებულოა', 'error'); return }
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
      type: 'bulk',
      name: name.trim(),
      category,
      servings: srv,
      yield_amount: yld || null,
      yield_unit: yieldUnit,
      ingredients: rows,
      total_cost: parseFloat(total.toFixed(4)),
      cost_per_serving: parseFloat(perServing.toFixed(4)),
      cost_per_unit: yld > 0 ? parseFloat(perUnit.toFixed(6)) : null,
      created_by: user?.name,
    }

    const { error } = await supabase.from('calculations').insert(payload)
    setLoading(false)
    if (error) { showToast('შეცდომა: ' + error.message, 'error'); return }
    showToast('✅ წარმატებით შეინახა!')
    clear()
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.cardTitle}>🧪 ნახევრადფაბრიკატი — N ულუფა</div>

        <div style={{ marginBottom: 10 }}>
          <div style={s.group}>
            <label style={s.label}>სახელი *</label>
            <input
              style={s.input}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="მაგ: ქათმის ბულიონი"
            />
          </div>
        </div>

        <div style={s.row}>
          <div style={s.group}>
            <label style={s.label}>კატეგორია</label>
            <select style={s.select} value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">-- აირჩიეთ --</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div style={s.group}>
            <label style={s.label}>ულუფების რაოდ.</label>
            <input
              style={{ ...s.input, color: servings ? '#e8960f' : (isDark ? '#f2ede6' : '#2a1f0f'), fontWeight: servings ? 700 : 400 }}
              type="number" min="1"
              value={servings}
              onChange={e => {
                setServings(e.target.value)
                const sv = parseFloat(e.target.value)
                const ya = parseFloat(yieldAmt)
                if (sv > 0 && ya > 0) setPortionWeight((ya / sv).toFixed(3))
              }}
              placeholder="ავტომატური"
            />
          </div>
        </div>

        <div style={s.row}>
          <div style={s.group}>
            <label style={s.label}>გამოსავლიანობა</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                style={s.input}
                type="number" min="0" step="0.001"
                value={yieldAmt}
                onChange={e => {
                  setYieldAmt(e.target.value)
                  const ya = parseFloat(e.target.value)
                  const pw = parseFloat(portionWeight)
                  const sv = parseFloat(servings)
                  if (ya > 0 && pw > 0) setServings(String(Math.round(ya / pw)))
                  else if (ya > 0 && sv > 0) setPortionWeight((ya / sv).toFixed(3))
                }}
                placeholder="0.000"
              />
              <select
                style={{ ...s.select, width: 70, flexShrink: 0 }}
                value={yieldUnit}
                onChange={e => setYieldUnit(e.target.value)}
              >
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div style={s.group}>
            <label style={s.label}>1 ულუფის წონა</label>
            <input
              style={{ ...s.input, color: portionWeight ? '#e8960f' : (isDark ? '#f2ede6' : '#2a1f0f'), fontWeight: portionWeight ? 700 : 400 }}
              type="number" min="0" step="0.001"
              value={portionWeight}
              onChange={e => {
                setPortionWeight(e.target.value)
                const pw = parseFloat(e.target.value)
                const ya = parseFloat(yieldAmt)
                if (pw > 0 && ya > 0) setServings(String(Math.round(ya / pw)))
              }}
              placeholder="0.000"
            />
          </div>
        </div>
      </div>

      <div style={s.card}>
        <div style={s.cardTitle}>🥩 ინგრედიენტები (რაოდ. კგ-ში)</div>
        <IngredientTable ingredients={ingredients} onChange={setIngredients} theme={theme} />
      </div>

      <div style={s.summaryBox}>
        <div style={s.summaryRow}>
          <span style={s.summaryLabel}>ჯამური ღირებულება</span>
          <span style={s.summaryVal}>₾ {total.toFixed(2)}</span>
        </div>
        <div style={s.summaryRow}>
          <span style={s.summaryLabel}>1 ულუფის ღირებულება</span>
          <span style={s.summaryValBig}>₾ {perServing.toFixed(2)}</span>
        </div>
        {yld > 0 && (
          <div style={{ ...s.summaryRow, borderBottom: 'none' }}>
            <span style={s.summaryLabel}>1 {yieldUnit}-ს ღირებულება</span>
            <span style={s.summaryVal}>₾ {perUnit.toFixed(4)}</span>
          </div>
        )}
      </div>

      <div style={s.actionRow}>
        <button style={s.btnClear} onClick={clear}>🗑️ გასუფთავება</button>
        <button style={s.btnSave} onClick={save} disabled={loading}>
          {loading ? '...' : '💾 შენახვა'}
        </button>
      </div>
    </div>
  )
}