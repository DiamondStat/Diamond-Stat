import { supabase } from './supabase'

export async function checkAndIncrementUses() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { allowed: false, uses: 0 }

  // Check current uses
  const { data: profile } = await supabase
    .from('profiles')
    .select('ai_uses, is_paid')
    .eq('id', user.id)
    .single()

  // If paid user always allow
  if (profile?.is_paid) return { allowed: true, uses: profile.ai_uses, isPaid: true }

  const currentUses = profile?.ai_uses || 0

  // If under limit allow and increment
  if (currentUses < 5) {
    await supabase.rpc('increment_ai_uses', { user_uuid: user.id })
    return { allowed: true, uses: currentUses + 1, isPaid: false }
  }

  // Over limit block
  return { allowed: false, uses: currentUses, isPaid: false }
}

export async function getUses() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { uses: 0, isPaid: false }

  const { data: profile } = await supabase
    .from('profiles')
    .select('ai_uses, is_paid')
    .eq('id', user.id)
    .single()

  return {
    uses: profile?.ai_uses || 0,
    isPaid: profile?.is_paid || false
  }
}