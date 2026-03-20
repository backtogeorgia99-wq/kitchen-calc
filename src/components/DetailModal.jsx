import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { canEdit } from '../lib/supabase'
import IngredientTable from './IngredientTable'
import { showToast } from './Toast'

export default function DetailModal({ calc, user, theme, onClose, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(calc.name)
  const [category, setCategory] = useState(calc.category || '')
  const [note, setNote] = useState(calc.note || '')
  const [ingredients, setIngredients] = useState(
    calc.ingredients.map(i => ({
      name: i.name,
      qty: i.qty_kg,
      price: i.price_per_kg,
    }))
  )
  const [loading, setLoading] = useState(false)

  const isDark = theme === 'dark'
  const isBulk = calc.type === 'bulk'

  const total = ingredients.reduce((sum, r) => {
    return sum + (parseFloat(r.qty) || 0) * (parseFloat(r.price) || 0)
  }, 0)

  const perServing = calc.servings > 0 ? total / calc.servings : total

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

    const { error } = await supabase
      .from('calculations')
      .update({
        name: name.trim(),
        category,
        note: note.trim() || null,
        ingredients: rows,
        total_cost: parseFloat(total.toFixed(4)),
        cost_per_serving: parseFloat(perServing.toFixed(4)),
        updated_by: user?.name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', calc.id)

    setLoading(false)
    if (error) { showToast('შეცდომა: ' + error.message, 'error'); return }
    showToast('✅ განახლდა!')
    setEditing(false)
    onClose()
  }

  const s = {
    overlay: {
      position: 'fixed', inset: 0, zIndex: 80,
      background: 'rgba(0,0,0,0.72)',
      display: 'flex', alignItems: 'flex-end',
    },
    sheet: {
      background: isDark ? '#181818' : '#ffffff',
      borderRadius: '14px 14px 0 0',
      padding: '20px 16px 48px',
      width: '100%', maxHeight: '88vh',
      overflowY: 'auto',
      animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)',
    },
    handle: {
      width: 40, height: 4,
      background: isDark ? '#3a3a3a' : '#e0d8cc',
      borderRadius: 2, margin: '0 auto 18px',
    },
    title: {
      fontSize: 19, fontWeight: 800,
      color: isDark ? '#f2ede6' : '#2a1f0f',
      marginBottom: 3,
    },
    sub: {
      fontSize: 12,
      color: isDark ? '#5e5045' : '#a09080',
      marginBottom: 18,
    },
    sectionTitle: {
      fontSize: 11, fontWeight: 700,
      color: '#e8960f',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      margin: '18px 0 10px',
    },
    ingRow: {
      display: 'grid',
      gridTemplateColumns: '1fr auto auto',
      gap: 8, padding: '8px 0',
      borderBottom: `1px solid ${isDark ? '#2e2e2e' : '#e0d8cc'}`,
      fontSize: 13,
    },
    totalBox: {
      background: isDark ? '#202020' : '#f5f0e8',
      borderRadius: 9,
      padding: '12px 14px',
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', marginTop: 12,
    },
    statGrid: {
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      gap: 8, marginBottom: 14,
    },
    statCard: {
      background: isDark ? '#202020' : '#f5f0e8',
      border: `1px solid ${isDark ? '#2e2e2e' : '#e0d8cc'}`,
      borderRadius: 9, padding: '12px',
    },
    input: {
      padding: '10px 12px',
      background: isDark ? '#202020' : '#f5f0e8',
      border: `1px solid ${isDark ? '#2e2e2e' : '#e0d8cc'}`,
      borderRadius: 9, color: isDark ? '#f2ede6' : '#2a1f0f',
      fontSize: 13, outline: 'none', width: '100%',
      marginBottom: 10,
      fontFamily: "'Noto Sans Georgian', sans-serif",
    },
    btnRow: {
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      gap: 10, marginTop: 16,
    },
    btnEdit: {
      padding: 13, background: '#e8960f',
      color: '#000', border: 'none',
      borderRadius: 14, fontSize: 14,
      fontWeight: 700, cursor: 'pointer',
      fontFamily: "'Noto Sans Georgian', sans-serif",
    },
    btnSave: {
      padding: 13, background: '#4ab86a',
      color: '#000', border: 'none',
      borderRadius: 14, fontSize: 14,
      fontWeight: 700, cursor: 'pointer',
      fontFamily: "'Noto Sans Georgian', sans-serif",
    },
    btnClose: {
      width: '100%', padding: 13, marginTop: 10,
      background: isDark ? '#202020' : '#f5f0e8',
      color: isDark ? '#f2ede6' : '#2a1f0f',
      border: `1px solid ${isDark ? '#2e2e2e' : '#e0d8cc'}`,
      borderRadius: 14, fontSize: 14,
      fontWeight: 600, cursor: 'pointer',
      fontFamily: "'Noto Sans Georgian', sans-serif",
    },
    btnDelete: {
      width: '100%', padding: 13, marginTop: 10,
      background: 'rgba(224,80,80,0.1)',
      color: '#e05050',
      border: '1px solid rgba(224,80,80,0.3)',
      borderRadius: 14, fontSize: 14,
      fontWeight: 600, cursor: 'pointer',
      fontFamily: "'Noto Sans Georgian', sans-serif",
    },
  }

  const date = new Date(calc.created_at).toLocaleDateString('ka-GE', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.sheet}>
        <div style={s.handle} />

        {editing ? (
          <>
            <div style={{ ...s.title, marginBottom: 16 }}>✏️ რედაქტირება</div>

            <div style={{ fontSize: 11, color: isDark ? '#9e9080' : '#7a6a55', fontWeight: 600, marginBottom: 5 }}>სახელი</div>
            <input style={s.input} value={name} onChange={e => setName(e.target.value)} />

            <div style={{ fontSize: 11, color: isDark ? '#9e9080' : '#7a6a55', fontWeight: 600, marginBottom: 5 }}>კატეგორია</div>
            <input style={s.input} value={category} onChange={e => setCategory(e.target.value)} />

            <div style={{ fontSize: 11, color: isDark ? '#9e9080' : '#7a6a55', fontWeight: 600, marginBottom: 8 }}>ინგრედიენტები (კგ)</div>
            <IngredientTable ingredients={ingredients} onChange={setIngredients} theme={theme} />

            {!isBulk && (
              <>
                <div style={{ fontSize: 11, color: isDark ? '#9e9080' : '#7a6a55', fontWeight: 600, margin: '10px 0 5px' }}>შენიშვნა</div>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  style={{ ...s.input, resize: 'none', height: 72 }}
                />
              </>
            )}

            <div style={{ ...s.totalBox, marginTop: 14 }}>
              <span style={{ color: isDark ? '#9e9080' : '#7a6a55', fontSize: 13 }}>ახალი ჯამი</span>
              <span style={{ color: '#e8960f', fontSize: 18, fontWeight: 800 }}>₾ {total.toFixed(2)}</span>
            </div>

            <div style={s.btnRow}>
              <button style={s.btnClose} onClick={() => setEditing(false)}>გაუქმება</button>
              <button style={s.btnSave} onClick={save} disabled={loading}>
                {loading ? '...' : '💾 შენახვა'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={s.title}>{isBulk ? '🧪 ' : '🍽️ '}{calc.name}</div>
            <div style={s.sub}>{calc.category} · {date}</div>
            {calc.created_by && <div style={{ ...s.sub, marginTop: -12 }}>შექმნა: {calc.created_by}</div>}
            {calc.updated_by && <div style={{ ...s.sub, marginTop: -12 }}>შეცვალა: {calc.updated_by}</div>}

            <div style={s.statGrid}>
              {isBulk && (
                <>
                  <div style={s.statCard}>
                    <div style={{ fontSize: 10, color: isDark ? '#5e5045' : '#a09080', fontWeight: 600, marginBottom: 4 }}>ულუფების რაოდ.</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: isDark ? '#f2ede6' : '#2a1f0f' }}>{calc.servings} ც</div>
                  </div>
                  <div style={s.statCard}>
                    <div style={{ fontSize: 10, color: isDark ? '#5e5045' : '#a09080', fontWeight: 600, marginBottom: 4 }}>1 ულუფის ღირებ.</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#e8960f' }}>₾ {parseFloat(calc.cost_per_serving || 0).toFixed(2)}</div>
                  </div>
                </>
              )}
              {calc.yield_amount && (
                <div style={{ ...s.statCard, gridColumn: isBulk ? 'auto' : '1/-1' }}>
                  <div style={{ fontSize: 10, color: isDark ? '#5e5045' : '#a09080', fontWeight: 600, marginBottom: 4 }}>
                    {isBulk ? 'გამოსავლიანობა' : 'ულუფის წონა'}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: isDark ? '#f2ede6' : '#2a1f0f' }}>
                    {calc.yield_amount} {calc.yield_unit}
                  </div>
                </div>
              )}
            </div>

            <div style={s.sectionTitle}>ინგრედიენტები</div>
            {(calc.ingredients || []).map((ing, i) => (
              <div key={i} style={{
                ...s.ingRow,
                borderBottom: i === calc.ingredients.length - 1 ? 'none' : `1px solid ${isDark ? '#2e2e2e' : '#e0d8cc'}`
              }}>
                <span style={{ color: isDark ? '#9e9080' : '#7a6a55' }}>{ing.name}</span>
                <span style={{ color: isDark ? '#5e5045' : '#a09080', fontSize: 12 }}>{ing.qty_kg}კგ · ₾{ing.price_per_kg}/კგ</span>
                <span style={{ color: '#e8960f', fontWeight: 700 }}>₾{parseFloat(ing.cost).toFixed(2)}</span>
              </div>
            ))}

            <div style={s.totalBox}>
              <span style={{ color: isDark ? '#9e9080' : '#7a6a55', fontSize: 13 }}>სულ ღირებულება</span>
              <span style={{ color: '#e8960f', fontSize: 20, fontWeight: 800 }}>₾ {parseFloat(calc.total_cost || 0).toFixed(2)}</span>
            </div>

            {calc.note && (
              <>
                <div style={s.sectionTitle}>შენიშვნა</div>
                <div style={{ fontSize: 13, color: isDark ? '#9e9080' : '#7a6a55', lineHeight: 1.65 }}>{calc.note}</div>
              </>
            )}

            {canEdit(user) && (
              <div style={s.btnRow}>
                <button style={s.btnEdit} onClick={() => setEditing(true)}>✏️ რედაქტირება</button>
                <button style={{ ...s.btnClose }} onClick={onClose}>დახურვა</button>
              </div>
            )}

            {onDelete && canEdit(user) && (
              <button style={s.btnDelete} onClick={() => onDelete(calc.id)}>🗑️ წაშლა</button>
            )}

            {!canEdit(user) && (
              <button style={s.btnClose} onClick={onClose}>დახურვა</button>
            )}
          </>
        )}
      </div>
    </div>
  )
}