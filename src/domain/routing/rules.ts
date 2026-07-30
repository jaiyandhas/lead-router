import type { LeadInput, RuleName, Route } from '../types'

export interface Rule {
  name: RuleName
  matches: (lead: LeadInput) => boolean
  route: Route
  score: number
  reason: string
}

const NEGATION_PHRASES = [
  'not urgent',
  'no rush',
  'not immediate',
  'no immediate need',
  'can wait',
  'next year',
  'someday',
  'eventually',
  'no deadline',
  'whenever',
  'not time sensitive',
  'not time-sensitive',
  'no time pressure',
  'not a priority',
] as const

const URGENCY_KEYWORDS = [
  'asap',
  'urgent',
  'immediately',
  'this week',
  'this month',
  'this quarter',
  'right away',
  'as soon as possible',
  'deadline',
  'launch next week',
  'production issue',
  'time-sensitive',
  'time sensitive',
] as const

export function detectUrgency(intent: string): boolean {
  const normalized = intent.toLowerCase().replace(/\s+/g, ' ').trim()

  if (!normalized) return false

  const hasNegation = NEGATION_PHRASES.some((phrase) => normalized.includes(phrase))
  if (hasNegation) {
    return false
  }

  return URGENCY_KEYWORDS.some((keyword) => normalized.includes(keyword))
}

function isQualifiedLead(lead: LeadInput): boolean {
  const hasSufficientSize =
    lead.companySize === '50-199' || lead.companySize === '200+'
  const hasSufficientBudget = lead.budget === '10k_plus'
  return hasSufficientSize && hasSufficientBudget
}

export const ROUTING_RULES: Rule[] = [
  {
    name: 'urgency_detected',
    matches: (lead) => detectUrgency(lead.intent),
    route: 'human_immediate',
    score: 100,
    reason:
      'Urgency detected in stated intent. Routing to a human immediately.',
  },
  {
    name: 'qualified_sales_lead',
    matches: (lead) => isQualifiedLead(lead),
    route: 'human_standard',
    score: 70,
    reason:
      'Qualified lead: company size ≥50 employees and budget ≥$10k. Added to the sales queue.',
  },
]
