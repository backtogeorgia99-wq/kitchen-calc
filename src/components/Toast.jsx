import { useState, useCallback } from 'react'

let toastFn = null

export function useToast() {
  const [toast, setToast] = useState(null)

  const show = useCallback((msg, type = 'success') => {
    setToast({ msg, type, id: Date.now() })
    setTimeout(() => setToast(null), 3000)
  }, [])

  toastFn = show
  return { toast, show }
}

export function showToast(msg, type = 'success') {
  if (toastFn) toastFn(msg, type)
}

export function Toast({ toast }) {
  if (!toast) return null

  const colors = {
    success: { bg: 'var(--green-dim)', border: 'rgba(31,107,74,0.35)', color: 'var(--green-bright)' },
    error: { bg: 'var(--red-dim)', border: 'rgba(185,28,28,0.35)', color: 'var(--red)' },
    info: { bg: 'var(--accent-dim)', border: 'var(--border-accent)', color: 'var(--accent-bright)' },
  }
  const c = colors[toast.type] || colors.success

  return (
    <div style={{
      position: 'fixed', bottom: 90, left: '50%',
      transform: 'translateX(-50%)',
      background: c.bg,
      border: `1.5px solid ${c.border}`,
      borderRadius: 16,
      padding: '14px 22px',
      color: c.color,
      fontSize: 12, fontWeight: 800,
      letterSpacing: '0.04em',
      zIndex: 300, whiteSpace: 'nowrap',
      animation: 'fadeUp 0.25s ease',
      maxWidth: 'calc(100vw - 48px)',
      backdropFilter: 'blur(16px) saturate(1.2)',
      boxShadow: 'var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,0.12)',
      fontFamily: "'Noto Sans Georgian', sans-serif",
    }}>
      {toast.msg}
    </div>
  )
}