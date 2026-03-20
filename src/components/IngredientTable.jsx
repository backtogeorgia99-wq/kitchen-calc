export default function IngredientTable({ ingredients, onChange, theme }) {
  const isDark = theme === 'dark'

  const s = {
    colHeaders: {
      display: 'grid',
      gridTemplateColumns: '1fr 80px 80px 36px',
      gap: 6, padding: '0 2px', marginBottom: 4,
    },
    colH: {
      fontSize: 10, color: isDark ? '#5e5045' : '#a09080',
      fontWeight: 600, textAlign: 'center',
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 80px 80px 36px',
      gap: 6, marginBottom: 6, alignItems: 'center',
    },
    input: {
      width: '100%', padding: '9px 10px',
      background: isDark ? '#202020' : '#f5f0e8',
      border: `1px solid ${isDark ? '#2e2e2e' : '#e0d8cc'}`,
      borderRadius: 9,
      color: isDark ? '#f2ede6' : '#2a1f0f',
      fontSize: 12, outline: 'none',
      fontFamily: "'Noto Sans Georgian', sans-serif",
    },
    removeBtn: {
      width: 36, height: 36,
      background: 'rgba(224,80,80,0.1)',
      border: '1px solid rgba(224,80,80,0.25)',
      borderRadius: 9, color: '#e05050',
      cursor: 'pointer', fontSize: 18,
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0,
    },
    addBtn: {
      width: '100%', padding: '9px 0', marginTop: 4,
      background: 'transparent',
      border: `1px dashed ${isDark ? '#3a3a3a' : '#d0c8bc'}`,
      borderRadius: 9,
      color: isDark ? '#9e9080' : '#7a6a55',
      fontSize: 12, cursor: 'pointer',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', gap: 6,
      fontFamily: "'Noto Sans Georgian', sans-serif",
    },
  }

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
        <div style={s.colH}>რაოდ. (კგ)</div>
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
            placeholder="0.000"
            min="0"
            step="0.001"
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