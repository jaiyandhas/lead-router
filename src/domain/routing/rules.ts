import type { LeadInput, RuleName, Route } from '../types'

// ---------------------------------------------------------------------------
// Rule interface (internal to the routing subsystem)
// ---------------------------------------------------------------------------

/**
 * A single routing rule.
 *
 * Rules are evaluated in array order. The first rule whose `matches()`
 * returns true determines the outcome. Rules do not interact with each other.
 *
 * This interface lives here, not in domain/types.ts, because it describes
 * the internal structure of the routing engine — not a business domain concept.
 */
export interface Rule {
  name: RuleName
  matches: (lead: LeadInput) => boolean
  route: Route
  score: number
  reason: string
}

// ---------------------------------------------------------------------------
// Private helpers
// Not exported: these are implementation details of their respective rules.
// The engine calls rule.matches(lead), never these functions directly.
// ---------------------------------------------------------------------------

/**
 * Keywords that indicate a lead needs human attention right now.
 * Case-insensitive substring matching is intentional — natural language
 * is messy and we prefer false positives over missed urgency signals.
 */
const URGENCY_KEYWORDS = [
  'asap',
  'immediately',
  'urgent',
  'this week',
  'this quarter',
  'right away',
  'as soon as possible',
  'time-sensitive',
] as const

function detectUrgency(intent: string): boolean {
  const normalized = intent.toLowerCase()
  return URGENCY_KEYWORDS.some((keyword) => normalized.includes(keyword))
}

/**
 * A lead is sales-qualified when both thresholds are met:
 * - Company has 50+ employees (Sales team's minimum threshold)
 * - Budget is $10k or above (Founder's minimum threshold)
 *
 * Both conditions are required. A large company with a low budget
 * does not qualify, and neither does a small company with a high budget.
 */
function isQualifiedLead(lead: LeadInput): boolean {
  const hasSufficientSize =
    lead.companySize === '50-199' || lead.companySize === '200+'
  const hasSufficientBudget = lead.budget === '10k_plus'
  return hasSufficientSize && hasSufficientBudget
}

// ---------------------------------------------------------------------------
// Routing rules — ordered by priority, first match wins
//
// To add a rule: append a new Rule object at the correct priority position.
// The engine function (engine.ts) does not change when rules change.
// To add a new rule name: register it in domain/types.ts → RuleName first.
// ---------------------------------------------------------------------------

export const ROUTING_RULES: Rule[] = [
  {
    // Priority 1: Urgency overrides everything.
    // The Founder's requirement: someone who needs help immediately
    // must reach a human regardless of company size or budget.
    name: 'urgency_detected',
    matches: (lead) => detectUrgency(lead.intent),
    route: 'human_immediate',
    score: 100,
    reason:
      'Urgency detected in stated intent. Routing to a human immediately.',
  },
  {
    // Priority 2: Qualified sales lead.
    // The Sales team's requirement: 50+ employees AND $10k+ budget.
    // Both conditions must be true. This rule only fires if Priority 1 did not.
    name: 'qualified_sales_lead',
    matches: (lead) => isQualifiedLead(lead),
    route: 'human_standard',
    score: 70,
    reason:
      'Qualified lead: company size ≥50 employees and budget ≥$10k. Added to the sales queue.',
  },
]
