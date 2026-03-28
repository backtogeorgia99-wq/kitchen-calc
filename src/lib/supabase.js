import { createClient } from '@supabase/supabase-js'

function readSupabaseEnv() {
  const url = (import.meta.env.VITE_SUPABASE_URL || '').trim()
  const key = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()
  return { url, key }
}

/** ლოკალური dev / Vercel — ორივე ცვლადი სწორად უნდა იყოს დაყენებული */
export function isSupabaseConfigured() {
  const { url, key } = readSupabaseEnv()
  const keyBad = !key || key === 'your-anon-key-here' || key.length < 20
  return Boolean(url && !url.includes('your-project') && !keyBad)
}

const { url: envUrl, key: envKey } = readSupabaseEnv()
const configured = isSupabaseConfigured()

// ცარიელი URL-ზე createClient იჭრება — placeholder მხოლოდ იმისთვის, რომ აპი ჩაიტვირთოს; მოთხოვნები იმუშავებს მხოლოდ configured === true
const clientUrl = configured
  ? envUrl
  : 'https://placeholder-not-configured.supabase.co'
const clientKey = configured
  ? envKey
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.local-dev-copy-env-example-to-dot-env-and-restart-vite_dev_server_only'

export const supabase = createClient(clientUrl, clientKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// მომხმარებლის შესვლა
export async function loginUser(email, password) {
  if (!isSupabaseConfigured()) {
    return {
      error: 'დააყენეთ .env: ნამდვილი VITE_SUPABASE_URL და VITE_SUPABASE_ANON_KEY (Supabase → Settings → API).',
    }
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.trim())
    .eq('password_hash', password)
    .eq('active', true)
    .maybeSingle()

  if (error) {
    const msg = (error.message || '').toLowerCase()
    if (msg.includes('relation') && msg.includes('users')) {
      return {
        error: 'ცხრილი users არ არსებობს — გაუშვით განახლებული supabase_schema.sql SQL Editor-ში.',
      }
    }
    if (error.code === 'PGRST301' || msg.includes('jwt')) {
      return { error: 'არასწორი Supabase გასაღები — შეამოწმეთ VITE_SUPABASE_ANON_KEY .env-ში.' }
    }
    return { error: error.message || 'შეცდომა ბაზასთან' }
  }
  if (!data) return { error: 'არასწორი email ან პაროლი' }
  return { user: data }
}

// მიმდინარე მომხმარებლის შენახვა
export function saveCurrentUser(user) {
  localStorage.setItem('current_user', JSON.stringify(user))
}

export function getCurrentUser() {
  try {
    const u = localStorage.getItem('current_user')
    if (!u) return null
    return JSON.parse(u)
  } catch {
    try {
      localStorage.removeItem('current_user')
    } catch { /* ignore */ }
    return null
  }
}

export function logoutUser() {
  localStorage.removeItem('current_user')
}

// როლის შემოწმება
export function canEdit(user) {
  return user && (user.role === 'admin' || user.role === 'chef')
}

/** ფასის (₾/კგ) ჩაწერა — მხოლოდ ადმინი */
export function canEditPrices(user) {
  return user && user.role === 'admin'
}