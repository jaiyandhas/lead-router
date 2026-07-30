import { describe, it, expect } from 'vitest'
import { routeLead } from './engine'
import type { LeadInput } from '../types'

function makeLead(overrides: Partial<LeadInput> = {}): LeadInput {
  return {
    name: 'Test User',
    email: 'test@example.com',
    companySize: '11-49',
    budget: 'under_10k',
    intent: 'just browsing',
    ...overrides,
  }
}

describe('routeLead', () => {
  describe('Priority 1 — urgency_detected', () => {
    it('routes an urgent small company to human_immediate', () => {
      const result = routeLead(
        makeLead({ companySize: '1-10', budget: 'under_10k', intent: 'need this ASAP' })
      )
      expect(result.route).toBe('human_immediate')
      expect(result.matchedRules).toEqual(['urgency_detected'])
    })

    it('urgency overrides a fully qualified lead', () => {
      const result = routeLead(
        makeLead({ companySize: '200+', budget: '10k_plus', intent: 'this is urgent' })
      )
      expect(result.route).toBe('human_immediate')
      expect(result.matchedRules).toEqual(['urgency_detected'])
    })

    it('detects positive urgency keywords correctly', () => {
      const positiveInputs = [
        'Need this ASAP',
        'Production issue, urgent',
        'Need this this quarter',
        'We have a strict deadline',
        'Planning to launch next week',
        'NEED THIS IMMEDIATELY',
        'want to get started as soon as possible',
      ]

      for (const intent of positiveInputs) {
        const result = routeLead(makeLead({ intent }))
        expect(result.route).toBe('human_immediate')
        expect(result.matchedRules).toContain('urgency_detected')
      }
    })

    it('correctly handles negations and does NOT trigger urgency', () => {
      const negativeInputs = [
        'This is NOT urgent',
        'No rush at all',
        'We can wait until next year',
        'Eventually we\'d like to migrate',
        'This is NOT urgent at all, we can wait months, no rush needed.',
        'No immediate need for this project',
        'Not time sensitive',
        'No deadline for this effort',
        'Someday we will upgrade',
        'Whenever you get a chance, no time pressure',
        'not a priority right now',
      ]

      for (const intent of negativeInputs) {
        const result = routeLead(makeLead({ intent, companySize: '1-10', budget: 'under_10k' }))
        expect(result.route).toBe('crm_only')
        expect(result.matchedRules).not.toContain('urgency_detected')
      }
    })
  })

  describe('Priority 2 — qualified_sales_lead', () => {
    it('routes a 50-199 company with 10k+ budget to human_standard', () => {
      const result = routeLead(
        makeLead({ companySize: '50-199', budget: '10k_plus', intent: 'evaluating options' })
      )
      expect(result.route).toBe('human_standard')
      expect(result.matchedRules).toEqual(['qualified_sales_lead'])
    })

    it('routes a 200+ company with 10k+ budget to human_standard', () => {
      const result = routeLead(
        makeLead({ companySize: '200+', budget: '10k_plus', intent: 'evaluating tools' })
      )
      expect(result.route).toBe('human_standard')
      expect(result.matchedRules).toEqual(['qualified_sales_lead'])
    })

    it('does not qualify: large company but insufficient budget', () => {
      const result = routeLead(
        makeLead({ companySize: '200+', budget: 'under_10k', intent: 'interested' })
      )
      expect(result.route).toBe('crm_only')
    })

    it('does not qualify: sufficient budget but company too small', () => {
      const result = routeLead(
        makeLead({ companySize: '1-10', budget: '10k_plus', intent: 'evaluating tools' })
      )
      expect(result.route).toBe('crm_only')
    })

    it('does not qualify: 11-49 employees falls below threshold', () => {
      const result = routeLead(
        makeLead({ companySize: '11-49', budget: '10k_plus', intent: 'exploring' })
      )
      expect(result.route).toBe('crm_only')
    })
  })

  describe('Priority 3 — crm_only default', () => {
    it('routes an unqualified non-urgent lead to crm_only', () => {
      const result = routeLead(makeLead())
      expect(result.route).toBe('crm_only')
    })

    it('crm_only result has an empty matchedRules array', () => {
      const result = routeLead(makeLead())
      expect(result.matchedRules).toEqual([])
    })
  })

  describe('RoutingResult invariants', () => {
    it('every result has a numeric score and a non-empty reason string', () => {
      const cases = [
        makeLead({ intent: 'asap' }),
        makeLead({ companySize: '50-199', budget: '10k_plus' }),
        makeLead(),
      ]

      for (const lead of cases) {
        const result = routeLead(lead)
        expect(typeof result.score).toBe('number')
        expect(result.score).toBeGreaterThanOrEqual(0)
        expect(result.score).toBeLessThanOrEqual(100)
        expect(result.reason.length).toBeGreaterThan(0)
      }
    })
  })
})
