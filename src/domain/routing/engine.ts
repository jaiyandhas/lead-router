import type { LeadInput, RoutingResult } from '../types'
import { ROUTING_RULES } from './rules'

// ---------------------------------------------------------------------------
// Default result — returned when no rule matches
// ---------------------------------------------------------------------------

/**
 * The crm_only fallthrough.
 *
 * This is not a rule — it requires no condition to be true.
 * It is the explicit answer to "what happens when nothing else applies?"
 * matchedRules is empty: no rules fired, which is itself an explainability signal.
 *
 * Growth's requirement is satisfied here: every lead is stored regardless
 * of whether it qualified for a human follow-up.
 */
const DEFAULT_RESULT: Readonly<RoutingResult> = {
  route: 'crm_only',
  score: 20,
  reason:
    'Lead does not meet sales qualification thresholds. Stored for nurture and retargeting.',
  matchedRules: [],
}

// ---------------------------------------------------------------------------
// Routing engine
// ---------------------------------------------------------------------------

/**
 * routeLead
 *
 * Pure function. No I/O. No side effects. No database. No HTTP.
 *
 * Evaluates ROUTING_RULES in priority order (array index = priority).
 * Returns the result of the first matching rule.
 * If no rule matches, returns the crm_only default.
 *
 * The routing decision is determined exclusively by rule order,
 * never by comparing scores.
 */
export function routeLead(lead: LeadInput): RoutingResult {
  const matched = ROUTING_RULES.find((rule) => rule.matches(lead))

  if (!matched) {
    return DEFAULT_RESULT
  }

  return {
    route: matched.route,
    score: matched.score,
    reason: matched.reason,
    matchedRules: [matched.name],
  }
}
