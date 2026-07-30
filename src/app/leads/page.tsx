import type { Lead } from '@/domain/types'
import Link from 'next/link'
import LeadsInboxView from '@/components/Leads/LeadsInboxView'

export const dynamic = 'force-dynamic'

async function getLeads(): Promise<Lead[]> {
  if (!process.env.SUPABASE_URL) return []

  try {
    const { listLeads } = await import('@/lib/supabase/leads')
    return await listLeads()
  } catch (err) {
    console.error('Failed to fetch leads from Supabase:', err)
    return []
  }
}

export default async function LeadsPage() {
  const leads = await getLeads()
  const configured = Boolean(process.env.SUPABASE_URL)

  return (
    <div style={{ minHeight: '100vh', padding: '3.5rem 2rem', background: '#f5f5f7' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h1 className="apple-heading-xl" style={{ marginBottom: '0.375rem' }}>
              Leads & Routing Inbox
            </h1>
            <p className="apple-subheading">
              Realtime lead submissions evaluated by the prioritized routing engine.
            </p>
          </div>
          <Link href="/" className="btn-secondary" style={{ textDecoration: 'none' }}>
            ← Back to Form
          </Link>
        </header>

        <LeadsInboxView initialLeads={leads} configured={configured} />
      </div>
    </div>
  )
}
