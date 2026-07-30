import type { Lead, NewLead } from '@/domain/types'
import { supabase } from './client'

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
