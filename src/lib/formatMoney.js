import { useState, useEffect } from 'react'
import { getAppSettings, SETTINGS_CHANGED_EVENT } from './appSettings'

export function useAppSettings() {
  const [s, setS] = useState(() => getAppSettings())
  useEffect(() => {
    const fn = () => setS(getAppSettings())
    window.addEventListener(SETTINGS_CHANGED_EVENT, fn)
    return () => window.removeEventListener(SETTINGS_CHANGED_EVENT, fn)
  }, [])
  return s
}

/** თვითღირებულებიდან სავარაუდო გასაყიდი: ჯერ markup, შემდეგ დღგ ზედ */
export function displaySellingPrice(baseCost, settings) {
  const c = parseFloat(baseCost) || 0
  const m = parseFloat(settings?.markupPercent) || 0
  const v = parseFloat(settings?.vatPercent) || 0
  const afterMarkup = c * (1 + m / 100)
  return afterMarkup * (1 + v / 100)
}

export function formatMoney(amount, settings) {
  const sym = settings?.currencySymbol ?? '₾'
  const n = parseFloat(amount) || 0
  return `${sym} ${n.toFixed(2)}`
}
