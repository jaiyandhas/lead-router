import { z } from 'zod'

/**
 * lib/validation/leadSchema.ts
 *
 * The Zod schema that validates form submissions at the API boundary.
 *
 * Why does this live in lib/ and not domain/?
 * Zod is an infrastructure dependency. The schema depends on the Zod library.
 * Pure domain types (in domain/types.ts) have no dependencies whatsoever.
 * This schema is the bridge between untrusted HTTP input and the trusted
 * domain type LeadInput.
 *
 * LeadFormValues (inferred from the schema) is structurally identical to
 * LeadInput. TypeScript's structural typing means routeLead() will accept
 * it without a cast — the compiler verifies the shapes match.
 */

export const leadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  companySize: z.enum(['1-10', '11-49', '50-199', '200+'], {
    error: 'Please select your company size',
  }),
  budget: z.enum(['under_10k', '10k_plus'], {
    error: 'Please select your budget range',
  }),
  intent: z
    .string()
    .min(1, 'Please describe your goals')
    .max(1000, 'Please keep it under 1000 characters'),
})

// LeadFormValues is the type React Hook Form operates on.
// It is structurally compatible with LeadInput — no explicit mapping required.
export type LeadFormValues = z.infer<typeof leadSchema>
