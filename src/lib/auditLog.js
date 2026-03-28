import { supabase } from './supabase'

export async function logAudit(user, action, entityType, entityId, meta = {}) {
  try {
    const { error } = await supabase.from('audit_log').insert({
      actor_email: user?.email || null,
      actor_id: user?.id || null,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      meta: typeof meta === 'object' && meta ? meta : {},
    })
    if (error) {
      // Supabase არ ყრის exception-ს — ცარიელი ჟურნალი ხშირად აქედანაა (RLS, არარსებული ცხრილი)
      console.error('[audit_log]', error.message)
    }
  } catch (e) {
    console.error('[audit_log]', e?.message || e)
  }
}
