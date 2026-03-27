import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { logAudit } from '../lib/auditLog'
import IngredientTable from './IngredientTable'
import BulkFabLogo from './BulkFabLogo'
import { showToast } from './Toast'

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

  const inp = {
    padding: '12px 14px',
    background: isDark ? '#242424' : '#f8f6f2',
    border: `1.5px solid ${isDark ? '#2a2a2a' : '#ede8e0'}`,
    borderRadius: 10, color: isDark ? '#f2ede6' : '#1a1410',
    fontSize: 13, outline: 'none', width: '100%',
    fontFamily: "'Noto Sans Georgian', sans-serif",
    transition: 'border-color 0.2s',
  }

  const card = {
    background: isDark ? '#1e1e1e' : '#ffffff',
    borderRadius: 20,
    boxShadow: isDark
      ? '0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)'
      : '0 4px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
    padding: '18px', marginBottom: 14,
  }

  const lbl = {
    fontSize: 11, fontWeight: 700,
    color: isDark ? '#5e5045' : '#b0a090',
    marginBottom: 6, letterSpacing: '0.05em',
    textTransform: 'uppercase', display: 'block',
  }

  return (
    <div style={{ padding: '16px 16px 48px', animation: 'fadeUp 0.3s ease' }}>

      <div style={card}>
        <div style={{
          fontSize: 13, fontWeight: 800,
          color: '#2d9e5f', marginBottom: 16,
          letterSpacing: '-0.01em',
        }}>
          🍽️ 1 ულუფის კალკულაცია
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>კერძის სახელი *</label>
          <input style={inp} value={name} onChange={e => setName(e.target.value)}
            placeholder="მაგ: ხინკალი"
            onFocus={e => e.target.style.borderColor = '#2d9e5f'}
            onBlur={e => e.target.style.borderColor = isDark ? '#2a2a2a' : '#ede8e0'}
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
            <label style={lbl}>
              ულუფის წონა {weightLocked && <span style={{ color: '#e8960f' }}>🔒</span>}
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input style={{
                ...inp,
                color: weightLocked ? '#e8960f' : (isDark ? '#f2ede6' : '#1a1410'),
                fontWeight: weightLocked ? 700 : 400,
                opacity: weightLocked ? 0.8 : 1,
              }}
                type="number" min="0" step="0.001"
                value={weight}
                onChange={e => !weightLocked && setWeight(e.target.value)}
                placeholder="0.000" readOnly={weightLocked}
                onFocus={e => !weightLocked && (e.target.style.borderColor = '#2d9e5f')}
                onBlur={e => e.target.style.borderColor = isDark ? '#2a2a2a' : '#ede8e0'}
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
          color: isDark ? '#f2ede6' : '#1a1410',
          marginBottom: 12, letterSpacing: '-0.01em',
        }}>
          🥩 ინგრედიენტები <span style={{ fontSize: 11, color: isDark ? '#5e5045' : '#b0a090', fontWeight: 500 }}>1 ულუფა</span>
        </div>
        <button type="button" onClick={() => setShowBulkModal(true)} style={{
          width: '100%', padding: '10px 12px',
          background: isDark ? 'rgba(45,111,224,0.08)' : 'rgba(45,111,224,0.06)',
          border: `1.5px solid ${isDark ? 'rgba(45,111,224,0.25)' : 'rgba(45,111,224,0.2)'}`,
          borderRadius: 10, color: '#2d6fe0',
          fontSize: 12, fontWeight: 700, cursor: 'pointer',
          marginBottom: 12,
          fontFamily: "'Noto Sans Georgian', sans-serif",
          letterSpacing: '-0.01em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
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
          onFocus={e => e.target.style.borderColor = '#2d9e5f'}
          onBlur={e => e.target.style.borderColor = isDark ? '#2a2a2a' : '#ede8e0'}
        />
      </div>

      {/* SUMMARY */}
      <div style={{
        background: isDark
          ? 'linear-gradient(135deg, #141e14 0%, #1e1e1e 100%)'
          : 'linear-gradient(135deg, #f0faf4 0%, #ffffff 100%)',
        borderRadius: 20,
        border: `1.5px solid ${isDark ? 'rgba(45,158,95,0.2)' : 'rgba(45,158,95,0.25)'}`,
        padding: '16px 18px', marginBottom: 14,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{
            background: isDark ? 'rgba(45,158,95,0.08)' : 'rgba(45,158,95,0.06)',
            borderRadius: 12, padding: '12px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, color: isDark ? '#5e5045' : '#b0a090', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ინგრედიენტები</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#2d9e5f' }}>₾ {total.toFixed(2)}</div>
          </div>
          <div style={{
            background: isDark ? 'rgba(45,158,95,0.08)' : 'rgba(45,158,95,0.06)',
            borderRadius: 12, padding: '12px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, color: isDark ? '#5e5045' : '#b0a090', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>1 ულუფა</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#2d9e5f' }}>₾ {total.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
        <button onClick={clear} style={{
          padding: '14px',
          background: isDark ? '#242424' : '#f8f6f2',
          color: isDark ? '#9e9080' : '#7a6a55',
          border: `1.5px solid ${isDark ? '#2a2a2a' : '#ede8e0'}`,
          borderRadius: 14, fontSize: 13, fontWeight: 700,
          cursor: 'pointer',
          fontFamily: "'Noto Sans Georgian', sans-serif",
        }}>🗑️ გასუფთავება</button>
        <button onClick={save} disabled={loading} style={{
          padding: '14px',
          background: '#2d9e5f', color: '#fff',
          border: 'none', borderRadius: 14,
          fontSize: 14, fontWeight: 800, cursor: 'pointer',
          fontFamily: "'Noto Sans Georgian', sans-serif",
          letterSpacing: '-0.01em',
          boxShadow: '0 4px 16px rgba(45,158,95,0.35)',
        }}>
          {loading ? '...' : '💾 შენახვა'}
        </button>
      </div>

      {showBulkModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 80,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'flex-end',
          backdropFilter: 'blur(4px)',
        }} onClick={e => e.target === e.currentTarget && setShowBulkModal(false)}>
          <div style={{
            background: isDark ? '#1e1e1e' : '#ffffff',
            borderRadius: '24px 24px 0 0',
            padding: '20px 16px 48px',
            width: '100%', maxHeight: '72vh',
            overflowY: 'auto',
            animation: 'slideUp 0.3s cubic-bezier(0.32,0.72,0,1)',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
          }}>
            <div style={{ width: 36, height: 4, background: isDark ? '#2a2a2a' : '#ede8e0', borderRadius: 2, margin: '0 auto 18px' }} />
            <div style={{
              fontSize: 15, fontWeight: 800, color: isDark ? '#f2ede6' : '#1a1410',
              marginBottom: 14, letterSpacing: '-0.02em',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <BulkFabLogo size={28} />
              ნახევრადფაბრიკატის არჩევა
            </div>
            {bulkList.length === 0 ? (
              <div style={{ textAlign: 'center', color: isDark ? '#5e5045' : '#b0a090', padding: 32 }}>ნახევრადფაბრიკატი არ მოიძებნა</div>
            ) : bulkList.map(b => (
              <div key={b.id} onClick={() => insertBulk(b)} style={{
                padding: '14px 16px',
                background: isDark ? '#242424' : '#f8f6f2',
                border: `1.5px solid ${isDark ? '#2a2a2a' : '#ede8e0'}`,
                borderRadius: 14, marginBottom: 8, cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: isDark ? '#f2ede6' : '#1a1410', marginBottom: 4 }}>{b.name}</div>
                <div style={{ fontSize: 12, color: isDark ? '#9e9080' : '#7a6a55' }}>
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