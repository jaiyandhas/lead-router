import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || 'https://placeholder.supabase.co'
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || 'placeholder'

export const supabase = createClient(url, publishableKey)
