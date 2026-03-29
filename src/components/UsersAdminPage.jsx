import { useState, useEffect } from 'react'
import { supabase, getCurrentUser, saveCurrentUser } from '../lib/supabase'
import { logAudit } from '../lib/auditLog'
import { showToast } from './Toast'

const ROLES = [
  { value: 'admin', label: '🔑 ადმინი', hint: 'სრული წვდომა, ადმინ პანელი' },
  { value: 'chef', label: '👨‍🍳 შეფი', hint: 'კალკულაცია + კატეგორიები' },
  { value: 'cook', label: '👤 მზარეული', hint: 'კალკულაცია, კატეგორიების რედაქტირება არა' },
]

export default function UsersAdminPage({ user: adminUser, theme, onBack }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [formEmail, setFormEmail] = useState('')
  const [formName, setFormName] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formRole, setFormRole] = useState('cook')
  const [formActive, setFormActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [roleSavingId, setRoleSavingId] = useState(null)

  const isDark = theme === 'dark'

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role, active, created_at')
      .order('created_at', { ascending: false })
    if (error) {
      showToast('შეცდომა: ' + error.message, 'error')
      setRows([])
    } else {
      setRows(data || [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const resolvedName = (emailVal, nameVal) => {
    const n = (nameVal || '').trim()
    if (n) return n
    const local = (emailVal || '').split('@')[0]?.trim()
    return local || 'მომხმარებელი'
  }

  const resetForm = () => {
    setEditingId(null)
    setFormEmail('')
    setFormName('')
    setFormPassword('')
    setFormRole('cook')
    setFormActive(true)
  }

  const startAdd = () => {
    resetForm()
    setEditingId('new')
  }

  const startEdit = (row) => {
    setEditingId(row.id)
    setFormEmail(row.email)
    setFormName(row.name ?? '')
    setFormPassword('')
    setFormRole(row.role)
    setFormActive(row.active)
  }

  const save = async () => {
    const email = formEmail.trim()
    const name = resolvedName(email, formName)
    if (!email) { showToast('Email სავალდებულოა', 'error'); return }
    if (editingId === 'new' && !formPassword.trim()) {
      showToast('ახალი მომხმარებლისთვის პაროლი სავალდებულოა', 'error')
      return
    }

    setSaving(true)
    try {
      if (editingId === 'new') {
        const { data: created, error } = await supabase.from('users').insert({
          email,
          name,
          password_hash: formPassword,
          role: formRole,
          active: formActive,
        }).select('id').single()
        if (error) throw error
        await logAudit(adminUser, 'user_create', 'user', created?.id, { email, name, role: formRole })
        showToast('✅ მომხმარებელი დაემატა')
        resetForm()
      } else {
        const payload = { email, name, role: formRole, active: formActive }
        if (formPassword.trim()) payload.password_hash = formPassword.trim()
        const { error } = await supabase.from('users').update(payload).eq('id', editingId)
        if (error) throw error
        await logAudit(adminUser, 'user_update', 'user', editingId, { email, name, role: formRole })
        showToast('✅ განახლდა')

        const me = getCurrentUser()
        if (me?.id === editingId) {
          const { data: fresh } = await supabase
            .from('users')
            .select('*')
            .eq('id', editingId)
            .single()
          if (fresh) saveCurrentUser(fresh)
        }
        resetForm()
      }
      await load()
    } catch (e) {
      showToast(e.message || 'შეცდომა', 'error')
    }
    setSaving(false)
  }

  const assignRole = async (row, newRole) => {
    if (newRole === row.role) return
    if (row.id === adminUser?.id && newRole !== 'admin') {
      if (!window.confirm('თქვენს ანგარიშს სხვა როლი მიენიჭება — ადმინ პანელი შეიძლება აღარ ჩანდეს. გაგრძელება?')) {
        return
      }
    }
    setRoleSavingId(row.id)
    const { error } = await supabase.from('users').update({ role: newRole }).eq('id', row.id)
    setRoleSavingId(null)
    if (error) {
      showToast('როლი: ' + error.message, 'error')
      return
    }
    showToast('✅ როლი მიენიჭა')
    await logAudit(adminUser, 'user_role', 'user', row.id, { email: row.email, role: newRole })
    const me = getCurrentUser()
    if (me?.id === row.id) {
      const { data: fresh } = await supabase.from('users').select('*').eq('id', row.id).single()
      if (fresh) saveCurrentUser(fresh)
    }
    await load()
  }

  const remove = async (row) => {
    if (row.id === adminUser?.id) {
      showToast('საკუთარი თავი ვერ წაშლით', 'error')
      return
    }
    if (!window.confirm(`წაიშალოს "${row.email}"?`)) return
    const { error } = await supabase.from('users').delete().eq('id', row.id)
    if (error) { showToast('შეცდომა: ' + error.message, 'error'); return }
    await logAudit(adminUser, 'user_delete', 'user', row.id, { email: row.email })
    showToast('✅ წაიშალა')
    if (editingId === row.id) resetForm()
    load()
  }

  const inp = {
    padding: '11px 14px',
    background: isDark ? '#242424' : '#f8f6f2',
    border: `1.5px solid ${isDark ? '#2a2a2a' : '#ede8e0'}`,
    borderRadius: 10,
    color: isDark ? '#f2ede6' : '#1a1410',
    fontSize: 13,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: "'Noto Sans Georgian', sans-serif",
  }

  const lbl = {
    fontSize: 10,
    fontWeight: 700,
    color: isDark ? '#7a6d60' : '#9a8a78',
    marginBottom: 6,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    display: 'block',
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

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        style={{
          marginBottom: 16,
          padding: '8px 0',
          background: 'none',
          border: 'none',
          color: isDark ? '#9e9080' : '#7a6a55',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: "'Noto Sans Georgian', sans-serif",
        }}
      >
        ← ადმინ პანელი
      </button>

      <div style={card}>
        <div style={{
          fontSize: 13,
          fontWeight: 800,
          color: '#c45c2a',
          marginBottom: 16,
          letterSpacing: '-0.01em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}>
          <span>👥 მომხმარებელთა ბაზა</span>
          {editingId !== 'new' && (
            <button
              type="button"
              onClick={startAdd}
              style={{
                padding: '8px 14px',
                background: 'var(--accent-gradient)',
                color: '#000',
                border: 'none',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: "'Noto Sans Georgian', sans-serif",
              }}
            >
              + დამატება
            </button>
          )}
        </div>

        <div style={{
          marginBottom: 16,
          padding: 12,
          borderRadius: 12,
          background: isDark ? 'rgba(72,209,204,0.08)' : 'rgba(72,209,204,0.1)',
          border: `1px solid ${isDark ? 'rgba(72,209,204,0.18)' : 'rgba(72,209,204,0.28)'}`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent-bright)', marginBottom: 8 }}>
            როლების მინიჭება
          </div>
          <div style={{ fontSize: 11, lineHeight: 1.5, color: isDark ? '#9e9080' : '#7a6a55' }}>
            {ROLES.map(r => (
              <div key={r.value}><strong style={{ color: isDark ? '#d4c4b0' : '#5c4a3a' }}>{r.label}</strong> — {r.hint}</div>
            ))}
          </div>
        </div>

        {(editingId === 'new' || (editingId && editingId !== 'new')) && (
          <div style={{
            marginBottom: 20,
            padding: 16,
            borderRadius: 14,
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent-bright)', marginBottom: 14 }}>
              {editingId === 'new' ? 'ახალი მომხმარებელი' : 'რედაქტირება'}
            </div>
            <label style={lbl}>Email</label>
            <input
              type="email"
              style={{ ...inp, marginBottom: 12 }}
              value={formEmail}
              onChange={e => setFormEmail(e.target.value)}
              placeholder="email@example.com"
            />
            <label style={{ ...lbl, textTransform: 'none', letterSpacing: '0' }}>
              სახელი <span style={{ fontWeight: 500, opacity: 0.85 }}>(ცარიელი დატოვებისას — email-ის ნაწილი @-მდე)</span>
            </label>
            <input
              type="text"
              style={{ ...inp, marginBottom: 12 }}
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="მაგ. გიორგი"
            />
            <label style={lbl}>
              პაროლი {editingId !== 'new' && <span style={{ fontWeight: 500, textTransform: 'none' }}>(დატოვეთ ცარიელი თუ არ იცვლება)</span>}
            </label>
            <input
              type="password"
              style={{ ...inp, marginBottom: 12 }}
              value={formPassword}
              onChange={e => setFormPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <label style={lbl}>როლის მინიჭება</label>
            <select
              style={{ ...inp, marginBottom: 12, cursor: 'pointer' }}
              value={formRole}
              onChange={e => setFormRole(e.target.value)}
            >
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <label style={{ ...lbl, textTransform: 'none', letterSpacing: '0' }}>
              <input
                type="checkbox"
                checked={formActive}
                onChange={e => setFormActive(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              აქტიური (შესვლა ნებადართული)
            </label>
            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              <button
                type="button"
                disabled={saving}
                onClick={save}
                style={{
                  padding: '10px 18px',
                  background: saving ? 'var(--accent2)' : 'var(--accent-gradient)',
                  color: '#000',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: saving ? 'wait' : 'pointer',
                  fontFamily: "'Noto Sans Georgian', sans-serif",
                }}
              >
                შენახვა
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: '10px 16px',
                  background: 'transparent',
                  border: `1.5px solid ${isDark ? '#3a3a3a' : '#ddd8cf'}`,
                  borderRadius: 10,
                  color: isDark ? '#9e9080' : '#7a6a55',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Noto Sans Georgian', sans-serif",
                }}
              >
                გაუქმება
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <div style={{
              width: 28, height: 28,
              border: `3px solid ${isDark ? '#2a2a2a' : '#ede8e0'}`,
              borderTopColor: 'var(--accent-bright)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
          </div>
        ) : (
          rows.map(row => (
            <div
              key={row.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 0',
                borderBottom: `1px solid ${isDark ? '#242424' : '#f0ede8'}`,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: isDark ? '#f2ede6' : '#1a1410',
                }}>
                  {row.name?.trim() ? row.name : (row.email || '').split('@')[0] || row.email}
                </div>
                <div style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: isDark ? '#8a7a6a' : '#8a7a6a',
                  marginTop: 2,
                }}>
                  {row.email}
                </div>
                <div style={{ fontSize: 11, color: isDark ? '#6a5c50' : '#a09080', marginTop: 4 }}>
                  {!row.active && 'არააქტიური · '}
                  {row.id === adminUser?.id && 'თქვენ · '}
                  <span style={{ opacity: 0.85 }}>{ROLES.find(r => r.value === row.role)?.hint}</span>
                </div>
              </div>
              <div style={{ minWidth: 148 }}>
                <label style={{ ...lbl, marginBottom: 4 }}>როლი</label>
                <select
                  value={row.role}
                  disabled={roleSavingId === row.id}
                  onChange={e => assignRole(row, e.target.value)}
                  style={{
                    ...inp,
                    padding: '8px 10px',
                    fontSize: 12,
                    cursor: roleSavingId === row.id ? 'wait' : 'pointer',
                    opacity: roleSavingId === row.id ? 0.7 : 1,
                  }}
                >
                  {ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => startEdit(row)}
                style={{
                  padding: '6px 12px',
                  background: isDark ? '#242424' : '#f8f6f2',
                  border: `1.5px solid ${isDark ? '#2a2a2a' : '#ede8e0'}`,
                  borderRadius: 9,
                  color: isDark ? '#9e9080' : '#7a6a55',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Noto Sans Georgian', sans-serif",
                }}
              >
                ✏️ რედაქტირება
              </button>
              <button
                type="button"
                onClick={() => remove(row)}
                style={{
                  padding: '6px 12px',
                  background: isDark ? 'rgba(220,68,68,0.1)' : 'rgba(220,68,68,0.06)',
                  border: '1.5px solid rgba(220,68,68,0.2)',
                  borderRadius: 9,
                  color: '#dc4444',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Noto Sans Georgian', sans-serif",
                }}
              >
                🗑️ წაშლა
              </button>
            </div>
          ))
        )}

        {!loading && rows.length === 0 && editingId !== 'new' && (
          <div style={{ fontSize: 13, color: isDark ? '#5e5045' : '#b0a090', padding: '8px 0 16px' }}>
            მომხმარებელი არ არის — დააჭირეთ „დამატება“
          </div>
        )}
      </div>
    </div>
  )
}
