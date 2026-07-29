import type { Lead } from '@/domain/types'

interface Props {
  lead: Lead
}

const CONTENT = {
  human_immediate: {
    tag: '⚡ Urgent Priority',
    tagClass: 'route-badge route-badge--urgent',
    iconColor: '#d70015',
    iconBg: '#ffeef0',
    title: 'We will call you within the hour',
    body: 'Your request was flagged as time-sensitive. Our team is being notified immediately.',
  },
  human_standard: {
    tag: '📋 Qualified Lead',
    tagClass: 'route-badge route-badge--standard',
    iconColor: '#0071e3',
    iconBg: '#e8f2ff',
    title: 'Your request is in our sales queue',
    body: 'Thank you for reaching out. A account representative will follow up within 24 business hours.',
  },
  crm_only: {
    tag: '○ Request Received',
    tagClass: 'route-badge route-badge--crm',
    iconColor: '#636366',
    iconBg: '#f2f2f7',
    title: 'Thank you for your submission',
    body: 'We have logged your request and will follow up with relevant information for your team.',
  },
} as const

export default function ConfirmationScreen({ lead }: Props) {
  const { title, body, tag, tagClass, iconColor, iconBg } = CONTENT[lead.route]

  return (
    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
      {/* Icon Circle */}
      <div
        style={{
          width: 76,
          height: 76,
          borderRadius: '50%',
          background: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke={iconColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <span className={tagClass}>{tag}</span>
      </div>

      <h2 className="apple-heading-lg" style={{ marginBottom: '0.75rem' }}>
        {title}
      </h2>

      <p className="apple-subheading" style={{ marginBottom: '2rem' }}>
        {body}
      </p>

      <div
        style={{
          padding: '1rem',
          background: '#f5f5f7',
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
