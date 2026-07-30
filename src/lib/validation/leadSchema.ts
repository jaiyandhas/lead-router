import { z } from 'zod'

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

export type LeadFormValues = z.infer<typeof leadSchema>
