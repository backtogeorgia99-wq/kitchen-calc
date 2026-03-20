import { useRef } from 'react'

const s = {
  colHeaders: {
    display: 'grid',
    gridTemplateColumns: '1fr 72px 72px 36px',
    gap: 6, padding: '0 2px', marginBottom: 4,
  },
  colH: { fontSize: 10, color: 'var(--text3)', fontWeight: 600, textAlign: 'center' },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 72px 72px 36px',
    gap: 6, marginBottom: 6, alignItems: 'center',
  },
  input: {
    width: '100%', padding: '9px 10px',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text)', fontSize: 13,
    outline: 'none', transition: 'border-color 0.2s',
  },
  removeBtn: {
    width: 36, height: 36,
    background: 'var(--red-dim)',
    border: '1px solid rgba(224,80,80,0.25)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--red)', cursor: 'pointer',
    fontSize: 18, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  addBtn: {
    width: '100%', padding: '9px 0', marginTop: 4,
    background: 'transparent',
    border: '1px dashed var(--border2)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text2)', fontSize: 12,
    cursor: 'pointer', transition: 'all 0.2s',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 6,
  },
}

export default function IngredientTable({ ingredients, onChange }) {
  const update = (idx, field, val) => {
    const copy = ingredients.map((r, i) => i === idx ? { ...r, [field]: val } : r)
    onChange(copy)
  }

  const remove = (idx) => {
    if (ingredients.length <= 1) return
    onChange(ingredients.filter((_, i) => i !== idx))
  }

  const add = () => {
    onChange([...ingredients, { name: '', qty: '', price: '' }])
  }

  return (
    <div>
      <div style={s.colHeaders}>
        <div style={{ ...s.colH, textAlign: 'left' }}>ინგრედიენტი</div>
        <div style={s.colH}>რაოდ. (გ)</div>
        <div style={s.colH}>₾/კგ</div>
        <div style={s.colH}></div>
      </div>

      {ingredients.map((row, idx) => (
        <div key={idx} style={s.row}>
          <input
            style={s.input}
            type="text"
            placeholder="სახელი"
            value={row.name}
            onChange={e => update(idx, 'name', e.target.value)}
          />
          <input
            style={s.input}
            type="number"
            placeholder="0"
            min="0"
            value={row.qty}
            onChange={e => update(idx, 'qty', e.target.value)}
          />
          <input
            style={s.input}
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={row.price}
            onChange={e => update(idx, 'price', e.target.value)}
          />
          <button style={s.removeBtn} onClick={() => remove(idx)}>×</button>
        </div>
      ))}

      <button style={s.addBtn} onClick={add}>
        <span style={{ fontSize: 16 }}>+</span> ინგრედიენტი
      </button>
    </div>
  )
}
