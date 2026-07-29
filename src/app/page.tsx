import LeadForm from '@/components/LeadForm/LeadForm'
import Link from 'next/link'

/**
 * app/page.tsx
 *
 * Clean Apple-styled lead routing portal homepage.
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
        padding: '3rem 1.5rem',
        background: '#f5f5f7',
      }}
    >
      <div style={{ width: '100%', maxWidth: 540 }}>
        {/* Top Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: '16px',
              background: '#0071e3',
              boxShadow: '0 8px 20px rgba(0, 113, 227, 0.25)',
              marginBottom: '1.25rem',
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>

          <h1 className="apple-heading-xl" style={{ marginBottom: '0.75rem' }}>
            Get in touch with us
          </h1>
          <p className="apple-subheading" style={{ maxWidth: 440, margin: '0 auto' }}>
            Tell us about your organization and needs. We’ll connect you with the right team immediately.
          </p>
        </div>

        {/* Clean Form Card */}
        <div className="apple-card" style={{ padding: '2.5rem' }}>
          <LeadForm />
        </div>

        {/* Footer Link & Disclaimer */}
        <div
          style={{
            marginTop: '2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
          }}
        >
          <p style={{ margin: 0 }}>
            Every request is automatically routed based on priority. No sales spam.
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
