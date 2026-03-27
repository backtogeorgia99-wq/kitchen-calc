const KEY = 'kitchen_calc_settings'
const EVT = 'kitchen_calc_settings'

export const defaultAppSettings = () => ({
  currencySymbol: '₾',
  currencyCode: 'GEL',
  vatPercent: 0,
  markupPercent: 0,
})

export function getAppSettings() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultAppSettings()
    const p = JSON.parse(raw)
    return { ...defaultAppSettings(), ...p }
  } catch {
    return defaultAppSettings()
  }
}

export function setAppSettings(partial) {
  const next = { ...getAppSettings(), ...partial }
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(EVT))
  return next
}

export const SETTINGS_CHANGED_EVENT = EVT
