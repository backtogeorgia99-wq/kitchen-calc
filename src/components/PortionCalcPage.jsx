import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { logAudit } from '../lib/auditLog'
import IngredientTable from './IngredientTable'
import BulkFabLogo from './BulkFabLogo'
import { showToast } from './Toast'
import { lux } from '../theme/luxury'

const PORTION_UNITS = ['კგ', 'გ', 'ც', 'მლ', 'ლ']
const empty = () => ({ name: '', qty: '', price: '' })

function calcTotal(ingredients) {
  return ingredients.reduce((sum, r) => {
    return sum + (parseFloat(r.qty) || 0) * (parseFloat(r.price) || 0)
  }, 0)
}

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
  const [categories, setCategories] = useState([])

  const isDark = theme === 'dark'
  const total = calcTotal(ingredients)

  useEffect(() => {
    supabase.from('calculations').select('*').eq('type', 'bulk').order('created_at', { ascending: false }).then(({ data }) => setBulkList(data || []))
    supabase.from('categories').select('*').eq('type', 'portion').order('name').then(({ data }) => setCategories(data || []))
  }, [])

  const insertBulk = (bulk) => {
    const perServing = bulk.ingredients.map(ing => ({
      name: ing.name,
      qty: bulk.servings > 0 ? (ing.qty_kg / bulk.servings).toFixed(4) : ing.qty_kg,
      price: ing.price_per_kg,
    }))
    setIngredients(prev => [...prev.filter(r => r.name.trim()), ...perServing])
    // ნახევარფაბრიკატის ულუფის წონა (გამოსავალი/ულუფა) — მხოლოდ თუ კერძზე ჯერ არ გაქვთ შეყვანილი წონა;
    // თორემ თქვენი მნიშვნელობა (მაგ. 300გ მთელი თეფშის წონა) არ გადაიწერება 100გ ნ/ფ ულუფაზე.
    const userChoseWeight = String(weight || '').trim() !== '' && (parseFloat(weight) || 0) > 0
    if (!userChoseWeight && bulk.yield_amount && bulk.servings > 0) {
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
    const { data: created, error } = await supabase.from('calculations').insert({
      type: 'portion', name: name.trim(), category, servings: 1,
      yield_amount: parseFloat(weight) || null, yield_unit: weightUnit,
      ingredients: rows,
      total_cost: parseFloat(total.toFixed(4)),
      cost_per_serving: parseFloat(total.toFixed(4)),
      note: note.trim() || null, created_by: user?.email || user?.name,
    }).select('id').single()
    setLoading(false)
    if (error) { showToast('შეცდომა: ' + error.message, 'error'); return }
    await logAudit(user, 'create', 'calculation', created?.id, { name: name.trim(), type: 'portion' })
    showToast('✅ წარმატებით შეინახა!')
    clear()
  }

  const inp = { ...lux.inp }

  const card = { ...lux.card }

  const lbl = { ...lux.lbl }

  return (
    <div style={{ padding: '16px 16px 48px', animation: 'fadeUp 0.3s ease' }}>

      <div style={card}>
        <div style={{
          fontSize: 13, fontWeight: 800,
          color: 'var(--green-bright)', marginBottom: 18,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          🍽️ 1 ულუფის კალკულაცია
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>კერძის სახელი *</label>
          <input style={inp} value={name} onChange={e => setName(e.target.value)}
            placeholder="მაგ: ხინკალი"
            onFocus={e => { e.target.style.borderColor = 'var(--green)'; e.target.style.boxShadow = '0 0 0 3px var(--green-dim)' }}
            onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = 'none' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={lbl}>კატეგორია</label>
            <select style={inp} value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">-- აირჩიეთ --</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ ...lbl, color: 'var(--qty-red)' }}>
              ულუფის წონა {weightLocked && <span style={{ color: 'var(--accent-bright)' }}>🔒</span>}
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input style={{
                ...inp,
                color: 'var(--qty-red)',
                fontWeight: 800,
                background: isDark ? 'rgba(255,138,128,0.06)' : 'var(--qty-red-muted)',
                borderColor: isDark ? 'rgba(255,138,128,0.22)' : 'rgba(198,40,40,0.2)',
                opacity: weightLocked ? 0.92 : 1,
              }}
                type="number" min="0" step="0.001"
                value={weight}
                onChange={e => !weightLocked && setWeight(e.target.value)}
                placeholder="0.000" readOnly={weightLocked}
                onFocus={e => { if (!weightLocked) e.target.style.borderColor = '#dc4444' }}
                onBlur={e => { e.target.style.borderColor = isDark ? 'rgba(255,138,128,0.22)' : 'rgba(198,40,40,0.2)' }}
              />
              <select style={{ ...inp, width: 66, flexShrink: 0 }}
                value={weightUnit}
                onChange={e => !weightLocked && setWeightUnit(e.target.value)}
                disabled={weightLocked}>
                {PORTION_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div style={card}>
        <div style={{
          fontSize: 13, fontWeight: 800,
          color: 'var(--text)',
          marginBottom: 14, letterSpacing: '0.04em',
        }}>
          🥩 ინგრედიენტები <span style={{ fontSize: 11, color: 'var(--qty-red)', fontWeight: 800 }}>1 ულუფა</span>
        </div>
        <button type="button" onClick={() => setShowBulkModal(true)} style={{
          width: '100%', padding: '12px 14px',
          background: 'var(--blue-dim)',
          border: '1px solid var(--border-card)',
          borderRadius: 14, color: 'var(--blue-bright)',
          fontSize: 11, fontWeight: 800, cursor: 'pointer',
          marginBottom: 12,
          fontFamily: "'Noto Sans Georgian', sans-serif",
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: 'var(--shadow-sm)',
        }}>
          <BulkFabLogo size={22} />
          + ნახევრადფაბრიკატიდან ჩასმა
        </button>
        <IngredientTable ingredients={ingredients} onChange={setIngredients} theme={theme} user={user} />
      </div>

      <div style={card}>
        <label style={lbl}>📝 შენიშვნა</label>
        <textarea style={{
          ...inp, resize: 'none', height: 80,
        }} value={note} onChange={e => setNote(e.target.value)}
          placeholder="დამზადების წესი..."
          onFocus={e => { e.target.style.borderColor = 'var(--green)'; e.target.style.boxShadow = '0 0 0 3px var(--green-dim)' }}
          onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = 'none' }}
        />
      </div>

      {/* SUMMARY */}
      <div style={{
        background: 'var(--surface-shine)',
        borderRadius: 22,
        border: '1px solid rgba(31, 107, 74, 0.22)',
        boxShadow: 'var(--shadow-card)',
        padding: '18px 18px', marginBottom: 16,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{
            background: 'var(--green-dim)',
            borderRadius: 14, padding: '14px', textAlign: 'center',
            border: '1px solid var(--border-card)',
          }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 800, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.12em' }}>ინგრედიენტები</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green-bright)', letterSpacing: '-0.02em' }}>₾ {total.toFixed(2)}</div>
          </div>
          <div style={{
            background: 'var(--green-dim)',
            borderRadius: 14, padding: '14px', textAlign: 'center',
            border: '1px solid var(--border-card)',
          }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 800, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.12em' }}>1 ულუფა</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green-bright)', letterSpacing: '-0.02em' }}>₾ {total.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
        <button type="button" onClick={clear} style={{
          padding: '15px',
          background: 'var(--surface2)',
          color: 'var(--text2)',
          border: '1px solid var(--border-card)',
          borderRadius: 14, fontSize: 12, fontWeight: 700,
          cursor: 'pointer',
          fontFamily: "'Noto Sans Georgian', sans-serif",
          letterSpacing: '0.04em',
        }}>🗑️ გასუფთავება</button>
        <button type="button" onClick={save} disabled={loading} style={{
          padding: '15px',
          background: 'linear-gradient(135deg, var(--green-bright) 0%, var(--green) 100%)',
          color: '#fff',
          border: '1px solid rgba(31, 107, 74, 0.35)',
          borderRadius: 14,
          fontSize: 13, fontWeight: 800, cursor: loading ? 'wait' : 'pointer',
          fontFamily: "'Noto Sans Georgian', sans-serif",
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          boxShadow: '0 6px 24px rgba(31, 107, 74, 0.28), inset 0 1px 0 rgba(255,255,255,0.2)',
          opacity: loading ? 0.88 : 1,
        }}>
          {loading ? '...' : '💾 შენახვა'}
        </button>
      </div>

      {showBulkModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 80,
          background: 'rgba(8, 6, 4, 0.55)',
          display: 'flex', alignItems: 'flex-end',
          backdropFilter: 'blur(8px)',
        }} onClick={e => e.target === e.currentTarget && setShowBulkModal(false)}>
          <div style={{
            background: 'var(--surface-shine)',
            borderRadius: '28px 28px 0 0',
            padding: '22px 18px 48px',
            width: '100%', maxHeight: '72vh',
            overflowY: 'auto',
            animation: 'slideUp 0.3s cubic-bezier(0.32,0.72,0,1)',
            boxShadow: '0 -12px 48px rgba(0,0,0,0.25), inset 0 1px 0 var(--border-accent)',
            border: '1px solid var(--border-card)',
            borderBottom: 'none',
          }}>
            <div style={{ width: 40, height: 4, background: 'var(--accent-gradient)', borderRadius: 3, margin: '0 auto 20px', opacity: 0.85 }} />
            <div style={{
              fontSize: 14, fontWeight: 800, color: 'var(--text)',
              marginBottom: 16, letterSpacing: '0.06em',
              textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <BulkFabLogo size={28} />
              ნახევრადფაბრიკატის არჩევა
            </div>
            {bulkList.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text3)', padding: 36 }}>ნახევრადფაბრიკატი არ მოიძებნა</div>
            ) : bulkList.map(b => (
              <div key={b.id} onClick={() => insertBulk(b)} style={{
                padding: '16px 16px',
                background: 'var(--surface2)',
                border: '1px solid var(--border-card)',
                borderRadius: 16, marginBottom: 10, cursor: 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{b.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>
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