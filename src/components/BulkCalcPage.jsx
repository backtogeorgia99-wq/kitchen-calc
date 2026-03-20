import { useState } from 'react'
import { supabase } from '../lib/supabase'
import IngredientTable from './IngredientTable'
import { showToast } from './Toast'

const CATEGORIES = ['სოუსი', 'ბულიონი', 'ცომი', 'მარინადი', 'მაიონეზი', 'გამდნარი ცხიმი', 'სხვა']
const UNITS = ['გ', 'მლ', 'ც', 'კგ', 'ლ']

function calcTotal(ingredients) {
  return ingredients.reduce((sum, r) => {
    const qty = parseFloat(r.qty) || 0
    const price = parseFloat(r.price) || 0
    return sum + (qty / 1000) * price
  }, 0)
}

const s = {
  page: { padding: '14px 14px 48px', animation: 'fadeIn 0.2s ease' },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '14px 14px',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 13, fontWeight: 700,
    color: 'var(--accent)', marginBottom: 14,
    display: 'flex', alignItems: 'center', gap: 7,
  },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 },
  row3: { display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 10, marginBottom: 10 },
  group: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 11, color: 'var(--text2)', fontWeight: 600 },
  input: {
    padding: '10px 12px',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text)', fontSize: 13, outline: 'none',
  },
  select: {
    padding: '10px 12px',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text)', fontSize: 13, outline: 'none',
    width: '100%',
  },
  summaryBox: {
    background: 'var(--accent-dim)',
    border: '1px solid rgba(232,150,15,0.22)',
    borderRadius: 'var(--radius)',
    padding: '14px',
    marginBottom: 12,
  },
  summaryRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '6px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    fontSize: 13,
  },
  summaryLabel: { color: 'var(--text2)' },
  summaryVal: { fontWeight: 700, color: 'var(--accent)' },
  summaryValBig: { fontWeight: 800, color: 'var(--accent)', fontSize: 18 },
  actionRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 },
  btnSave: {
    padding: '13px', background: 'var(--accent)',
    color: '#000', border: 'none',
    borderRadius: 'var(--radius)',
    fontSize: 14, fontWeight: 700, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  btnClear: {
    padding: '13px', background: 'transparent',
    color: 'var(--text2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  spinner: {
    width: 16, height: 16,
    border: '2px solid rgba(0,0,0,0.25)',
    borderTopColor: '#000',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  },
}

const empty = () => ({ name: '', qty: '', price: '' })

export default function BulkCalcPage() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [servings, setServings] = useState('')
  const [yieldAmt, setYieldAmt] = useState('')
  const [yieldUnit, setYieldUnit] = useState('გ')
  const [ingredients, setIngredients] = useState([empty()])
  const [loading, setLoading] = useState(false)

  const total = calcTotal(ingredients)
  const srv = parseFloat(servings) || 0
  const yld = parseFloat(yieldAmt) || 0
  const perServing = srv > 0 ? total / srv : 0
  const perUnit = yld > 0 ? total / yld : 0

  const clear = () => {
    setName(''); setCategory(CATEGORIES[0]); setServings(''); setYieldAmt('')
    setYieldUnit('გ'); setIngredients([empty()])
  }

  const save = async () => {
    if (!name.trim()) { showToast('სახელი სავალდებულოა', 'error'); return }
    if (srv <= 0) { showToast('ულუფების რაოდენობა სავალდებულოა', 'error'); return }
    const filled = ingredients.filter(r => r.name.trim())
    if (!filled.length) { showToast('დაამატეთ ინგრედიენტი', 'error'); return }

    setLoading(true)
    const rows = filled.map(r => ({
      name: r.name.trim(),
      qty_g: parseFloat(r.qty) || 0,
      price_per_kg: parseFloat(r.price) || 0,
      cost: ((parseFloat(r.qty) || 0) / 1000) * (parseFloat(r.price) || 0),
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

        <div style={{ ...s.row, gridTemplateColumns: '1fr' }}>
          <div style={s.group}>
            <label style={s.label}>სახელი *</label>
            <input style={s.input} value={name} onChange={e => setName(e.target.value)} placeholder="მაგ: ქათმის ბულიონი 50 ულუფაზე" />
          </div>
        </div>

        <div style={s.row}>
          <div style={s.group}>
            <label style={s.label}>კატეგორია</label>
            <select style={s.select} value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={s.group}>
            <label style={s.label}>ულუფების რაოდ. *</label>
            <input style={s.input} type="number" min="1" value={servings} onChange={e => setServings(e.target.value)} placeholder="მაგ: 50" />
          </div>
        </div>

        <div style={s.row3}>
          <div style={s.group}>
            <label style={s.label}>გამოსავლიანობა</label>
            <input style={s.input} type="number" min="0" value={yieldAmt} onChange={e => setYieldAmt(e.target.value)} placeholder="0" />
          </div>
          <div style={s.group}>
            <label style={s.label}>ერთეული</label>
            <select style={s.select} value={yieldUnit} onChange={e => setYieldUnit(e.target.value)}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div style={s.group}>
            <label style={s.label}>1 ულუფა</label>
            <input
              style={{ ...s.input, color: 'var(--accent)', fontWeight: 700 }}
              readOnly
              value={srv > 0 && yld > 0 ? `${(yld / srv).toFixed(1)}${yieldUnit}` : '—'}
            />
          </div>
        </div>
      </div>

      <div style={s.card}>
        <div style={s.cardTitle}>🥩 ინგრედიენტები</div>
        <IngredientTable ingredients={ingredients} onChange={setIngredients} />
      </div>

      <div style={s.summaryBox}>
        <div style={{ ...s.summaryRow }}>
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
          {loading ? <span style={s.spinner} /> : '💾'} შენახვა
        </button>
      </div>
    </div>
  )
}
