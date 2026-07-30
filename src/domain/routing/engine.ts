import type { LeadInput, RoutingResult } from '../types'
import { ROUTING_RULES } from './rules'

const DEFAULT_RESULT: Readonly<RoutingResult> = {
  route: 'crm_only',
  score: 20,
  reason:
    'Lead does not meet sales qualification thresholds. Stored for nurture and retargeting.',
  matchedRules: [],
}

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
