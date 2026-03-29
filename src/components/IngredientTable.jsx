import { canEditPrices } from '../lib/supabase'

export default function IngredientTable({ ingredients, onChange, theme, user }) {
  const isDark = theme === 'dark'
  const priceOk = canEditPrices(user)

  const inp = {
    width: '100%', padding: '10px 11px',
    background: 'var(--input-fill)',
    border: '1.5px solid var(--input-border)',
    borderRadius: 11,
    color: 'var(--text)',
    fontSize: 12, outline: 'none',
    fontFamily: "'Noto Sans Georgian', sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  const update = (idx, field, val) => {
    onChange(ingredients.map((r, i) => i === idx ? { ...r, [field]: val } : r))
  }

  const remove = (idx) => {
    if (ingredients.length <= 1) return
    onChange(ingredients.filter((_, i) => i !== idx))
  }

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 80px 80px 32px',
        gap: 6, marginBottom: 6,
      }}>
        {['ინგრედიენტი', 'კგ', '₾/კგ', ''].map((h, i) => (
          <div key={i} style={{
            fontSize: 10, fontWeight: 700,
            color: i === 1 ? 'var(--qty-red)' : 'var(--text-muted)',
            textAlign: i === 0 ? 'left' : 'center',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            {h}
            {i === 2 && !priceOk && (
              <div style={{ fontSize: 8, fontWeight: 600, color: '#dc4444', textTransform: 'none', marginTop: 2, lineHeight: 1.2 }}>
                🔒 ადმინი
              </div>
            )}
          </div>
        ))}
      </div>

      {ingredients.map((row, idx) => (
        <div key={idx} style={{
          display: 'grid',
          gridTemplateColumns: '1fr 80px 80px 32px',
          gap: 6, marginBottom: 6, alignItems: 'center',
        }}>
          <input style={inp} type="text" placeholder="სახელი"
            value={row.name} onChange={e => update(idx, 'name', e.target.value)}
            onFocus={e => { e.target.style.borderColor = 'var(--accent-bright)'; e.target.style.boxShadow = '0 0 0 2px var(--accent-dim)' }}
            onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = 'none' }}
          />
          <input style={{
            ...inp,
            color: 'var(--qty-red)',
            fontWeight: 700,
            background: isDark ? 'rgba(255,138,128,0.06)' : 'var(--qty-red-muted)',
            borderColor: isDark ? 'rgba(255,138,128,0.22)' : 'rgba(198,40,40,0.2)',
          }} type="number" placeholder="0.000"
            min="0" step="0.001" value={row.qty}
            onChange={e => update(idx, 'qty', e.target.value)}
            onFocus={e => { e.target.style.borderColor = '#dc4444' }}
            onBlur={e => { e.target.style.borderColor = isDark ? 'rgba(255,138,128,0.22)' : 'rgba(198,40,40,0.2)' }}
          />
          <input
            style={{
              ...inp,
              opacity: priceOk ? 1 : 0.85,
              cursor: priceOk ? 'text' : 'not-allowed',
              background: priceOk ? inp.background : (isDark ? '#1a1a1a' : '#ece8e0'),
            }}
            type="number"
            placeholder={priceOk ? '0.00' : '—'}
            min="0"
            step="0.01"
            value={row.price}
            disabled={!priceOk}
            title={priceOk ? '' : 'ფასის შეცვლა მხოლოდ ადმინისტრატორს შეუძლია'}
            onChange={e => priceOk && update(idx, 'price', e.target.value)}
            onFocus={e => { if (priceOk) { e.target.style.borderColor = 'var(--accent-bright)'; e.target.style.boxShadow = '0 0 0 2px var(--accent-dim)' } }}
            onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = 'none' }}
          />
          <button onClick={() => remove(idx)} style={{
            width: 32, height: 32,
            background: isDark ? 'rgba(220,68,68,0.1)' : 'rgba(220,68,68,0.08)',
            border: '1.5px solid rgba(220,68,68,0.2)',
            borderRadius: 9, color: '#dc4444',
            cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>
      ))}

      <button onClick={() => onChange([...ingredients, { name: '', qty: '', price: '' }])}
        style={{
          width: '100%', padding: '9px',
          background: 'transparent',
          border: `1.5px dashed ${isDark ? '#2a2a2a' : '#ede8e0'}`,
          borderRadius: 10,
          color: isDark ? '#5e5045' : '#b0a090',
          fontSize: 12, cursor: 'pointer', marginTop: 4,
          fontFamily: "'Noto Sans Georgian', sans-serif",
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          e.target.style.borderColor = 'var(--accent-bright)'
          e.target.style.color = 'var(--accent-bright)'
        }}
        onMouseLeave={e => {
          e.target.style.borderColor = isDark ? '#2a2a2a' : '#ede8e0'
          e.target.style.color = isDark ? '#5e5045' : '#b0a090'
        }}
      >
        + ინგრედიენტი
      </button>

      {!priceOk && (
        <div style={{
          marginTop: 10,
          fontSize: 11,
          color: isDark ? '#7a6d60' : '#9a8a78',
          lineHeight: 1.45,
          padding: '8px 10px',
          borderRadius: 10,
          background: isDark ? 'rgba(220,68,68,0.06)' : 'rgba(220,68,68,0.06)',
          border: `1px solid ${isDark ? 'rgba(220,68,68,0.15)' : 'rgba(220,68,68,0.12)'}`,
        }}>
          ფასი (₾/კგ) იწერება მხოლოდ <strong style={{ color: 'var(--accent-bright)' }}>ადმინისტრატორის</strong> მიერ. რაოდენობა და სახელი შეგიძლიათ შეცვალოთ.
        </div>
      )}
    </div>
  )
}