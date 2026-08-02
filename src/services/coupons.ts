import { couponCollection } from './db'
import { USE_SUPABASE, supabase } from '../supabase/client'
import type { Coupon } from '../types/content'

export async function redeemCoupon(code: string, uid: string): Promise<Coupon> {
  if (USE_SUPABASE && supabase) {
    // Check coupon
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('active', true)
      .maybeSingle()

    if (error) throw error
    if (!data) throw new Error('Kupon tidak valid atau sudah kedaluwarsa.')
    if (data.current_uses >= data.max_uses) throw new Error('Kupon ini sudah mencapai batas penggunaan.')
    if (data.expires_at && data.expires_at < Date.now()) throw new Error('Kupon ini sudah kedaluwarsa.')

    // Update coupon uses
    const { error: upError } = await supabase
      .from('coupons')
      .update({ current_uses: data.current_uses + 1 })
      .eq('id', data.id)
    if (upError) throw upError

    // Grant premium to user
    const expireDate = data.duration_days
      ? new Date(Date.now() + data.duration_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : null

    const { error: userError } = await supabase
      .from('profiles')
      .update({
        premium: true,
        premium_plan: data.plan,
        premium_expire: expireDate
      })
      .eq('id', uid)
    if (userError) throw userError

    return data as any
  } else {
    const all = await couponCollection.list()
    const found = all.find(c => c.code === code.toUpperCase() && c.active)
    if (!found) throw new Error('Kupon tidak valid.')
    if (found.currentUses >= found.maxUses) throw new Error('Kupon sudah habis.')

    await couponCollection.update(found.id, { currentUses: found.currentUses + 1 })
    // Local mode user update would happen in the calling component via AuthContext
    return found
  }
}
