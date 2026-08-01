import LeadForm from '@/components/LeadForm/LeadForm'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', display: 'flex', flexDirection: 'column' }}>
      {/* Subtle Top Navigation */}
      <header
        style={{
          width: '100%',
          maxWidth: 1100,
          margin: '0 auto',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#1d1d1f',
            letterSpacing: '-0.01em',
          }}
        >
          Acme Corp
        </span>
        <Link
          href="/leads"
          style={{
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: '#86868b',
            textDecoration: 'none',
          }}
        >
          Leads Inbox →
        </Link>
      </header>

      {/* Main Form Content */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1.5rem 4rem',
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
        </div>
      </main>
    </div>
  )
}
