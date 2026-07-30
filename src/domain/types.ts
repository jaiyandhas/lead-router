export type CompanySize = '1-10' | '11-49' | '50-199' | '200+'

export type Budget = 'under_10k' | '10k_plus'

export type Route = 'human_immediate' | 'human_standard' | 'crm_only'

export type RuleName = 'urgency_detected' | 'qualified_sales_lead'

export interface LeadInput {
  name: string
  email: string
  companySize: CompanySize
  budget: Budget
  intent: string
}

export interface RoutingResult {
  route: Route
  score: number
  reason: string
  matchedRules: RuleName[]
}

export type NewLead = LeadInput & RoutingResult

export interface Lead extends NewLead {
  id: string
  createdAt: string
}
