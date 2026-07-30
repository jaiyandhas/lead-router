import LeadForm from '@/components/LeadForm/LeadForm'
import Link from 'next/link'

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
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 className="apple-heading-xl" style={{ marginBottom: '0.75rem' }}>
            Get in touch with us
          </h1>
          <p className="apple-subheading" style={{ maxWidth: 460, margin: '0 auto' }}>
            We&apos;ll get back to you based on your needs.
          </p>
        </div>

        <div className="apple-card" style={{ padding: '2.5rem' }}>
          <LeadForm />
        </div>

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
