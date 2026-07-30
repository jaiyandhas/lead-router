'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { leadSchema, type LeadFormValues } from '@/lib/validation/leadSchema'
import type { Lead } from '@/domain/types'
import CustomSelect from '@/components/UI/CustomSelect'
import ConfirmationScreen from './ConfirmationScreen'

const COMPANY_SIZE_OPTIONS = [
  { value: '1-10', label: '1–10 employees' },
  { value: '11-49', label: '11–49 employees' },
  { value: '50-199', label: '50–199 employees' },
  { value: '200+', label: '200+ employees' },
]

const BUDGET_OPTIONS = [
  { value: 'under_10k', label: 'Under $10,000' },
  { value: '10k_plus', label: '$10,000 or more' },
]

export default function LeadForm() {
  const [submittedLead, setSubmittedLead] = useState<Lead | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: '',
      email: '',
      companySize: undefined,
      budget: undefined,
      intent: '',
    },
  })

  const onSubmit = async (data: LeadFormValues) => {
    setIsSubmitting(true)
    setServerError(null)

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error ?? `Request failed (${res.status})`)
      }

      const { lead } = await res.json()
      setSubmittedLead(lead)
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submittedLead) {
    return <ConfirmationScreen lead={submittedLead} />
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}
    >
      <div>
        <label htmlFor="name" className="field-label">
          Name
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Alex Rivera"
          className="field-input"
          aria-invalid={!!errors.name}
          {...register('name')}
        />
        {errors.name && (
          <p className="field-error" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="field-label">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="alex@company.com"
          className="field-input"
          aria-invalid={!!errors.email}
          {...register('email')}
        />
        {errors.email && (
          <p className="field-error" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div>
          <label htmlFor="companySize" className="field-label">
            Company Size
          </label>
          <Controller
            name="companySize"
            control={control}
            render={({ field }) => (
              <CustomSelect
                id="companySize"
                options={COMPANY_SIZE_OPTIONS}
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="Select size"
                error={errors.companySize?.message}
              />
            )}
          />
          {errors.companySize && (
            <p className="field-error" role="alert">
              {errors.companySize.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="budget" className="field-label">
            Budget
          </label>
          <Controller
            name="budget"
            control={control}
            render={({ field }) => (
              <CustomSelect
                id="budget"
                options={BUDGET_OPTIONS}
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="Select budget"
                error={errors.budget?.message}
              />
            )}
          />
          {errors.budget && (
            <p className="field-error" role="alert">
              {errors.budget.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="intent" className="field-label">
          What are you looking to solve?
        </label>
        <textarea
          id="intent"
          rows={4}
          placeholder="Describe your goals, requirements, or desired timeline..."
          className="field-input"
          style={{ resize: 'vertical', minHeight: '6.5rem' }}
          aria-invalid={!!errors.intent}
          {...register('intent')}
        />
        {errors.intent && (
          <p className="field-error" role="alert">
            {errors.intent.message}
          </p>
        )}
      </div>

      {serverError && (
        <div
          role="alert"
          style={{
            padding: '0.875rem 1.125rem',
            background: '#ffeef0',
            border: '1px solid rgba(215, 0, 21, 0.2)',
            borderRadius: '0.75rem',
            fontSize: '0.9375rem',
            color: '#d70015',
            fontWeight: 500,
          }}
        >
          {serverError}
        </div>
      )}

      <button
        type="submit"
        id="submit-lead-form"
        disabled={isSubmitting}
        className="btn-primary"
        style={{ marginTop: '0.5rem' }}
      >
        {isSubmitting ? 'Submitting Request...' : 'Submit Request'}
      </button>
    </form>
  )
}
