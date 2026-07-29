/**
 * lib/supabase/leads.integration.test.ts
 *
 * Smoke test for the persistence layer.
 * Runs only when NEXT_PUBLIC_SUPABASE_URL is set in the environment.
 * Skipped silently otherwise — safe to commit and run in CI without credentials.
 *
 * Run with:
 *   NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=... npm test
 *
 * Or with .env.local already configured:
 *   npx vitest run src/lib/supabase/leads.integration.test.ts
 */

import { describe, it, expect } from 'vitest'
import type { NewLead } from '@/domain/types'

// Vitest loads .env.local automatically via vite's env handling.
// Skip the entire suite if the Supabase URL is not configured.
const SUPABASE_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)

describe.skipIf(!SUPABASE_CONFIGURED)('leads persistence (integration)', () => {
  it('inserts a lead and returns the persisted entity with id and createdAt', async () => {
    const { createLead } = await import('./leads')

    const newLead: NewLead = {
      name: 'Smoke Test User',
      email: 'smoke@test.com',
      companySize: '50-199',
      budget: '10k_plus',
      intent: 'smoke testing the persistence layer',
      route: 'human_standard',
      score: 70,
      reason: 'Qualified lead: company size ≥50 employees and budget ≥$10k. Added to the sales queue.',
      matchedRules: ['qualified_sales_lead'],
    }

    const lead = await createLead(newLead)

    // Database-generated fields must exist
    expect(lead.id).toBeTruthy()
    expect(lead.createdAt).toBeTruthy()

    // Domain fields must round-trip correctly through the snake_case mapping
    expect(lead.name).toBe('Smoke Test User')
    expect(lead.email).toBe('smoke@test.com')
    expect(lead.companySize).toBe('50-199')
    expect(lead.budget).toBe('10k_plus')
    expect(lead.intent).toBe('smoke testing the persistence layer')
    expect(lead.route).toBe('human_standard')
    expect(lead.score).toBe(70)
    expect(lead.matchedRules).toEqual(['qualified_sales_lead'])
  })

  it('reads leads and returns most recent first', async () => {
    const { listLeads } = await import('./leads')

    const leads = await listLeads()

    // At least the smoke test row we just inserted should be present
    expect(leads.length).toBeGreaterThan(0)

    // Verify ordering — created_at DESC means first item is most recent
    if (leads.length > 1) {
      const first = new Date(leads[0].createdAt).getTime()
      const second = new Date(leads[1].createdAt).getTime()
      expect(first).toBeGreaterThanOrEqual(second)
    }

    // Verify the domain shape of the first returned lead
    const lead = leads[0]
    expect(lead.id).toBeTruthy()
    expect(lead.createdAt).toBeTruthy()
    expect(['human_immediate', 'human_standard', 'crm_only']).toContain(lead.route)
    expect(typeof lead.score).toBe('number')
    expect(Array.isArray(lead.matchedRules)).toBe(true)
  })
})
