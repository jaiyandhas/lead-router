import { leadSchema } from '@/lib/validation/leadSchema'
import { routeLead } from '@/domain/routing/engine'
import { createLead } from '@/lib/supabase/leads'
import type { NewLead } from '@/domain/types'

/**
 * app/api/leads/route.ts
 *
 * The single entry point for lead submissions.
 *
 * This file is the orchestrator. It owns no business logic of its own.
 * Its only job is to:
 *   1. Validate the raw request body (Zod)
 *   2. Route the lead (domain engine)
 *   3. Persist the result (Supabase)
 *   4. Return the persisted lead to the browser
 *
 * What this file must NOT do:
 *   - Contain any routing logic (which keywords trigger urgency, etc.)
 *   - Contain any database queries
 *   - Know anything about React or the UI
 *
 * Error handling:
 *   - 400: input fails Zod validation
 *   - 500: database write failed or unexpected error
 *   - 201: created successfully
 */

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Step 1 — Validate the raw input
    const parsed = leadSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // Step 2 — Route the lead
    // routeLead() is a pure function. No I/O, no side effects.
    const input = parsed.data
    const result = routeLead(input)

    // Step 3 — Merge and persist
    // Spread order matters: if there were overlapping keys, result would win.
    // There are no overlapping keys between LeadInput and RoutingResult.
    const newLead: NewLead = { ...input, ...result }
    const lead = await createLead(newLead)

    // Step 4 — Return the full persisted Lead
    // The browser reads lead.route to determine which confirmation to display.
    return Response.json({ lead }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/leads]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
