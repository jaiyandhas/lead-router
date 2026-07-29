import LeadForm from '@/components/LeadForm/LeadForm'
import Link from 'next/link'

/**
 * app/page.tsx
 *
 * Premium B2B Lead Routing Portal Landing Page.
 * Clean, large typography-driven UI with zero icons.
 */

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1.5rem',
        background: '#f5f5f7',
      }}
    >
      <div style={{ width: '100%', maxWidth: 560 }}>
        {/* Clean Typography Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 className="apple-heading-xl" style={{ marginBottom: '0.75rem' }}>
            Get in touch with us
          </h1>
          <p className="apple-subheading" style={{ maxWidth: 460, margin: '0 auto' }}>
            Tell us about your organization and goals. We will connect you with the right team member immediately.
          </p>
        </div>

        {/* Form Container Card */}
        <div className="apple-card" style={{ padding: '2.5rem' }}>
          <LeadForm />
        </div>

        {/* Footer Link & Disclaimer */}
        <div
          style={{
            marginTop: '2.25rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.875rem',
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
          }}
        >
          <p style={{ margin: 0 }}>
            Submissions are routed deterministically according to business priority rules.
          </p>
          <div>
            <Link
              href="/leads"
              style={{
                color: '#0071e3',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              View Internal Leads Dashboard →
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
