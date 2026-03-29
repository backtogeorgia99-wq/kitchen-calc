import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { showToast } from './Toast'

export default function AuditLogPage({ theme, onBack }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const isDark = theme === 'dark'

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) {
      showToast('აუდიტი: ' + error.message, 'error')
      setRows([])
    } else {
      setRows(data || [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

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

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: isDark ? '#f2ede6' : '#1a1410' }}>
          აუდიტის ჟურნალი
        </div>
        <button
          type="button"
          onClick={load}
          style={{
            padding: '8px 14px',
            background: isDark ? '#242424' : '#f8f6f2',
            border: `1.5px solid ${isDark ? '#2a2a2a' : '#ede8e0'}`,
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            color: isDark ? '#f2ede6' : '#1a1410',
            fontFamily: "'Noto Sans Georgian', sans-serif",
          }}
        >
          განახლება
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: isDark ? '#5e5045' : '#b0a090' }}>იტვირთება...</div>
      ) : rows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: isDark ? '#5e5045' : '#b0a090', fontSize: 13 }}>
          ჩანაწერი არ არის. SQL-ში გაუშვით <code style={{ fontSize: 11 }}>audit_log</code> ცხრილი.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map(r => (
            <div
              key={r.id}
              style={{
                padding: 12,
                borderRadius: 12,
                background: isDark ? '#1e1e1e' : '#ffffff',
                border: `1px solid ${isDark ? '#2a2a2a' : '#ede8e0'}`,
                fontSize: 12,
              }}
            >
              <div style={{ fontWeight: 800, color: 'var(--accent-bright)', marginBottom: 4 }}>{r.action}</div>
              <div style={{ color: isDark ? '#9e9080' : '#7a6a55' }}>
                {r.entity_type}
                {r.entity_id ? ` · ${r.entity_id.slice(0, 8)}…` : ''}
              </div>
              <div style={{ color: isDark ? '#c4b8a8' : '#5c4a3a', marginTop: 4 }}>
                {r.actor_email || 'უცნობი'}
              </div>
              <div style={{ fontSize: 10, color: isDark ? '#4a4a4a' : '#c0c0c0', marginTop: 6 }}>
                {r.created_at ? new Date(r.created_at).toLocaleString('ka-GE') : ''}
              </div>
              {r.meta && Object.keys(r.meta).length > 0 && (
                <pre style={{
                  margin: '8px 0 0',
                  fontSize: 10,
                  overflow: 'auto',
                  color: isDark ? '#7a7a7a' : '#666',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}>
                  {JSON.stringify(r.meta, null, 0)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
