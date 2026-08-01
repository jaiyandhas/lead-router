import type { Lead } from '@/domain/types'

interface Props {
  lead: Lead
}

export default function ConfirmationScreen({ lead }: Props) {
  return (
    <div style={{ padding: '1rem 0', textAlign: 'center' }}>
      <h2 className="apple-heading-lg" style={{ marginBottom: '0.875rem' }}>
        Thank you for getting in touch
      </h2>

      <p className="apple-subheading" style={{ marginBottom: '2rem' }}>
        We have received your request and will get back to you based on your needs.
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
