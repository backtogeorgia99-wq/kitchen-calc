import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// მომხმარებლის შესვლა
export async function loginUser(email, password) {
  const url = import.meta.env.VITE_SUPABASE_URL || ''
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  const keyBad = !key || key === 'your-anon-key-here' || key.length < 20
  if (!url || url.includes('your-project') || keyBad) {
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
  const u = localStorage.getItem('current_user')
  return u ? JSON.parse(u) : null
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