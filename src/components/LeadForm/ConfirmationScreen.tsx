import type { Lead } from '@/domain/types'

interface Props {
  lead: Lead
}

const CONTENT = {
  human_immediate: {
    tag: 'Urgent Priority',
    tagClass: 'route-badge route-badge--urgent',
    title: 'We will contact you within the hour',
    body: 'Your submission was flagged as time-sensitive. A member of our executive team is being notified immediately.',
  },
  human_standard: {
    tag: 'Qualified Lead',
    tagClass: 'route-badge route-badge--standard',
    title: 'Your request is in our sales queue',
    body: 'Thank you for reaching out. An account manager will follow up within 24 business hours.',
  },
  crm_only: {
    tag: 'Request Received',
    tagClass: 'route-badge route-badge--crm',
    title: 'Thank you for your submission',
    body: 'We have logged your details and will follow up with relevant information for your team.',
  },
} as const

export default function ConfirmationScreen({ lead }: Props) {
  const { title, body, tag, tagClass } = CONTENT[lead.route]

  return (
    <div style={{ padding: '1.5rem 0' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <span className={tagClass}>{tag}</span>
      </div>

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
