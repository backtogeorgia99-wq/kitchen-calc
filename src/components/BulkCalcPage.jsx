import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { logAudit } from '../lib/auditLog'
import IngredientTable from './IngredientTable'
import BulkFabLogo from './BulkFabLogo'
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

  const inp = {
    padding: '12px 14px',
    background: isDark ? '#242424' : '#f8f6f2',
    border: `1.5px solid ${isDark ? '#2a2a2a' : '#ede8e0'}`,
    borderRadius: 10,
    color: isDark ? '#f2ede6' : '#1a1410',
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
    padding: '18px',
    marginBottom: 14,
  }

  const lbl = {
    fontSize: 11, fontWeight: 700,
    color: isDark ? '#5e5045' : '#b0a090',
    marginBottom: 6,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    display: 'block',
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

    const { data: created, error } = await supabase.from('calculations').insert({
      type: 'bulk', name: name.trim(), category,
      servings: srv, yield_amount: yld || null, yield_unit: yieldUnit,
      ingredients: rows,
      total_cost: parseFloat(total.toFixed(4)),
      cost_per_serving: parseFloat(perServing.toFixed(4)),
      cost_per_unit: yld > 0 ? parseFloat(perUnit.toFixed(6)) : null,
      created_by: user?.email || user?.name,
    }).select('id').single()
    setLoading(false)
    if (error) { showToast('შეცდომა: ' + error.message, 'error'); return }
    await logAudit(user, 'create', 'calculation', created?.id, { name: name.trim(), type: 'bulk' })
    showToast('✅ წარმატებით შეინახა!')
    clear()
  }

  return (
    <div style={{ padding: '16px 16px 48px', animation: 'fadeUp 0.3s ease' }}>

      <div style={card}>
        <div style={{
          fontSize: 13, fontWeight: 800,
          color: '#e8960f', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 10,
          letterSpacing: '-0.01em',
        }}>
          <BulkFabLogo size={36} />
          <span>ნახევრადფაბრიკატი</span>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>სახელი *</label>
          <input style={inp} value={name} onChange={e => setName(e.target.value)}
            placeholder="მაგ: ქათმის ბულიონი"
            onFocus={e => e.target.style.borderColor = '#e8960f'}
            onBlur={e => e.target.style.borderColor = isDark ? '#2a2a2a' : '#ede8e0'}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div>
            <label style={lbl}>კატეგორია</label>
            <select style={inp} value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">-- აირჩიეთ --</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>ულუფების რაოდ.</label>
            <input style={{
              ...inp,
              color: servings ? '#e8960f' : (isDark ? '#f2ede6' : '#1a1410'),
              fontWeight: servings ? 700 : 400,
            }}
              type="number" min="1" value={servings}
              onChange={e => {
                setServings(e.target.value)
                const sv = parseFloat(e.target.value)
                const ya = parseFloat(yieldAmt)
                if (sv > 0 && ya > 0) setPortionWeight((ya / sv).toFixed(3))
              }}
              placeholder="ავტომატური"
              onFocus={e => e.target.style.borderColor = '#e8960f'}
              onBlur={e => e.target.style.borderColor = isDark ? '#2a2a2a' : '#ede8e0'}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={lbl}>გამოსავლიანობა</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input style={{ ...inp }} type="number" min="0" step="0.001"
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
                onFocus={e => e.target.style.borderColor = '#e8960f'}
                onBlur={e => e.target.style.borderColor = isDark ? '#2a2a2a' : '#ede8e0'}
              />
              <select style={{ ...inp, width: 64, flexShrink: 0 }}
                value={yieldUnit} onChange={e => setYieldUnit(e.target.value)}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={lbl}>1 ულუფის წონა</label>
            <input style={{
              ...inp,
              color: portionWeight ? '#e8960f' : (isDark ? '#f2ede6' : '#1a1410'),
              fontWeight: portionWeight ? 700 : 400,
            }}
              type="number" min="0" step="0.001"
              value={portionWeight}
              onChange={e => {
                setPortionWeight(e.target.value)
                const pw = parseFloat(e.target.value)
                const ya = parseFloat(yieldAmt)
                if (pw > 0 && ya > 0) setServings(String(Math.round(ya / pw)))
              }}
              placeholder="0.000"
              onFocus={e => e.target.style.borderColor = '#e8960f'}
              onBlur={e => e.target.style.borderColor = isDark ? '#2a2a2a' : '#ede8e0'}
            />
          </div>
        </div>
      </div>

      <div style={card}>
        <div style={{
          fontSize: 13, fontWeight: 800,
          color: isDark ? '#f2ede6' : '#1a1410',
          marginBottom: 14, letterSpacing: '-0.01em',
        }}>
          🥩 ინგრედიენტები <span style={{ fontSize: 11, color: isDark ? '#5e5045' : '#b0a090', fontWeight: 500 }}>კგ-ში</span>
        </div>
        <IngredientTable ingredients={ingredients} onChange={setIngredients} theme={theme} user={user} />
      </div>

      {/* SUMMARY */}
      <div style={{
        background: isDark
          ? 'linear-gradient(135deg, #1e1a14 0%, #1e1e1e 100%)'
          : 'linear-gradient(135deg, #fff8ee 0%, #ffffff 100%)',
        borderRadius: 20,
        border: `1.5px solid ${isDark ? 'rgba(232,150,15,0.2)' : 'rgba(232,150,15,0.25)'}`,
        padding: '16px 18px',
        marginBottom: 14,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div style={{
            background: isDark ? 'rgba(232,150,15,0.08)' : 'rgba(232,150,15,0.06)',
            borderRadius: 12, padding: '12px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, color: isDark ? '#5e5045' : '#b0a090', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ჯამი</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#e8960f' }}>₾ {total.toFixed(2)}</div>
          </div>
          <div style={{
            background: isDark ? 'rgba(232,150,15,0.08)' : 'rgba(232,150,15,0.06)',
            borderRadius: 12, padding: '12px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, color: isDark ? '#5e5045' : '#b0a090', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>1 ულუფა</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#e8960f' }}>₾ {perServing.toFixed(2)}</div>
          </div>
        </div>
        {yld > 0 && (
          <div style={{ textAlign: 'center', fontSize: 12, color: isDark ? '#9e9080' : '#7a6a55' }}>
            1 {yieldUnit}-ს ღირებულება: <span style={{ fontWeight: 700, color: '#e8960f' }}>₾ {perUnit.toFixed(4)}</span>
          </div>
        )}
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
        }}>
          🗑️ გასუფთავება
        </button>
        <button onClick={save} disabled={loading} style={{
          padding: '14px',
          background: '#e8960f', color: '#000',
          border: 'none', borderRadius: 14,
          fontSize: 14, fontWeight: 800,
          cursor: 'pointer',
          fontFamily: "'Noto Sans Georgian', sans-serif",
          letterSpacing: '-0.01em',
          boxShadow: '0 4px 16px rgba(232,150,15,0.35)',
        }}>
          {loading ? '...' : '💾 შენახვა'}
        </button>
      </div>
    </div>
  )
}