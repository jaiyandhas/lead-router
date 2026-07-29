import { createClient } from '@supabase/supabase-js'

/**
 * lib/supabase/client.ts
 *
 * Initialises and exports the Supabase client singleton.
 *
 * Why a singleton?
 * This project has no authentication — every request is anonymous and uses
 * the same publishable key. There is no per-request session context to attach.
 * A single shared client for the application lifetime is correct.
 *
 * If auth were added later, you would switch to @supabase/ssr and create a
 * new client per request (to attach the user's session cookie). That is a
 * deliberate future decision, not an oversight here.
 *
 * These variables are prefixed NEXT_PUBLIC_ because the client runs in both
 * server (API routes) and browser (React components) contexts.
 * The publishable key is safe to expose — its permissions are controlled
 * entirely by Supabase Row Level Security policies on the database.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!url) {
  throw new Error(
    'Missing environment variable: NEXT_PUBLIC_SUPABASE_URL\n' +
      'Add it to .env.local and restart the dev server.'
  )
}

if (!publishableKey) {
  throw new Error(
    'Missing environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY\n' +
      'Add it to .env.local and restart the dev server.'
  )
}

export const supabase = createClient(url, publishableKey)
