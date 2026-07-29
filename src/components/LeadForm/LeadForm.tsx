'use client'

/**
 * components/LeadForm/LeadForm.tsx
 *
 * The lead submission form.
 * This is a client component because it uses React Hook Form state and
 * makes a browser-side fetch() call to the API route.
 *
 * What this component must NOT do:
 * - Call Supabase directly
 * - Import from lib/supabase/
 * - Contain any routing logic
 * - Know what rules exist or how they work
 *
 * Its only responsibility: collect input, POST to /api/leads, display result.
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

  // ── Confirmation state ──────────────────────────────────────────────────────

  if (submittedLead) {
    return <ConfirmationScreen lead={submittedLead} />
  }

  // ── Form state ──────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Name */}
        <div>
          <label htmlFor="name" className="field-label">
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Alex Johnson"
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

        {/* Email */}
        <div>
          <label htmlFor="email" className="field-label">
            Work email
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

        {/* Company size + Budget (side by side) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label htmlFor="companySize" className="field-label">
              Company size
            </label>
            <select
              id="companySize"
              className="field-input field-select"
              aria-invalid={!!errors.companySize}
              {...register('companySize')}
            >
              <option value="">Select…</option>
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
              Annual budget
            </label>
            <select
              id="budget"
              className="field-input field-select"
              aria-invalid={!!errors.budget}
              {...register('budget')}
            >
              <option value="">Select…</option>
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

        {/* Intent */}
        <div>
          <label htmlFor="intent" className="field-label">
            What are you trying to achieve?
          </label>
          <textarea
            id="intent"
            rows={4}
            placeholder="Tell us about your goals, timeline, or any specific needs…"
            className="field-input"
            style={{ resize: 'vertical', minHeight: '5.5rem' }}
            aria-invalid={!!errors.intent}
            {...register('intent')}
          />
          {errors.intent && (
            <p className="field-error" role="alert">
              {errors.intent.message}
            </p>
          )}
        </div>

        {/* Server error */}
        {serverError && (
          <div
            role="alert"
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              color: '#f87171',
            }}
          >
            {serverError}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          id="submit-lead-form"
          disabled={isSubmitting}
          className="btn-primary"
          style={{ marginTop: '0.25rem' }}
        >
          {isSubmitting ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Submitting…
            </>
          ) : (
            'Get in touch'
          )}
        </button>
      </div>
    </form>
  )
}
