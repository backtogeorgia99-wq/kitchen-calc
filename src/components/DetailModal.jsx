import { useState } from 'react'
import { supabase, canEdit } from '../lib/supabase'
import { useAppSettings, formatMoney, displaySellingPrice } from '../lib/formatMoney'
import { logAudit } from '../lib/auditLog'
import IngredientTable from './IngredientTable'
import { showToast } from './Toast'
import BulkFabLogo from './BulkFabLogo'

export default function DetailModal({ calc, user, theme, onClose, onDelete, onChanged }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(calc.name)
  const [category, setCategory] = useState(calc.category || '')
  const [note, setNote] = useState(calc.note || '')
  const [ingredients, setIngredients] = useState(
    (calc.ingredients || []).map(i => ({ name: i.name, qty: i.qty_kg, price: i.price_per_kg }))
  )
  const [loading, setLoading] = useState(false)
  const [dupLoading, setDupLoading] = useState(false)
  const settings = useAppSettings()

  const isDark = theme === 'dark'
  const isBulk = calc.type === 'bulk'
  const accentColor = isBulk ? 'var(--accent-bright)' : 'var(--green-bright)'

  const total = ingredients.reduce((sum, r) => {
    return sum + (parseFloat(r.qty) || 0) * (parseFloat(r.price) || 0)
  }, 0)

  const perServing = calc.servings > 0 ? total / calc.servings : total

  const inp = {
    padding: '11px 14px',
    background: isDark ? '#242424' : '#f8f6f2',
    border: `1.5px solid ${isDark ? '#2a2a2a' : '#ede8e0'}`,
    borderRadius: 10, color: isDark ? '#f2ede6' : '#1a1410',
    fontSize: 13, outline: 'none', width: '100%',
    marginBottom: 10,
    fontFamily: "'Noto Sans Georgian', sans-serif",
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
    const { error } = await supabase.from('calculations').update({
      name: name.trim(), category, note: note.trim() || null,
      ingredients: rows,
      total_cost: parseFloat(total.toFixed(4)),
      cost_per_serving: parseFloat(perServing.toFixed(4)),
      updated_by: user?.name,
      updated_at: new Date().toISOString(),
    }).eq('id', calc.id)
    setLoading(false)
    if (error) { showToast('შეცდომა: ' + error.message, 'error'); return }
    await logAudit(user, 'update', 'calculation', calc.id, { name: name.trim() })
    showToast('✅ განახლდა!')
    setEditing(false)
    onChanged?.()
    onClose()
  }

  const duplicate = async () => {
    const def = `${calc.name} (ასლი)`
    const baseName = window.prompt('დუბლიკატის სახელი:', def)
    if (baseName == null || !String(baseName).trim()) return
    setDupLoading(true)
    const { data, error } = await supabase.from('calculations').insert({
      type: calc.type,
      name: String(baseName).trim(),
      category: calc.category || null,
      servings: calc.servings ?? 1,
      yield_amount: calc.yield_amount ?? null,
      yield_unit: calc.yield_unit || 'გ',
      ingredients: calc.ingredients || [],
      total_cost: calc.total_cost ?? null,
      cost_per_serving: calc.cost_per_serving ?? null,
      cost_per_unit: calc.cost_per_unit ?? null,
      note: calc.note || null,
      created_by: user?.email || user?.name || null,
      settings: calc.settings && typeof calc.settings === 'object' ? calc.settings : {},
    }).select('id').single()
    setDupLoading(false)
    if (error) { showToast('შეცდომა: ' + error.message, 'error'); return }
    await logAudit(user, 'duplicate', 'calculation', data?.id, { from_id: calc.id, name: String(baseName).trim() })
    showToast('✅ დუბლიკატი შეიქმნა')
    onChanged?.()
    onClose()
  }

  const date = new Date(calc.created_at).toLocaleDateString('ka-GE', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 80,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'flex-end',
      backdropFilter: 'blur(4px)',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: isDark ? '#1e1e1e' : '#ffffff',
        borderRadius: '24px 24px 0 0',
        padding: '20px 18px 48px',
        width: '100%', maxHeight: '90vh',
        overflowY: 'auto',
        animation: 'slideUp 0.3s cubic-bezier(0.32,0.72,0,1)',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
      }}>
        <div style={{
          width: 36, height: 4,
          background: isDark ? '#2a2a2a' : '#ede8e0',
          borderRadius: 2, margin: '0 auto 20px',
        }} />

        {editing ? (
          <>
            <div style={{ fontSize: 17, fontWeight: 800, color: isDark ? '#f2ede6' : '#1a1410', marginBottom: 18, letterSpacing: '-0.02em' }}>
              ✏️ რედაქტირება
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: isDark ? '#5e5045' : '#b0a090', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>სახელი</div>
            <input style={inp} value={name} onChange={e => setName(e.target.value)} />

            <div style={{ fontSize: 11, fontWeight: 700, color: isDark ? '#5e5045' : '#b0a090', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>კატეგორია</div>
            <input style={inp} value={category} onChange={e => setCategory(e.target.value)} />

            <div style={{ fontSize: 11, fontWeight: 700, color: isDark ? '#5e5045' : '#b0a090', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ინგრედიენტები</div>
            <IngredientTable ingredients={ingredients} onChange={setIngredients} theme={theme} user={user} />

            {!isBulk && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: isDark ? '#5e5045' : '#b0a090', margin: '12px 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>შენიშვნა</div>
                <textarea value={note} onChange={e => setNote(e.target.value)}
                  style={{ ...inp, resize: 'none', height: 72 }} />
              </>
            )}

            <div style={{
              background: isDark ? '#242424' : '#f8f6f2',
              borderRadius: 14, padding: '14px 16px',
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginTop: 6, marginBottom: 16,
            }}>
              <span style={{ color: isDark ? '#9e9080' : '#7a6a55', fontSize: 13 }}>ახალი ჯამი</span>
              <span style={{ color: accentColor, fontSize: 20, fontWeight: 800 }}>{formatMoney(total, settings)}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button onClick={() => setEditing(false)} style={{
                padding: 13,
                background: isDark ? '#242424' : '#f8f6f2',
                color: isDark ? '#9e9080' : '#7a6a55',
                border: `1.5px solid ${isDark ? '#2a2a2a' : '#ede8e0'}`,
                borderRadius: 14, fontSize: 13, fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Noto Sans Georgian', sans-serif",
              }}>გაუქმება</button>
              <button onClick={save} disabled={loading} style={{
                padding: 13,
                background: accentColor, color: isBulk ? '#000' : '#fff',
                border: 'none', borderRadius: 14,
                fontSize: 14, fontWeight: 800, cursor: 'pointer',
                fontFamily: "'Noto Sans Georgian', sans-serif",
                boxShadow: `0 4px 16px ${accentColor}50`,
              }}>
                {loading ? '...' : '💾 შენახვა'}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* BADGE */}
            <div style={{ marginBottom: 12 }}>
              <span style={{
                fontSize: 11, padding: '6px 12px 6px 8px',
                borderRadius: 20, fontWeight: 700,
                background: isBulk
                  ? (isDark ? 'rgba(45,111,224,0.15)' : 'rgba(45,111,224,0.1)')
                  : (isDark ? 'rgba(45,158,95,0.15)' : 'rgba(45,158,95,0.1)'),
                color: isBulk ? '#2d6fe0' : '#2d9e5f',
                border: `1px solid ${isBulk ? 'rgba(45,111,224,0.25)' : 'rgba(45,158,95,0.25)'}`,
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                {isBulk ? <><BulkFabLogo size={22} /> ნახევრადფაბრიკატი</> : '🍽️ 1 ულუფა'}
              </span>
            </div>

            <div style={{ fontSize: 22, fontWeight: 800, color: isDark ? '#f2ede6' : '#1a1410', marginBottom: 4, letterSpacing: '-0.02em' }}>
              {calc.name}
            </div>
            <div style={{ fontSize: 12, color: isDark ? '#5e5045' : '#b0a090', marginBottom: 4 }}>
              {calc.category} · {date}
            </div>
            {calc.created_by && (
              <div style={{ fontSize: 11, color: isDark ? '#3a3a3a' : '#d0c8bc', marginBottom: 18 }}>
                შექმნა: {calc.created_by}
                {calc.updated_by ? ` · შეცვალა: ${calc.updated_by}` : ''}
              </div>
            )}

            {/* STATS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
              {isBulk && (
                <>
                  <div style={{
                    background: isDark ? '#242424' : '#f8f6f2',
                    borderRadius: 14, padding: '14px',
                    border: `1px solid ${isDark ? '#2a2a2a' : '#ede8e0'}`,
                  }}>
                    <div style={{ fontSize: 10, color: isDark ? '#5e5045' : '#b0a090', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>ულუფები</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: isDark ? '#f2ede6' : '#1a1410' }}>{calc.servings} ც</div>
                  </div>
                  <div style={{
                    background: isDark ? '#242424' : '#f8f6f2',
                    borderRadius: 14, padding: '14px',
                    border: `1px solid ${isDark ? '#2a2a2a' : '#ede8e0'}`,
                  }}>
                    <div style={{ fontSize: 10, color: isDark ? '#5e5045' : '#b0a090', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>1 ულუფა</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: accentColor }}>{formatMoney(calc.cost_per_serving || 0, settings)}</div>
                  </div>
                </>
              )}
              {calc.yield_amount && (
                <div style={{
                  background: isDark ? '#242424' : '#f8f6f2',
                  borderRadius: 14, padding: '14px',
                  border: `1px solid ${isDark ? '#2a2a2a' : '#ede8e0'}`,
                  gridColumn: isBulk ? 'auto' : '1/-1',
                }}>
                  <div style={{ fontSize: 10, color: isDark ? '#5e5045' : '#b0a090', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                    {isBulk ? 'გამოსავლიანობა' : 'ულუფის წონა'}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--qty-red)', letterSpacing: '-0.02em' }}>
                    {calc.yield_amount} {calc.yield_unit}
                  </div>
                </div>
              )}
            </div>

            {/* INGREDIENTS */}
            <div style={{ fontSize: 11, fontWeight: 700, color: isDark ? '#5e5045' : '#b0a090', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              ინგრედიენტები
            </div>
            <div style={{
              background: isDark ? '#242424' : '#f8f6f2',
              borderRadius: 14, overflow: 'hidden',
              border: `1px solid ${isDark ? '#2a2a2a' : '#ede8e0'}`,
              marginBottom: 14,
            }}>
              {(calc.ingredients || []).map((ing, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', padding: '10px 14px',
                  borderBottom: i < (calc.ingredients || []).length - 1
                    ? `1px solid ${isDark ? '#2a2a2a' : '#ede8e0'}`
                    : 'none',
                }}>
                  <span style={{ fontSize: 13, color: isDark ? '#f2ede6' : '#1a1410', fontWeight: 500 }}>{ing.name}</span>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: isDark ? '#5e5045' : '#b0a090' }}>
                      <span style={{ color: 'var(--qty-red)', fontWeight: 800 }}>{ing.qty_kg} კგ</span>
                      {' · '}{formatMoney(ing.price_per_kg, settings)}/კგ
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: accentColor }}>{formatMoney(ing.cost, settings)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* TOTAL */}
            <div style={{
              background: isDark
                ? isBulk ? 'rgba(72,209,204,0.1)' : 'rgba(45,158,95,0.08)'
                : isBulk ? 'rgba(72,209,204,0.08)' : 'rgba(45,158,95,0.06)',
              border: `1.5px solid ${isBulk ? 'rgba(72,209,204,0.28)' : 'rgba(45,158,95,0.25)'}`,
              borderRadius: 14, padding: '14px 16px',
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 18,
            }}>
              <span style={{ color: isDark ? '#9e9080' : '#7a6a55', fontSize: 13, fontWeight: 600 }}>სულ ღირებულება</span>
              <span style={{ color: accentColor, fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>
                {formatMoney(calc.total_cost || 0, settings)}
              </span>
            </div>

            {(settings.markupPercent > 0 || settings.vatPercent > 0) && (
              <div style={{
                fontSize: 12,
                color: isDark ? '#9e9080' : '#7a6a55',
                marginBottom: 14,
                textAlign: 'right',
              }}>
                სავარაუდო გასაყიდი (მარჟა + დღგ):{' '}
                <strong style={{ color: accentColor }}>{formatMoney(displaySellingPrice(calc.total_cost, settings), settings)}</strong>
              </div>
            )}

            {calc.note && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: isDark ? '#5e5045' : '#b0a090', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>შენიშვნა</div>
                <div style={{ fontSize: 13, color: isDark ? '#9e9080' : '#7a6a55', lineHeight: 1.7, marginBottom: 18 }}>{calc.note}</div>
              </>
            )}

            {/* ACTIONS */}
            {canEdit(user) && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <button type="button" onClick={() => setEditing(true)} style={{
                    padding: 13, background: isDark ? '#242424' : '#f8f6f2',
                    color: 'var(--accent-bright)',
                    border: `1.5px solid ${isDark ? 'rgba(72,209,204,0.28)' : 'rgba(72,209,204,0.26)'}`,
                    borderRadius: 14, fontSize: 13, fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: "'Noto Sans Georgian', sans-serif",
                  }}>✏️ რედაქტირება</button>
                  <button
                    type="button"
                    disabled={dupLoading}
                    onClick={duplicate}
                    style={{
                      padding: 13,
                      background: isDark ? 'rgba(45,111,224,0.12)' : 'rgba(45,111,224,0.08)',
                      color: '#2d6fe0',
                      border: '1.5px solid rgba(45,111,224,0.3)',
                      borderRadius: 14, fontSize: 13, fontWeight: 700,
                      cursor: dupLoading ? 'wait' : 'pointer',
                      fontFamily: "'Noto Sans Georgian', sans-serif",
                    }}
                  >
                    {dupLoading ? '...' : '📋 დუბლიკატი'}
                  </button>
                </div>
                <button type="button" onClick={onClose} style={{
                  width: '100%',
                  padding: 13,
                  marginBottom: 10,
                  background: isDark ? '#242424' : '#f8f6f2',
                  color: isDark ? '#9e9080' : '#7a6a55',
                  border: `1.5px solid ${isDark ? '#2a2a2a' : '#ede8e0'}`,
                  borderRadius: 14, fontSize: 13, fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Noto Sans Georgian', sans-serif",
                }}>დახურვა</button>
              </>
            )}

            {canEdit(user) && onDelete && (
              <button onClick={() => onDelete(calc.id)} style={{
                width: '100%', padding: 13,
                background: isDark ? 'rgba(220,68,68,0.08)' : 'rgba(220,68,68,0.06)',
                color: '#dc4444',
                border: '1.5px solid rgba(220,68,68,0.2)',
                borderRadius: 14, fontSize: 13, fontWeight: 700,
                cursor: 'pointer', marginBottom: 10,
                fontFamily: "'Noto Sans Georgian', sans-serif",
              }}>🗑️ წაშლა</button>
            )}

            {!canEdit(user) && (
              <button onClick={onClose} style={{
                width: '100%', padding: 13,
                background: isDark ? '#242424' : '#f8f6f2',
                color: isDark ? '#9e9080' : '#7a6a55',
                border: `1.5px solid ${isDark ? '#2a2a2a' : '#ede8e0'}`,
                borderRadius: 14, fontSize: 14, fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Noto Sans Georgian', sans-serif",
              }}>დახურვა</button>
            )}
          </>
        )}
      </div>
    </div>
  )
}