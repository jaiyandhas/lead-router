import type { Lead, Route } from '@/domain/types'

/**
 * app/leads/page.tsx
 *
 * Internal inspection page — shows all submitted leads with routing decisions.
 *
 * This is a server component. It calls listLeads() directly without going
 * through an HTTP API route. Server components can import server-side modules
 * directly, so the call path is:
 *
 *   Browser → Next.js Server → listLeads() → Supabase
 *
 * The browser receives the fully rendered HTML. No client-side Supabase calls.
 *
 * Graceful degradation: if SUPABASE_URL is not configured, the page renders
 * an empty state with a setup message rather than throwing.
 */

export const dynamic = 'force-dynamic'

// ── Data fetching ─────────────────────────────────────────────────────────────

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

// ── Route badge ───────────────────────────────────────────────────────────────

function RouteBadge({ route }: { route: Route }) {
  const map = {
    human_immediate: {
      className: 'route-badge route-badge--urgent',
      label: '⚡ Immediate',
    },
    human_standard: {
      className: 'route-badge route-badge--standard',
      label: '📋 Sales queue',
    },
    crm_only: {
      className: 'route-badge route-badge--crm',
      label: '○ CRM only',
    },
  } as const

  const { className, label } = map[route]
  return <span className={className}>{label}</span>
}

// ── Timestamp ─────────────────────────────────────────────────────────────────

function Timestamp({ iso }: { iso: string }) {
  const date = new Date(iso)
  const formatted = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)

  return (
    <span
      style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}
      title={iso}
    >
      {formatted}
    </span>
  )
}

// ── Stats row ─────────────────────────────────────────────────────────────────

function StatsRow({ leads }: { leads: Lead[] }) {
  const immediate = leads.filter((l) => l.route === 'human_immediate').length
  const standard = leads.filter((l) => l.route === 'human_standard').length
  const crm = leads.filter((l) => l.route === 'crm_only').length

  const stats = [
    { label: 'Total leads', value: leads.length, color: 'var(--text-primary)' },
    { label: '⚡ Immediate', value: immediate, color: 'var(--route-urgent-text)' },
    { label: '📋 Sales queue', value: standard, color: 'var(--route-standard-text)' },
    { label: '○ CRM only', value: crm, color: 'var(--route-crm-text)' },
  ]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        marginBottom: '2rem',
      }}
    >
      {stats.map(({ label, value, color }) => (
        <div key={label} className="stat-card">
          <div
            style={{ fontSize: '1.75rem', fontWeight: 700, color, lineHeight: 1, marginBottom: 4 }}
          >
            {value}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ configured }: { configured: boolean }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        color: 'var(--text-muted)',
      }}
    >
      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
        {configured ? '📭' : '🔧'}
      </div>
      <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 0.5rem' }}>
        {configured ? 'No leads yet' : 'Supabase not configured'}
      </p>
      <p style={{ fontSize: '0.875rem', margin: 0 }}>
        {configured
          ? 'Submit a lead from the home page to see it here.'
          : 'Add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY to .env.local and restart.'}
      </p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function LeadsPage() {
  const leads = await getLeads()
  const configured = Boolean(process.env.SUPABASE_URL)

  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      {/* Header */}
      <header style={{ marginBottom: '2rem', maxWidth: 1200, margin: '0 auto 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Lead Inbox
          </h1>
          <span
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            /leads — internal view
          </span>
        </div>
        <p style={{ marginTop: '0.375rem', fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0.375rem 0 0' }}>
          Every submitted lead and its routing decision, newest first.
        </p>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {leads.length > 0 && <StatsRow leads={leads} />}

        {/* Table card */}
        <div
          className="glass-card"
          style={{ overflow: 'hidden' }}
        >
          {leads.length === 0 ? (
            <EmptyState configured={configured} />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="leads-table" style={{ minWidth: 900 }}>
                <thead>
                  <tr>
                    <th>Route</th>
                    <th>Contact</th>
                    <th>Company</th>
                    <th>Budget</th>
                    <th style={{ minWidth: 200 }}>Intent</th>
                    <th>Rules / Score</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      {/* Route badge */}
                      <td>
                        <RouteBadge route={lead.route} />
                      </td>

                      {/* Contact */}
                      <td>
                        <div
                          style={{
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            fontSize: '0.875rem',
                            marginBottom: '0.125rem',
                          }}
                        >
                          {lead.name}
                        </div>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {lead.email}
                        </div>
                      </td>

                      {/* Company size */}
                      <td>
                        <span
                          style={{
                            fontSize: '0.8125rem',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid var(--border)',
                            borderRadius: 4,
                            padding: '0.1rem 0.4rem',
                          }}
                        >
                          {lead.companySize}
                        </span>
                      </td>

                      {/* Budget */}
                      <td>
                        {lead.budget === '10k_plus' ? (
                          <span style={{ color: 'var(--route-standard-text)', fontWeight: 500 }}>
                            $10k+
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>{'< $10k'}</span>
                        )}
                      </td>

                      {/* Intent */}
                      <td style={{ maxWidth: 240 }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.8125rem',
                            lineHeight: 1.4,
                            color: 'var(--text-secondary)',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                          title={lead.intent}
                        >
                          {lead.intent}
                        </p>
                      </td>

                      {/* Rules + Score */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                          {lead.matchedRules.length > 0 ? (
                            lead.matchedRules.map((rule) => (
                              <span key={rule} className="rule-chip">
                                {rule}
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              —
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              color: 'var(--text-muted)',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            score: {lead.score}
                          </span>
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td>
                        <Timestamp iso={lead.createdAt} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Reason expansion — shown below the table as a secondary reference */}
        {leads.length > 0 && (
          <details
            style={{
              marginTop: '1.5rem',
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
            }}
          >
            <summary
              style={{ cursor: 'pointer', color: 'var(--text-secondary)', marginBottom: '1rem' }}
            >
              Routing reasons (for audit)
            </summary>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  style={{
                    padding: '0.625rem 0.875rem',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    lineHeight: 1.5,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {lead.id.slice(0, 8)}
                  </span>{' '}
                  <span style={{ color: 'var(--text-secondary)' }}>{lead.reason}</span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  )
}
