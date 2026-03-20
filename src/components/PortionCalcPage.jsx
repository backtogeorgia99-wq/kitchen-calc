import { useState } from 'react'
import { supabase } from '../lib/supabase'
import IngredientTable from './IngredientTable'
import { showToast } from './Toast'

const CATEGORIES = ['პირველი კერძი', 'მეორე კერძი', 'სალათი', 'დესერტი', 'სასმელი', 'გარნირი', 'სხვა']

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
    padding: '14px',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 13, fontWeight: 700,
    color: 'var(--green)', marginBottom: 14,
    display: 'flex', alignItems: 'center', gap: 7,
  },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 },
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
  textarea: {
    padding: '10px 12px',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text)', fontSize: 13, outline: 'none',
    resize: 'none', height: 72, width: '100%',
  },
  summaryBox: {
    background: 'var(--green-dim)',
    border: '1px solid rgba(74,184,106,0.22)',
    borderRadius: 'var(--radius)',
    padding: '14px', marginBottom: 12,
  },
  summaryRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '6px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    fontSize: 13,
  },
  summaryLabel: { color: 'var(--text2)' },
  summaryVal: { fontWeight: 700, color: 'var(--green)' },
  summaryValBig: { fontWeight: 800, color: 'var(--green)', fontSize: 20 },
  actionRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 },
  btnSave: {
    padding: '13px',
    background: 'var(--green)',
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

export default function PortionCalcPage() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [weight, setWeight] = useState('')
  const [note, setNote] = useState('')
  const [ingredients, setIngredients] = useState([empty()])
  const [loading, setLoading] = useState(false)

  const total = calcTotal(ingredients)

  const clear = () => {
    setName(''); setCategory(CATEGORIES[0]); setWeight('')
    setNote(''); setIngredients([empty()])
  }

  const save = async () => {
    if (!name.trim()) { showToast('სახელი სავალდებულოა', 'error'); return }
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
      type: 'portion',
      name: name.trim(),
      category,
      servings: 1,
      yield_amount: parseFloat(weight) || null,
      yield_unit: 'გ',
      ingredients: rows,
      total_cost: parseFloat(total.toFixed(4)),
      cost_per_serving: parseFloat(total.toFixed(4)),
      note: note.trim() || null,
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
        <div style={s.cardTitle}>🍽️ 1 ულუფის კალკულაცია</div>

        <div style={{ ...s.row, gridTemplateColumns: '1fr' }}>
          <div style={s.group}>
            <label style={s.label}>კერძის სახელი *</label>
            <input style={s.input} value={name} onChange={e => setName(e.target.value)} placeholder="მაგ: ხინკალი" />
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
            <label style={s.label}>ულუფის წონა (გ)</label>
            <input style={s.input} type="number" min="0" value={weight} onChange={e => setWeight(e.target.value)} placeholder="0" />
          </div>
        </div>
      </div>

      <div style={s.card}>
        <div style={s.cardTitle}>🥩 ინგრედიენტები (1 ულუფა)</div>
        <IngredientTable ingredients={ingredients} onChange={setIngredients} />
      </div>

      <div style={s.card}>
        <div style={{ ...s.cardTitle, color: 'var(--text2)' }}>📝 შენიშვნა</div>
        <textarea
          style={s.textarea}
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="დამზადების წესი, მიწოდების სპეციფიკა..."
        />
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
          {loading ? <span style={s.spinner} /> : '💾'} შენახვა
        </button>
      </div>
    </div>
  )
}
