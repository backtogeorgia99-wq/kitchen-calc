import { useState, useEffect, useCallback } from 'react'

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
    success: { border: 'var(--green)', color: 'var(--green)' },
    error: { border: 'var(--red)', color: 'var(--red)' },
    info: { border: 'var(--accent)', color: 'var(--accent)' },
  }
  const c = colors[toast.type] || colors.success

  return (
    <div style={{
      position: 'fixed', bottom: 28, left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--surface2)',
      border: `1px solid ${c.border}`,
      borderRadius: 'var(--radius)',
      padding: '11px 22px',
      color: c.color,
      fontSize: 13, fontWeight: 700,
      zIndex: 300, whiteSpace: 'nowrap',
      boxShadow: 'var(--shadow)',
      animation: 'fadeIn 0.25s ease',
      maxWidth: 'calc(100vw - 48px)',
    }}>
      {toast.msg}
    </div>
  )
}
