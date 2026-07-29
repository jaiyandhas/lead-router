import type { Lead } from '@/domain/types'

interface Props {
  lead: Lead
}

// Content is keyed by route — the UI never contains routing logic.
// The component just reads lead.route and looks up the right copy.
const CONTENT = {
  human_immediate: {
    dot: '🔴',
    tag: 'Urgent — within the hour',
    tagClass: 'route-badge route-badge--urgent',
    icon: (
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        style={{ color: '#f87171' }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
        />
      </svg>
    ),
    title: "You'll hear from us within the hour",
    body: "Your request has been flagged as time-sensitive. Someone from our team is being notified right now.",
    accentColor: '#f87171',
  },
  human_standard: {
    dot: '🔵',
    tag: 'Qualified — sales queue',
    tagClass: 'route-badge route-badge--standard',
    icon: (
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        style={{ color: '#60a5fa' }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
        />
      </svg>
    ),
    title: "You're in our sales pipeline",
    body: "Your submission meets our qualification criteria. Expect a call from our team within 24–48 business hours.",
    accentColor: '#60a5fa',
  },
  crm_only: {
    dot: '⚪',
    tag: 'Received',
    tagClass: 'route-badge route-badge--crm',
    icon: (
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        style={{ color: '#94a3b8' }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: "Thanks for reaching out",
    body: "We've received your submission and will be in touch when the time is right for your team.",
    accentColor: '#94a3b8',
  },
} as const

export default function ConfirmationScreen({ lead }: Props) {
  const { icon, title, body, tag, tagClass, accentColor } = CONTENT[lead.route]

  return (
    <div className="animate-in text-center" style={{ padding: '2rem 0' }}>
      {/* Icon */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: `${accentColor}18`,
          border: `1px solid ${accentColor}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}
      >
        {icon}
      </div>

      {/* Route tag */}
      <div style={{ marginBottom: '1rem' }}>
        <span className={tagClass}>{tag}</span>
      </div>

      {/* Title */}
      <h2
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 0.75rem',
          lineHeight: 1.3,
        }}
      >
        {title}
      </h2>

      {/* Body */}
      <p
        style={{
          fontSize: '0.9375rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          margin: '0 0 1.5rem',
        }}
      >
        {body}
      </p>

      {/* Reference line */}
      <p
        style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        ref: {lead.id.slice(0, 8)}
      </p>
    </div>
  )
}
