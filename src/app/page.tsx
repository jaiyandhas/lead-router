import LeadForm from '@/components/LeadForm/LeadForm'

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
      </div>
    </main>
  )
}
