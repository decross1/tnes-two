import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { supabase } from './supabase'

export async function getAnonymousUserId(): Promise<string> {
  // Try to get from localStorage first
  if (typeof window !== 'undefined') {
    let userId = localStorage.getItem('anonymous_user_id')
    
    if (userId) {
      return userId
    }

    try {
      // Generate fingerprint
      const fp = await FingerprintJS.load()
      const result = await fp.get()
      
      // Create/fetch user in database
      const { data, error } = await supabase
        .from('anonymous_users')
        .upsert({ 
          fingerprint: result.visitorId,
          last_active: new Date().toISOString()
        }, {
          onConflict: 'fingerprint'
        })
        .select('id')
        .single()

      if (error) {
        console.error('Error creating anonymous user:', error)
        // Fallback to random ID if database fails
        userId = crypto.randomUUID()
      } else {
        userId = data.id
      }

      localStorage.setItem('anonymous_user_id', userId)
      return userId
    } catch (error) {
      console.error('Error generating fingerprint:', error)
      // Fallback to random ID
      const fallbackId = crypto.randomUUID()
      localStorage.setItem('anonymous_user_id', fallbackId)
      return fallbackId
    }
  }

  // Server-side fallback
  return crypto.randomUUID()
}