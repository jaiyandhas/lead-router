'use client'

/**
 * components/LeadForm/LeadForm.tsx
 *
 * Clean, large Apple-styled lead form.
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { leadSchema, type LeadFormValues } from '@/lib/validation/leadSchema'
import type { Lead } from '@/domain/types'
import ConfirmationScreen from './ConfirmationScreen'

export default function LeadForm() {
  const [submittedLead, setSubmittedLead] = useState<Lead | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
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
    <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Full Name */}
      <div>
        <label htmlFor="name" className="field-label">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="e.g. Sarah Jenkins"
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

      {/* Work Email */}
      <div>
        <label htmlFor="email" className="field-label">
          Work Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="sarah@company.com"
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

      {/* Company Size & Budget Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div>
          <label htmlFor="companySize" className="field-label">
            Company Size
          </label>
          <select
            id="companySize"
            className="field-input field-select"
            aria-invalid={!!errors.companySize}
            {...register('companySize')}
          >
            <option value="">Select size</option>
            <option value="1-10">1–10 employees</option>
            <option value="11-49">11–49 employees</option>
            <option value="50-199">50–199 employees</option>
            <option value="200+">200+ employees</option>
          </select>
          {errors.companySize && (
            <p className="field-error" role="alert">
              {errors.companySize.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="budget" className="field-label">
            Annual Budget
          </label>
          <select
            id="budget"
            className="field-input field-select"
            aria-invalid={!!errors.budget}
            {...register('budget')}
          >
            <option value="">Select budget</option>
            <option value="under_10k">Under $10k</option>
            <option value="10k_plus">$10k or more</option>
          </select>
          {errors.budget && (
            <p className="field-error" role="alert">
              {errors.budget.message}
            </p>
          )}
        </div>
      </div>

      {/* Intent / Notes */}
      <div>
        <label htmlFor="intent" className="field-label">
          How can we help you?
        </label>
        <textarea
          id="intent"
          rows={4}
          placeholder="Describe your timeline, project goals, or specific requirements..."
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

      {/* Server Error Alert */}
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

      {/* Submit Button */}
      <button
        type="submit"
        id="submit-lead-form"
        disabled={isSubmitting}
        className="btn-primary"
        style={{ marginTop: '0.5rem' }}
      >
        {isSubmitting ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Submitting request...
          </>
        ) : (
          'Submit Request'
        )}
      </button>
    </form>
  )
}
