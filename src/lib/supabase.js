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
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('password_hash', password)
    .eq('active', true)
    .single()

  if (error || !data) return { error: 'არასწორი email ან პაროლი' }
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