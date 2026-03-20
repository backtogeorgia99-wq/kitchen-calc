import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { showToast } from './Toast'

export default function CategoriesPage({ user, theme }) {
  const [bulkCats, setBulkCats] = useState([])
  const [portionCats, setPortionCats] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [newBulk, setNewBulk] = useState('')
  const [newPortion, setNewPortion] = useState('')

  const isDark = theme === 'dark'
  const canEditCats = user?.role === 'admin' || user?.role === 'chef'

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('categories').select('*').order('name')
    setBulkCats((data || []).filter(c => c.type === 'bulk'))
    setPortionCats((data || []).filter(c => c.type === 'portion'))
    setLoading(false)
  }

  const add = async (type, name) => {
    if (!name.trim()) { showToast('სახელი სავალდებულოა', 'error'); return }
    const { error } = await supabase.from('categories').insert({ name: name.trim(), type })
    if (error) { showToast('შეცდომა', 'error'); return }
    showToast('✅ დაემატა!')
    if (type === 'bulk') { setNewBulk('') } else { setNewPortion('') }
    load()
  }

  const saveEdit = async (id) => {
    if (!editingName.trim()) { showToast('სახელი სავალდებულოა', 'error'); return }
    const { error } = await supabase.from('categories').update({ name: editingName.trim() }).eq('id', id)
    if (error) { showToast('შეცდომა', 'error'); return }
    showToast('✅ განახლდა!')
    setEditingId(null)
    load()
  }

  const remove = async (id) => {
    if (!window.confirm('წაიშალოს?')) return
    await supabase.from('categories').delete().eq('id', id)
    showToast('✅ წაიშალა!')
    load()
  }

  const card = {
    background: isDark ? '#1e1e1e' : '#ffffff',
    borderRadius: 20,
    boxShadow: isDark
      ? '0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)'
      : '0 4px 20px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
    padding: '18px', marginBottom: 14,
  }

  const inp = {
    padding: '11px 14px',
    background: isDark ? '#242424' : '#f8f6f2',
    border: `1.5px solid ${isDark ? '#2a2a2a' : '#ede8e0'}`,
    borderRadius: 10, color: isDark ? '#f2ede6' : '#1a1410',
    fontSize: 13, outline: 'none',
    fontFamily: "'Noto Sans Georgian', sans-serif",
    transition: 'border-color 0.2s',
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
      <div style={{
        width: 32, height: 32,
        border: `3px solid ${isDark ? '#2a2a2a' : '#ede8e0'}`,
        borderTopColor: '#e8960f',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  )

  if (!canEditCats) return (
    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 52, marginBottom: 14 }}>🔒</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: isDark ? '#f2ede6' : '#1a1410', marginBottom: 6 }}>წვდომა შეზღუდულია</div>
      <div style={{ fontSize: 12, color: isDark ? '#5e5045' : '#b0a090' }}>მხოლოდ შეფი და ადმინი</div>
    </div>
  )

  const renderList = (cats, type, accentColor) => (
    <div>
      {cats.map(cat => (
        <div key={cat.id} style={{
          display: 'flex', alignItems: 'center',
          gap: 8, padding: '10px 0',
          borderBottom: `1px solid ${isDark ? '#242424' : '#f0ede8'}`,
        }}>
          {editingId === cat.id ? (
            <>
              <input
                style={{ ...inp, flex: 1, borderColor: accentColor }}
                value={editingName}
                onChange={e => setEditingName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveEdit(cat.id)}
                autoFocus
              />
              <button onClick={() => saveEdit(cat.id)} style={{
                padding: '8px 14px',
                background: isDark ? 'rgba(45,158,95,0.12)' : 'rgba(45,158,95,0.08)',
                border: '1.5px solid rgba(45,158,95,0.25)',
                borderRadius: 10, color: '#2d9e5f',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                fontFamily: "'Noto Sans Georgian', sans-serif",
              }}>✓</button>
              <button onClick={() => setEditingId(null)} style={{
                padding: '8px 14px',
                background: isDark ? 'rgba(220,68,68,0.1)' : 'rgba(220,68,68,0.06)',
                border: '1.5px solid rgba(220,68,68,0.2)',
                borderRadius: 10, color: '#dc4444',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                fontFamily: "'Noto Sans Georgian', sans-serif",
              }}>✕</button>
            </>
          ) : (
            <>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: accentColor, flexShrink: 0,
              }} />
              <span style={{
                flex: 1, fontSize: 14,
                color: isDark ? '#f2ede6' : '#1a1410',
                fontWeight: 500,
              }}>{cat.name}</span>
              <button onClick={() => { setEditingId(cat.id); setEditingName(cat.name) }} style={{
                padding: '6px 12px',
                background: isDark ? '#242424' : '#f8f6f2',
                border: `1.5px solid ${isDark ? '#2a2a2a' : '#ede8e0'}`,
                borderRadius: 9, color: isDark ? '#9e9080' : '#7a6a55',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                fontFamily: "'Noto Sans Georgian', sans-serif",
              }}>✏️</button>
              <button onClick={() => remove(cat.id)} style={{
                padding: '6px 12px',
                background: isDark ? 'rgba(220,68,68,0.1)' : 'rgba(220,68,68,0.06)',
                border: '1.5px solid rgba(220,68,68,0.2)',
                borderRadius: 9, color: '#dc4444',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                fontFamily: "'Noto Sans Georgian', sans-serif",
              }}>🗑️</button>
            </>
          )}
        </div>
      ))}

      {cats.length === 0 && (
        <div style={{ fontSize: 13, color: isDark ? '#5e5045' : '#b0a090', padding: '12px 0' }}>
          კატეგორია არ არის
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <input
          style={{ ...inp, flex: 1 }}
          placeholder="ახალი კატეგორია..."
          value={type === 'bulk' ? newBulk : newPortion}
          onChange={e => type === 'bulk' ? setNewBulk(e.target.value) : setNewPortion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add(type, type === 'bulk' ? newBulk : newPortion)}
          onFocus={e => e.target.style.borderColor = accentColor}
          onBlur={e => e.target.style.borderColor = isDark ? '#2a2a2a' : '#ede8e0'}
        />
        <button
          onClick={() => add(type, type === 'bulk' ? newBulk : newPortion)}
          style={{
            padding: '11px 18px',
            background: accentColor,
            color: type === 'bulk' ? '#000' : '#fff',
            border: 'none', borderRadius: 10,
            fontSize: 13, fontWeight: 800,
            cursor: 'pointer',
            fontFamily: "'Noto Sans Georgian', sans-serif",
            boxShadow: `0 4px 12px ${accentColor}40`,
          }}>
          + დამატება
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ padding: '16px 16px 48px', animation: 'fadeUp 0.3s ease' }}>
      <div style={card}>
        <div style={{
          fontSize: 13, fontWeight: 800,
          color: '#2d6fe0', marginBottom: 16,
          letterSpacing: '-0.01em',
        }}>
          🧪 ნახევრადფაბრიკატის კატეგორიები
        </div>
        {renderList(bulkCats, 'bulk', '#2d6fe0')}
      </div>

      <div style={card}>
        <div style={{
          fontSize: 13, fontWeight: 800,
          color: '#2d9e5f', marginBottom: 16,
          letterSpacing: '-0.01em',
        }}>
          🍽️ 1 ულუფის კატეგორიები
        </div>
        {renderList(portionCats, 'portion', '#2d9e5f')}
      </div>
    </div>
  )
}