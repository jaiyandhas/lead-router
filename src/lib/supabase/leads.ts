import type { Lead, NewLead } from '@/domain/types'
import { supabase } from './client'

/**
 * lib/supabase/leads.ts
 *
 * All database operations on the `leads` table.
 *
 * This module knows about:
 * - Supabase (the database client)
 * - The leads table schema (column names, types)
 * - Our domain types (Lead, NewLead)
 *
 * This module must NOT know about:
 * - Routing logic or how urgency is detected
 * - HTTP (no Request/Response objects)
 * - React (no hooks, no components)
 * - Validation (Zod lives in lib/validation/)
 */

// ---------------------------------------------------------------------------
// Database row type
//
// Postgres returns snake_case column names. Our domain types use camelCase.
// This interface represents the raw shape Supabase returns — it is private
// to this module. Nothing outside leads.ts needs to know the DB uses
// snake_case.
// ---------------------------------------------------------------------------

interface LeadRow {
  id: string
  created_at: string
  name: string
  email: string
  company_size: string
  budget: string
  intent: string
  route: string
  score: number
  reason: string
  matched_rules: string[]
}

// ---------------------------------------------------------------------------
// Column mapping
//
// Translates a raw database row into our domain Lead type.
// The `as` casts are intentional: Supabase returns plain strings, not our
// union types. The database CHECK constraints enforce that only valid values
// are stored, so the cast is safe. In a stricter production system you would
// parse through Zod here to validate at the boundary.
// ---------------------------------------------------------------------------

function toDomainLead(row: LeadRow): Lead {
  return {
    id: row.id,
    createdAt: row.created_at,
    name: row.name,
    email: row.email,
    companySize: row.company_size as Lead['companySize'],
    budget: row.budget as Lead['budget'],
    intent: row.intent,
    route: row.route as Lead['route'],
    score: row.score,
    reason: row.reason,
    matchedRules: row.matched_rules as Lead['matchedRules'],
  }
}

// ---------------------------------------------------------------------------
// createLead
//
// Writes a NewLead to the database and returns the full persisted Lead.
// The database generates id and created_at — we do not supply them.
//
// .select().single() tells Supabase to return the inserted row immediately.
// Without .select(), insert() returns no data by default.
// ---------------------------------------------------------------------------

export async function createLead(newLead: NewLead): Promise<Lead> {
  const { data, error } = await supabase
    .from('leads')
    .insert({
      name: newLead.name,
      email: newLead.email,
      company_size: newLead.companySize,
      budget: newLead.budget,
      intent: newLead.intent,
      route: newLead.route,
      score: newLead.score,
      reason: newLead.reason,
      matched_rules: newLead.matchedRules,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`createLead failed: ${error.message}`)
  }

  return toDomainLead(data as LeadRow)
}

// ---------------------------------------------------------------------------
// listLeads
//
// Returns all leads ordered by most recently submitted first.
// Used by the internal /leads inspection page.
// No pagination for this assignment — acceptable at take-home scale.
// ---------------------------------------------------------------------------

export async function listLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`listLeads failed: ${error.message}`)
  }

  return (data as LeadRow[]).map(toDomainLead)
}
