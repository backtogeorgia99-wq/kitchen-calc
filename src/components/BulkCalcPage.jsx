import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { logAudit } from '../lib/auditLog'
import IngredientTable from './IngredientTable'
import BulkFabLogo from './BulkFabLogo'
import { showToast } from './Toast'
import { lux } from '../theme/luxury'

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

  const inp = { ...lux.inp }

  const card = { ...lux.card }

  const lbl = { ...lux.lbl }

  const qtyInp = {
    ...inp,
    color: 'var(--qty-red)',
    fontWeight: 800,
    background: isDark ? 'rgba(255,138,128,0.06)' : 'var(--qty-red-muted)',
    borderColor: isDark ? 'rgba(255,138,128,0.22)' : 'rgba(198,40,40,0.2)',
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
          color: 'var(--accent-bright)', marginBottom: 18,
          display: 'flex', alignItems: 'center', gap: 10,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          <BulkFabLogo size={36} />
          <span>ნახევრადფაბრიკატი</span>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>სახელი *</label>
          <input style={inp} value={name} onChange={e => setName(e.target.value)}
            placeholder="მაგ: ქათმის ბულიონი"
            onFocus={e => { e.target.style.borderColor = 'var(--accent-bright)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)' }}
            onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = 'none' }}
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
            <label style={{ ...lbl, color: 'var(--qty-red)' }}>ულუფების რაოდ.</label>
            <input style={qtyInp}
              type="number" min="1" value={servings}
              onChange={e => {
                setServings(e.target.value)
                const sv = parseFloat(e.target.value)
                const ya = parseFloat(yieldAmt)
                if (sv > 0 && ya > 0) setPortionWeight((ya / sv).toFixed(3))
              }}
              placeholder="ავტომატური"
              onFocus={e => { e.target.style.borderColor = '#dc4444' }}
              onBlur={e => { e.target.style.borderColor = isDark ? 'rgba(255,138,128,0.22)' : 'rgba(198,40,40,0.2)' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ ...lbl, color: 'var(--qty-red)' }}>გამოსავლიანობა</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input style={qtyInp} type="number" min="0" step="0.001"
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
                onFocus={e => { e.target.style.borderColor = '#dc4444' }}
                onBlur={e => { e.target.style.borderColor = isDark ? 'rgba(255,138,128,0.22)' : 'rgba(198,40,40,0.2)' }}
              />
              <select style={{ ...inp, width: 64, flexShrink: 0 }}
                value={yieldUnit} onChange={e => setYieldUnit(e.target.value)}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ ...lbl, color: 'var(--qty-red)' }}>1 ულუფის წონა</label>
            <input style={qtyInp}
              type="number" min="0" step="0.001"
              value={portionWeight}
              onChange={e => {
                setPortionWeight(e.target.value)
                const pw = parseFloat(e.target.value)
                const ya = parseFloat(yieldAmt)
                if (pw > 0 && ya > 0) setServings(String(Math.round(ya / pw)))
              }}
              placeholder="0.000"
              onFocus={e => { e.target.style.borderColor = '#dc4444' }}
              onBlur={e => { e.target.style.borderColor = isDark ? 'rgba(255,138,128,0.22)' : 'rgba(198,40,40,0.2)' }}
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
          🥩 ინგრედიენტები <span style={{ fontSize: 11, color: 'var(--qty-red)', fontWeight: 800 }}>კგ-ში</span>
        </div>
        <IngredientTable ingredients={ingredients} onChange={setIngredients} theme={theme} user={user} />
      </div>

      {/* SUMMARY */}
      <div style={{
        background: 'var(--surface-shine)',
        borderRadius: 22,
        border: '1px solid var(--border-accent)',
        boxShadow: 'var(--shadow-card)',
        padding: '18px 18px',
        marginBottom: 16,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div style={{
            background: 'var(--accent-dim)',
            borderRadius: 14, padding: '14px',
            textAlign: 'center',
            border: '1px solid var(--border-card)',
          }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 800, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.12em' }}>ჯამი</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent-bright)', letterSpacing: '-0.02em' }}>₾ {total.toFixed(2)}</div>
          </div>
          <div style={{
            background: 'var(--accent-dim)',
            borderRadius: 14, padding: '14px',
            textAlign: 'center',
            border: '1px solid var(--border-card)',
          }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 800, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.12em' }}>1 ულუფა</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent-bright)', letterSpacing: '-0.02em' }}>₾ {perServing.toFixed(2)}</div>
          </div>
        </div>
        {yld > 0 && (
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text2)' }}>
            1 {yieldUnit}-ს ღირებულება:{' '}
            <span style={{ fontWeight: 800, color: 'var(--accent-bright)' }}>₾ {perUnit.toFixed(4)}</span>
          </div>
        )}
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
        }}>
          🗑️ გასუფთავება
        </button>
        <button type="button" onClick={save} disabled={loading} style={{
          padding: '15px',
          background: 'var(--accent-gradient)',
          color: '#1a1410',
          border: '1px solid var(--border-accent)',
          borderRadius: 14,
          fontSize: 13, fontWeight: 800,
          cursor: loading ? 'wait' : 'pointer',
          fontFamily: "'Noto Sans Georgian', sans-serif",
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          boxShadow: '0 6px 24px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.4)',
          opacity: loading ? 0.85 : 1,
        }}>
          {loading ? '...' : '💾 შენახვა'}
        </button>
      </div>
    </div>
  )
}