import type { Lead } from '@/domain/types'

interface Props {
  lead: Lead
}

const CUSTOMER_MESSAGES = {
  human_immediate: {
    title: 'Your request has been prioritized',
    body: 'Thank you for reaching out. A team member will contact you within the hour.',
  },
  human_standard: {
    title: 'Thank you for getting in touch',
    body: 'An account representative will follow up with you within 24 business hours.',
  },
  crm_only: {
    title: 'Thank you for your submission',
    body: "We've logged your request and will follow up with relevant resources for your team.",
  },
} as const

export default function ConfirmationScreen({ lead }: Props) {
  const { title, body } = CUSTOMER_MESSAGES[lead.route]

  return (
    <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
      <h2 className="apple-heading-lg" style={{ marginBottom: '0.875rem' }}>
        {title}
      </h2>

      <p className="apple-subheading" style={{ marginBottom: '2rem' }}>
        {body}
      </p>

      <div
        style={{
          padding: '0.875rem 1.125rem',
          background: '#f5f5f7',
          border: '1px solid #e5e5ea',
          borderRadius: '0.75rem',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          display: 'inline-block',
        }}
      >
        Reference ID: {lead.id.slice(0, 8)}
      </div>
    </div>
  )
}
