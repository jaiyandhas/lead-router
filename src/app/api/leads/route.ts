import { leadSchema } from '@/lib/validation/leadSchema'
import { routeLead } from '@/domain/routing/engine'
import { createLead } from '@/lib/supabase/leads'
import type { NewLead } from '@/domain/types'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const parsed = leadSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const input = parsed.data
    const result = routeLead(input)

    const newLead: NewLead = { ...input, ...result }
    const lead = await createLead(newLead)

    return Response.json({ lead }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/leads]', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
