import { supabase } from './supabase'

export async function logAudit(user, action, entityType, entityId, meta = {}) {
  try {
    await supabase.from('audit_log').insert({
      actor_email: user?.email || null,
      actor_id: user?.id || null,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      meta: typeof meta === 'object' && meta ? meta : {},
    })
  } catch {
    /* ჟურნალი არ უნდა გააფუჭოს მთავარი ოპერაცია */
  }
}
