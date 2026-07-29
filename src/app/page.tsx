import LeadForm from '@/components/LeadForm/LeadForm'

/**
 * app/page.tsx
 *
 * The public-facing lead submission page.
 * This is a server component — it renders on the server and sends HTML.
 * LeadForm is a client component and takes over interactivity in the browser.
 *
 * There is no data fetching here. The page is static shell + client form.
 */

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        background:
          'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.1) 0%, transparent 70%)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {/* Logo mark */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '10px',
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
            }}
            aria-hidden="true"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"
              />
            </svg>
          </div>

          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '0 0 0.5rem',
              letterSpacing: '-0.02em',
            }}
          >
            Get started with us
          </h1>
          <p
            style={{
              fontSize: '0.9375rem',
              color: 'var(--text-secondary)',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Tell us about your team. We will get the right person in touch.
          </p>
        </div>

        {/* Form card */}
        <div className="glass-card animate-in" style={{ padding: '2rem' }}>
          <LeadForm />
        </div>

        {/* Footer note */}
        <p
          style={{
            textAlign: 'center',
            marginTop: '1.25rem',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          We route every request to the right person. No spam.
        </p>
      </div>
    </main>
  )
}
