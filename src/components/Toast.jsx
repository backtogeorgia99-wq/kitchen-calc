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
    success: { bg: 'rgba(45,158,95,0.12)', border: 'rgba(45,158,95,0.3)', color: '#2d9e5f' },
    error: { bg: 'rgba(220,68,68,0.12)', border: 'rgba(220,68,68,0.3)', color: '#dc4444' },
    info: { bg: 'rgba(232,150,15,0.12)', border: 'rgba(232,150,15,0.3)', color: '#e8960f' },
  }
  const c = colors[toast.type] || colors.success

  return (
    <div style={{
      position: 'fixed', bottom: 90, left: '50%',
      transform: 'translateX(-50%)',
      background: c.bg,
      border: `1.5px solid ${c.border}`,
      borderRadius: 14,
      padding: '12px 20px',
      color: c.color,
      fontSize: 13, fontWeight: 700,
      zIndex: 300, whiteSpace: 'nowrap',
      animation: 'fadeUp 0.25s ease',
      maxWidth: 'calc(100vw - 48px)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      fontFamily: "'Noto Sans Georgian', sans-serif",
    }}>
      {toast.msg}
    </div>
  )
}