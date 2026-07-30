'use client'

import { useState } from 'react'
import type { Lead, Route } from '@/domain/types'
import Link from 'next/link'
import CustomSelect from '@/components/UI/CustomSelect'

interface Props {
  initialLeads: Lead[]
  configured: boolean
}

type SortOption = 'newest' | 'oldest' | 'priority' | 'score'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Sort: Newest First' },
  { value: 'oldest', label: 'Sort: Oldest First' },
  { value: 'priority', label: 'Sort: Priority (Urgent First)' },
  { value: 'score', label: 'Sort: Score (High to Low)' },
]

const ROUTE_PRIORITY: Record<Route, number> = {
  human_immediate: 1,
  human_standard: 2,
  crm_only: 3,
}

function RouteBadge({ route }: { route: Route }) {
  const map = {
    human_immediate: {
      className: 'route-badge route-badge--urgent',
      label: 'Immediate Action',
    },
    human_standard: {
      className: 'route-badge route-badge--standard',
      label: 'Sales Queue',
    },
    crm_only: {
      className: 'route-badge route-badge--crm',
      label: 'CRM Nurture',
    },
  } as const

  const { className, label } = map[route]
  return <span className={className}>{label}</span>
}

function Timestamp({ iso }: { iso: string }) {
  const date = new Date(iso)
  const formatted = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date)

  return (
    <span
      style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}
      title={iso}
    >
      {formatted}
    </span>
  )
}

function StatsRow({ leads }: { leads: Lead[] }) {
  const immediate = leads.filter((l) => l.route === 'human_immediate').length
  const standard = leads.filter((l) => l.route === 'human_standard').length
  const crm = leads.filter((l) => l.route === 'crm_only').length

  const stats = [
    { label: 'Total Submissions', value: leads.length, color: '#1d1d1f' },
    { label: 'Urgent Attention', value: immediate, color: '#d70015' },
    { label: 'Sales Pipeline', value: standard, color: '#0071e3' },
    { label: 'CRM Nurture', value: crm, color: '#636366' },
  ]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem',
      }}
    >
      {stats.map(({ label, value, color }) => (
        <div key={label} className="apple-card" style={{ padding: '1.5rem' }}>
          <div
            style={{ fontSize: '2.25rem', fontWeight: 700, color, lineHeight: 1, marginBottom: '0.5rem' }}
          >
            {value}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ configured }: { configured: boolean }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '5rem 2rem',
        color: 'var(--text-muted)',
      }}
    >
      <h3 className="apple-heading-lg" style={{ marginBottom: '0.5rem' }}>
        {configured ? 'No leads submitted yet' : 'Supabase credentials missing'}
      </h3>
      <p className="apple-subheading" style={{ maxWidth: 420, margin: '0 auto 1.5rem' }}>
        {configured
          ? 'Submit a new lead form from the home portal to view routing engine decisions here.'
          : 'Please add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY to your environment variables.'}
      </p>
      {configured && (
        <Link href="/" className="btn-secondary" style={{ textDecoration: 'none' }}>
          Go to Lead Form →
        </Link>
      )}
    </div>
  )
}

export default function LeadsInboxView({ initialLeads, configured }: Props) {
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  // Client-side sorting logic
  const sortedLeads = [...initialLeads].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    }
    if (sortBy === 'priority') {
      const priorityDiff = ROUTE_PRIORITY[a.route] - ROUTE_PRIORITY[b.route]
      if (priorityDiff !== 0) return priorityDiff
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    if (sortBy === 'score') {
      const scoreDiff = b.score - a.score
      if (scoreDiff !== 0) return scoreDiff
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    return 0
  })

  return (
    <div>
      {initialLeads.length > 0 && <StatsRow leads={initialLeads} />}

      {/* Main Table Container Card */}
      <div className="apple-card" style={{ overflow: 'hidden' }}>
        {initialLeads.length > 0 && (
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              background: '#ffffff',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Submissions Log
              </h2>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Showing {sortedLeads.length} record{sortedLeads.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* Custom Sort Select Dropdown */}
            <div style={{ width: '240px' }}>
              <CustomSelect
                options={SORT_OPTIONS}
                value={sortBy}
                onChange={(val) => setSortBy(val as SortOption)}
                placeholder="Sort leads"
              />
            </div>
          </div>
        )}

        {initialLeads.length === 0 ? (
          <EmptyState configured={configured} />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="apple-table" style={{ minWidth: 960 }}>
              <thead>
                <tr>
                  <th>Routing Decision</th>
                  <th>Contact</th>
                  <th>Company Size</th>
                  <th>Budget</th>
                  <th style={{ minWidth: 240 }}>What looking to solve</th>
                  <th>Matched Rules / Score</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {sortedLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <RouteBadge route={lead.route} />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                        {lead.name}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {lead.email}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                          color: '#1d1d1f',
                          background: '#f2f2f7',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.375rem',
                          border: '1px solid #e5e5ea',
                        }}
                      >
                        {lead.companySize}
                      </span>
                    </td>
                    <td>
                      {lead.budget === '10k_plus' ? (
                        <span style={{ color: '#0071e3', fontWeight: 600 }}>$10k+</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>&lt; $10k</span>
                      )}
                    </td>
                    <td>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.875rem',
                          lineHeight: 1.45,
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
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                        {lead.matchedRules.length > 0 ? (
                          lead.matchedRules.map((rule) => (
                            <span key={rule} className="rule-chip">
                              {rule}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                            Default Fallthrough
                          </span>
                        )}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          Score: {lead.score}
                        </span>
                      </div>
                    </td>
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

      {/* Expandable Decision Audit Log */}
      {sortedLeads.length > 0 && (
        <details
          style={{
            marginTop: '2rem',
            padding: '1.25rem 1.5rem',
            background: '#ffffff',
            border: '1px solid var(--border)',
            borderRadius: '1rem',
          }}
        >
          <summary
            style={{
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: 'var(--text-primary)',
            }}
          >
            Explainability Audit Log ({sortedLeads.length} decisions)
          </summary>
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sortedLeads.map((lead) => (
              <div
                key={lead.id}
                style={{
                  padding: '0.875rem 1.125rem',
                  background: '#f9f9fb',
                  border: '1px solid #e5e5ea',
                  borderRadius: '0.625rem',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-muted)' }}>
                  [{lead.id.slice(0, 8)}]
                </span>{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{lead.name}:</strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{lead.reason}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
