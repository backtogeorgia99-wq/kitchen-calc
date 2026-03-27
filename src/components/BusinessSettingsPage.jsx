import { useState, useEffect } from 'react'
import { getAppSettings, setAppSettings } from '../lib/appSettings'
import { showToast } from './Toast'

export default function BusinessSettingsPage({ theme, onBack }) {
  const isDark = theme === 'dark'
  const [currencySymbol, setCurrencySymbol] = useState('₾')
  const [vatPercent, setVatPercent] = useState(0)
  const [markupPercent, setMarkupPercent] = useState(0)

  useEffect(() => {
    const s = getAppSettings()
    setCurrencySymbol(s.currencySymbol || '₾')
    setVatPercent(s.vatPercent ?? 0)
    setMarkupPercent(s.markupPercent ?? 0)
  }, [])

  const save = () => {
    setAppSettings({
      currencySymbol: currencySymbol.trim() || '₾',
      vatPercent: Math.max(0, parseFloat(vatPercent) || 0),
      markupPercent: Math.max(0, parseFloat(markupPercent) || 0),
    })
    showToast('✅ პარამეტრები შეინახა')
  }

  const inp = {
    padding: '11px 14px',
    width: '100%',
    boxSizing: 'border-box',
    background: isDark ? '#242424' : '#f8f6f2',
    border: `1.5px solid ${isDark ? '#2a2a2a' : '#ede8e0'}`,
    borderRadius: 10,
    color: isDark ? '#f2ede6' : '#1a1410',
    fontSize: 14,
    fontFamily: "'Noto Sans Georgian', sans-serif",
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

      <div style={{
        fontSize: 16,
        fontWeight: 800,
        color: isDark ? '#f2ede6' : '#1a1410',
        marginBottom: 8,
      }}>
        ფასები · დღგ · მარჟა
      </div>
      <p style={{ fontSize: 12, color: isDark ? '#7a6d60' : '#9a8a78', marginBottom: 20, lineHeight: 1.5 }}>
        პარამეტრები ინახება ამ მოწყობილობაზე (ბრაუზერი). გასაყიდი ფასი = თვითღირებულება × (1 + მარჟა%) × (1 + დღგ%).
      </p>

      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: isDark ? '#5e5045' : '#b0a090', marginBottom: 6 }}>
        ვალუტის სიმბოლო
      </label>
      <input style={{ ...inp, marginBottom: 16 }} value={currencySymbol} onChange={e => setCurrencySymbol(e.target.value)} placeholder="₾" />

      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: isDark ? '#5e5045' : '#b0a090', marginBottom: 6 }}>
        მარჟა / ხარჯის ზრდა (%)
      </label>
      <input
        type="number"
        min={0}
        step={0.1}
        style={{ ...inp, marginBottom: 16 }}
        value={markupPercent}
        onChange={e => setMarkupPercent(e.target.value)}
      />

      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: isDark ? '#5e5045' : '#b0a090', marginBottom: 6 }}>
        დღგ (%)
      </label>
      <input
        type="number"
        min={0}
        step={0.1}
        style={{ ...inp, marginBottom: 20 }}
        value={vatPercent}
        onChange={e => setVatPercent(e.target.value)}
      />

      <button
        type="button"
        onClick={save}
        style={{
          width: '100%',
          padding: 14,
          background: '#e8960f',
          color: '#000',
          border: 'none',
          borderRadius: 14,
          fontSize: 15,
          fontWeight: 800,
          cursor: 'pointer',
          fontFamily: "'Noto Sans Georgian', sans-serif",
        }}
      >
        შენახვა
      </button>
    </div>
  )
}
