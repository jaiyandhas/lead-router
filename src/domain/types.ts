/**
 * domain/types.ts
 *
 * The shared vocabulary of the lead routing system.
 * This file has no imports and no logic.
 * It changes only when the business model changes.
 */

// ---------------------------------------------------------------------------
// Enums (string literal unions)
// ---------------------------------------------------------------------------

/**
 * Discrete company size buckets.
 *
 * The boundary between '11-49' and '50-199' is intentional:
 * 50 employees is the Sales team's minimum threshold for a qualified lead.
 * Placing the split at the bucket boundary makes the routing rule
 * a clean membership check rather than a numeric comparison.
 */
export type CompanySize = '1-10' | '11-49' | '50-199' | '200+'

/**
 * Budget tiers.
 *
 * Two buckets because the business has exactly one routing threshold: $10k.
 * Additional buckets would model precision that no routing rule uses.
 */
export type Budget = 'under_10k' | '10k_plus'

/**
 * The finite set of routing destinations.
 *
 * - human_immediate: Urgency detected. Route to a human right now.
 * - human_standard:  Qualified lead. Enter the normal sales queue.
 * - crm_only:        Store and nurture. No immediate human action.
 */
export type Route = 'human_immediate' | 'human_standard' | 'crm_only'

/**
 * The finite set of routing rule identifiers.
 *
 * Each value corresponds to exactly one rule in domain/routing/rules.ts.
 * Defining this as a union here (rather than plain strings) gives us:
 * - Compile-time protection against typos in rule names
 * - A single authoritative place to register a new rule name
 * - IDE autocomplete when constructing RoutingResult.matchedRules
 *
 * Add a new member here whenever a new rule is introduced in rules.ts.
 */
export type RuleName = 'urgency_detected' | 'qualified_sales_lead'

// ---------------------------------------------------------------------------
// Core domain objects
// ---------------------------------------------------------------------------

/**
 * LeadInput
 *
 * Data submitted from the form after structural validation by Zod.
 * This is trusted to have the correct shape, but it has not been
 * persisted or routed yet.
 *
 * `intent` is free text. The routing engine reads it to detect urgency.
 * We do not constrain what a user types here.
 */
export interface LeadInput {
  name: string
  email: string
  companySize: CompanySize
  budget: Budget
  intent: string
}

/**
 * Lead
 *
 * A validated, persisted record.
 * Extends LeadInput because a Lead *is* a LeadInput plus persistence metadata.
 *
 * `createdAt` is an ISO 8601 string, not a Date object.
 * Date objects do not survive JSON serialization cleanly — they become strings
 * regardless. Keeping it as string avoids silent parse/serialize roundtrips
 * in API responses. Convert to Date at the display layer only when formatting.
 */
export interface Lead extends LeadInput {
  id: string
  createdAt: string
}

/**
 * RoutingResult
 *
 * The decision output of the routing engine.
 * This is computed on write and stored alongside the lead as a snapshot,
 * preserving the decision that was made at the time of submission.
 *
 * `route`        — the routing destination, determined solely by ordered rule priority
 * `score`        — 0–100 explainability metric, derived from which rule fired.
 *                  IMPORTANT: score is never compared between leads and never used
 *                  to make a routing decision. It exists only for human readability
 *                  and dashboard display. Routing is always determined by rule order.
 * `reason`       — plain English explanation, shown to sales, support, and audit
 * `matchedRules` — ordered list of rule names that fired, typed as RuleName[]
 *                  to prevent typos and keep rule registration centralised
 */
export interface RoutingResult {
  route: Route
  score: number
  reason: string
  matchedRules: RuleName[]
}
