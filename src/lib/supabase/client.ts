import { createClient } from '@supabase/supabase-js'

/**
 * lib/supabase/client.ts
 *
 * Server-side Supabase client singleton.
 *
 * Why server-side only?
 * Every database operation in this project goes through the server:
 * - Writes:  POST /api/leads (API route) → createLead()
 * - Reads:   /leads page (server component) → listLeads()
 *
 * The browser never holds a Supabase client. It submits a form and receives
 * JSON. Keeping the client server-only means the env vars below are never
 * bundled into browser JavaScript — the browser has no knowledge of the
 * Supabase project URL or publishable key.
 *
 * Why no NEXT_PUBLIC_ prefix?
 * NEXT_PUBLIC_ tells Next.js to bundle a variable into the client-side JS.
 * Since the browser has no use for these values, there is no reason to expose
 * them. Without the prefix, they are only available in server-side code.
 *
 * Why a singleton?
 * This project has no authentication — every server-side request is anonymous
 * and uses the same publishable key. There is no per-request session context
 * to attach. A single shared client is correct.
 *
 * If auth were added later, you would switch to @supabase/ssr and create a
 * client per request to attach the user's session. That is a deliberate
 * future decision, not an oversight here.
 */

const url = process.env.SUPABASE_URL
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY

if (!url) {
  throw new Error(
    'Missing environment variable: SUPABASE_URL\n' +
      'Add it to .env.local and restart the dev server.'
  )
}

if (!publishableKey) {
  throw new Error(
    'Missing environment variable: SUPABASE_PUBLISHABLE_KEY\n' +
      'Add it to .env.local and restart the dev server.'
  )
}

export const supabase = createClient(url, publishableKey)
