import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { showToast } from './Toast'
import { logAudit } from '../lib/auditLog'

function downloadJson(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

export default function BackupPage({ user, theme, onBack }) {
  const [busy, setBusy] = useState(false)
  const isDark = theme === 'dark'

  const exportAll = async () => {
    setBusy(true)
    try {
      const [calcs, cats, users] = await Promise.all([
        supabase.from('calculations').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
        supabase.from('users').select('id, email, name, role, active, created_at'),
      ])
      if (calcs.error) throw calcs.error
      if (cats.error) throw cats.error
      if (users.error) throw users.error

      const payload = {
        exported_at: new Date().toISOString(),
        calculations: calcs.data || [],
        categories: cats.data || [],
        users: users.data || [],
      }
      downloadJson(payload, `kitchen-calc-backup-${new Date().toISOString().slice(0, 10)}.json`)
      await logAudit(user, 'backup_export', 'system', null, {
        calculations: (calcs.data || []).length,
        categories: (cats.data || []).length,
        users: (users.data || []).length,
      })
      showToast('✅ JSON ჩამოტვირთულია')
    } catch (e) {
      showToast(String(e.message || e), 'error')
    }
    setBusy(false)
  }

  return (
    <div style={{ padding: '16px 16px 48px' }}>
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

      <div style={{ fontSize: 16, fontWeight: 800, color: isDark ? '#f2ede6' : '#1a1410', marginBottom: 8 }}>
        მონაცემების რეზერვი
      </div>
      <p style={{ fontSize: 12, color: isDark ? '#7a6d60' : '#9a8a78', marginBottom: 20, lineHeight: 1.6 }}>
        ჩამოტვირთეთ JSON: კალკულაციები, კატეგორიები, მომხმარებლები (პაროლების გარეშე).
        ფაილი შეინახეთ უსაფრთხო ადგილას. აღდგენა — ხელით Supabase Table Editor / SQL.
      </p>

      <button
        type="button"
        disabled={busy}
        onClick={exportAll}
        style={{
          width: '100%',
          padding: 16,
          background: busy ? '#888' : '#2d6fe0',
          color: '#fff',
          border: 'none',
          borderRadius: 14,
          fontSize: 15,
          fontWeight: 800,
          cursor: busy ? 'wait' : 'pointer',
          fontFamily: "'Noto Sans Georgian', sans-serif",
        }}
      >
        {busy ? 'იტვირთება...' : '⬇ ჩამოტვირთე სრული JSON რეზერვი'}
      </button>
    </div>
  )
}
