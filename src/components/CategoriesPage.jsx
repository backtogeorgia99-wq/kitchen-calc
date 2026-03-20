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
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    setBulkCats((data || []).filter(c => c.type === 'bulk'))
    setPortionCats((data || []).filter(c => c.type === 'portion'))
    setLoading(false)
  }

  const add = async (type, name) => {
    if (!name.trim()) { showToast('სახელი სავალდებულოა', 'error'); return }
    const { error } = await supabase.from('categories').insert({ name: name.trim(), type })
    if (error) { showToast('შეცდომა: ' + error.message, 'error'); return }
    showToast('✅ დაემატა!')
    if (type === 'bulk') setNewBulk('')
    else setNewPortion('')
    load()
  }

  const startEdit = (cat) => {
    setEditingId(cat.id)
    setEditingName(cat.name)
  }

  const saveEdit = async (id) => {
    if (!editingName.trim()) { showToast('სახელი სავალდებულოა', 'error'); return }
    const { error } = await supabase
      .from('categories')
      .update({ name: editingName.trim() })
      .eq('id', id)
    if (error) { showToast('შეცდომა: ' + error.message, 'error'); return }
    showToast('✅ განახლდა!')
    setEditingId(null)
    load()
  }

  const remove = async (id) => {
    if (!window.confirm('წაიშალოს?')) return
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) { showToast('შეცდომა: ' + error.message, 'error'); return }
    showToast('✅ წაიშალა!')
    load()
  }

  const s = {
    page: { padding: '14px 14px 48px', animation: 'fadeIn 0.2s ease' },
    card: {
      background: isDark ? '#181818' : '#ffffff',
      border: `1px solid ${isDark ? '#2e2e2e' : '#e0d8cc'}`,
      borderRadius: 14, padding: '14px', marginBottom: 12,
    },
    cardTitle: {
      fontSize: 13, fontWeight: 700,
      marginBottom: 14,
      display: 'flex', alignItems: 'center', gap: 8,
    },
    item: {
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 8,
      padding: '10px 0',
      borderBottom: `1px solid ${isDark ? '#2e2e2e' : '#f0e8dc'}`,
    },
    itemName: {
      fontSize: 14, color: isDark ? '#f2ede6' : '#2a1f0f',
      flex: 1,
    },
    editInput: {
      flex: 1, padding: '7px 10px',
      background: isDark ? '#202020' : '#f5f0e8',
      border: `1px solid #e8960f`,
      borderRadius: 8, color: isDark ? '#f2ede6' : '#2a1f0f',
      fontSize: 13, outline: 'none',
      fontFamily: "'Noto Sans Georgian', sans-serif",
    },
    btnEdit: {
      padding: '5px 10px',
      background: 'rgba(232,150,15,0.12)',
      border: '1px solid rgba(232,150,15,0.3)',
      borderRadius: 7, color: '#e8960f',
      fontSize: 11, fontWeight: 600, cursor: 'pointer',
      fontFamily: "'Noto Sans Georgian', sans-serif",
    },
    btnSave: {
      padding: '5px 10px',
      background: 'rgba(74,184,106,0.12)',
      border: '1px solid rgba(74,184,106,0.3)',
      borderRadius: 7, color: '#4ab86a',
      fontSize: 11, fontWeight: 600, cursor: 'pointer',
      fontFamily: "'Noto Sans Georgian', sans-serif",
    },
    btnDelete: {
      padding: '5px 10px',
      background: 'rgba(224,80,80,0.1)',
      border: '1px solid rgba(224,80,80,0.25)',
      borderRadius: 7, color: '#e05050',
      fontSize: 11, fontWeight: 600, cursor: 'pointer',
      fontFamily: "'Noto Sans Georgian', sans-serif",
    },
    addRow: {
      display: 'flex', gap: 8, marginTop: 12,
    },
    addInput: {
      flex: 1, padding: '10px 12px',
      background: isDark ? '#202020' : '#f5f0e8',
      border: `1px solid ${isDark ? '#2e2e2e' : '#e0d8cc'}`,
      borderRadius: 9, color: isDark ? '#f2ede6' : '#2a1f0f',
      fontSize: 13, outline: 'none',
      fontFamily: "'Noto Sans Georgian', sans-serif",
    },
    addBtn: {
      padding: '10px 16px',
      background: '#e8960f', color: '#000',
      border: 'none', borderRadius: 9,
      fontSize: 13, fontWeight: 700, cursor: 'pointer',
      fontFamily: "'Noto Sans Georgian', sans-serif",
    },
    noAccess: {
      textAlign: 'center', padding: '48px 24px',
      color: isDark ? '#5e5045' : '#a09080',
    },
    spinner: {
      width: 28, height: 28,
      border: `2px solid ${isDark ? '#2e2e2e' : '#e0d8cc'}`,
      borderTopColor: '#e8960f',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      margin: '40px auto',
    },
  }

  if (loading) return <div style={s.page}><div style={s.spinner} /></div>

  if (!canEditCats) return (
    <div style={s.page}>
      <div style={s.noAccess}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>წვდომა შეზღუდულია</div>
        <div style={{ fontSize: 12, marginTop: 6 }}>მხოლოდ შეფი და ადმინი</div>
      </div>
    </div>
  )

  const renderList = (cats, type) => (
    <div>
      {cats.length === 0 && (
        <div style={{ fontSize: 13, color: isDark ? '#5e5045' : '#a09080', padding: '12px 0' }}>
          კატეგორია არ არის
        </div>
      )}
      {cats.map(cat => (
        <div key={cat.id} style={s.item}>
          {editingId === cat.id ? (
            <>
              <input
                style={s.editInput}
                value={editingName}
                onChange={e => setEditingName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveEdit(cat.id)}
                autoFocus
              />
              <button style={s.btnSave} onClick={() => saveEdit(cat.id)}>✓</button>
              <button style={s.btnDelete} onClick={() => setEditingId(null)}>✕</button>
            </>
          ) : (
            <>
              <span style={s.itemName}>{cat.name}</span>
              <button style={s.btnEdit} onClick={() => startEdit(cat)}>✏️</button>
              <button style={s.btnDelete} onClick={() => remove(cat.id)}>🗑️</button>
            </>
          )}
        </div>
      ))}
      <div style={s.addRow}>
        <input
          style={s.addInput}
          placeholder="ახალი კატეგორია..."
          value={type === 'bulk' ? newBulk : newPortion}
          onChange={e => type === 'bulk' ? setNewBulk(e.target.value) : setNewPortion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add(type, type === 'bulk' ? newBulk : newPortion)}
        />
        <button
          style={s.addBtn}
          onClick={() => add(type, type === 'bulk' ? newBulk : newPortion)}
        >
          + დამატება
        </button>
      </div>
    </div>
  )

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={{ ...s.cardTitle, color: '#4a90e0' }}>
          🧪 ნახევრადფაბრიკატის კატეგორიები
        </div>
        {renderList(bulkCats, 'bulk')}
      </div>

      <div style={s.card}>
        <div style={{ ...s.cardTitle, color: '#4ab86a' }}>
          🍽️ 1 ულუფის კატეგორიები
        </div>
        {renderList(portionCats, 'portion')}
      </div>
    </div>
  )
}