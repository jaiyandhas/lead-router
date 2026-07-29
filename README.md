# Lead Router

A B2B SaaS lead routing engine built as a full-stack architecture exercise.

The core problem: three stakeholders (Sales, Growth, Founder) have conflicting requirements for what should happen when a user submits a lead form. This project resolves the conflict by separating two orthogonal questions that are often confused:

| Question | Answer | Why |
|---|---|---|
| Should this lead be stored? | **Always yes** | Storage is cheap. Satisfies Growth. |
| Should a human spend time on this lead right now? | **Only if it qualifies** | Human attention is the scarce resource. |

---

## Architecture

### Why Ordered Rules Instead of Weighted Scoring?

The three stakeholders did not express *weighted preferences*. They expressed *absolute business priorities*:

- The **Founder** said: urgency overrides everything — if someone needs help now, a human must respond regardless of company size or budget.
- **Sales** said: only companies with 50+ employees and budgets above $10k deserve a sales call.
- **Growth** said: every lead must be stored, full stop.

These are not inputs to a formula. They are ordered rules with a clear hierarchy.

**Weighted scoring fails here for three reasons:**

1. **Arbitrary numbers.** What score should urgency add — 50 points? 80? Someone decides once and nobody revisits it. The number carries no business meaning.
2. **Silent interactions.** A very large company with no urgency can outscore an urgent small company. Is that the intended behaviour? The system won't tell you — you'll just see a number.
3. **Hard to audit.** When a sales rep asks "why wasn't this lead sent to me?", a score of 68 is not an explanation. A `matchedRules` field containing `['qualified_sales_lead']` is.

**Ordered rules solve all three:**

- The priority order is the specification. Read it and you know exactly what will happen for any lead.
- Adding a rule means inserting it at the correct array position. No weights to recalibrate.
- `matchedRules` tells you precisely which rule fired — for sales, support, audit, and future ML workflows.

The numeric `score` field exists as supporting metadata for dashboards and human readability. It is derived from which rule fires. It is **never compared between leads** and **never used to make a routing decision**.

---

### Routing Priority

Evaluation stops at the **first matching rule**. Rules do not interact with each other.

```
┌─────────────────────────────────────────────────────────────────────┐
│  Priority 1: urgency_detected                                       │
│                                                                     │
│  Condition:  Urgency keyword found in stated intent                 │
│              (e.g. "ASAP", "this quarter", "immediately")           │
│  Route:      human_immediate                                        │
│  Rationale:  Founder requirement — time-sensitive needs override    │
│              all other qualification criteria                       │
├─────────────────────────────────────────────────────────────────────┤
│  Priority 2: qualified_sales_lead                                   │
│                                                                     │
│  Condition:  Company size ≥50 employees AND budget ≥$10k            │
│              Both conditions must be true                           │
│  Route:      human_standard                                         │
│  Rationale:  Sales team requirement — minimum thresholds for        │
│              a call to be worth a sales rep's time                  │
├─────────────────────────────────────────────────────────────────────┤
│  Priority 3: default fallthrough                                    │
│                                                                     │
│  Condition:  No rule above matched                                  │
│  Route:      crm_only                                               │
│  Rationale:  Growth requirement — store every lead for nurture      │
│              and retargeting regardless of current qualification    │
└─────────────────────────────────────────────────────────────────────┘
```

To add a new rule: register its name in `domain/types.ts → RuleName`, then insert a `Rule` object at the correct array position in `domain/routing/rules.ts`. **The engine function does not change.**

---

### The Three Routes

| Route | Condition | Stakeholder |
|---|---|---|
| `human_immediate` | Urgency detected in stated intent | Founder |
| `human_standard` | Company ≥50 employees **and** budget ≥$10k | Sales |
| `crm_only` | Everything else — stored for nurture | Growth |

---

### Why `matchedRules` Exists

`matchedRules` is an **explainability feature**, not a debug field. It answers:

- **Sales**: "Why wasn't this lead routed to me?"
- **Support**: "Why didn't anyone call this person back?"
- **Audit**: Historical record of exactly which rule fired at the time of submission — even if rules change later.
- **Future ML**: Ground truth labels for supervised learning if routing is ever AI-assisted.

`matchedRules` is typed as `RuleName[]` (not `string[]`) so the compiler catches typos and keeps rule registration centralised in `domain/types.ts`.

---

### Immutable Decision Snapshot

Every persisted lead stores both the submitted data **and** the routing decision made at the time of submission:

| Field | Source |
|---|---|
| `name`, `email`, `companySize`, `budget`, `intent` | Submitted form data |
| `id` | Generated by the database |
| `createdAt` | Written at insert time |
| `route` | Routing engine output |
| `score` | Routing engine output |
| `reason` | Routing engine output |
| `matchedRules` | Routing engine output |

**Why not re-derive the routing result when reading leads?**

Routing rules will evolve. A lead submitted today might receive a different route if re-evaluated against next quarter's rules. Storing the snapshot means you can always answer "what decision was made, and why, at the moment this lead came in" — without re-running business logic against stale data. This is the append-only audit log pattern.

---

## Folder Structure

```
src/
├── app/
│   ├── api/leads/route.ts        # API route — orchestrates, owns no business rules
│   ├── leads/page.tsx            # Internal inspection page (Step 6)
│   └── page.tsx                  # Lead submission form (Step 5)
│
├── domain/                       # Pure TypeScript. Zero infrastructure dependencies.
│   ├── types.ts                  # Shared vocabulary: all types and enums
│   └── routing/
│       ├── rules.ts              # Rule definitions, ordered by priority
│       ├── engine.ts             # routeLead() — pure function, no I/O
│       └── engine.test.ts        # 14 test cases, no mocks required
│
├── lib/                          # Infrastructure layer. Depends on frameworks.
│   ├── supabase/
│   │   ├── client.ts             # Supabase client init (Step 3)
│   │   └── leads.ts              # insertLead(), getLeads() (Step 3)
│   └── validation/
│       └── leadSchema.ts         # Zod schema (Step 4)
│
└── components/
    └── LeadForm/
        ├── LeadForm.tsx          # React Hook Form + Zod (Step 5)
        └── ConfirmationScreen.tsx # Route-aware confirmation (Step 5)
```

### `domain/` vs `lib/`

- **`domain/`** — what this business does. Types, rules, decisions. No imports from Next.js, Supabase, or any external library. If this directory were copied into any TypeScript project, it would compile unchanged.
- **`lib/`** — how this system connects to infrastructure. Database clients, external services. These have framework dependencies.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Validation | Zod |
| Forms | React Hook Form |
| Testing | Vitest |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (see [Supabase Setup](#supabase-setup) below)

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Run the test suite

```bash
npm test
```

The routing engine is a pure function (`routeLead`), so the entire test suite runs with **zero mocks, zero network calls, and zero database connections.**

```
✓ src/domain/routing/engine.test.ts (14 tests)
```

The 14 tests cover six categories of behaviour:

| Category | What is verified |
|---|---|
| **Priority order** | Urgency always fires before qualification; a qualified urgent lead goes to `human_immediate`, not `human_standard` |
| **Urgency detection** | All defined keywords (`asap`, `this quarter`, `immediately`, `as soon as possible`, etc.) trigger `urgency_detected` |
| **Case-insensitive matching** | `"NEED THIS IMMEDIATELY"` produces the same result as `"need this immediately"` |
| **Qualification logic** | Both conditions (company ≥50 employees AND budget ≥$10k) must be true; either alone falls through to `crm_only` |
| **Fallthrough behaviour** | An unqualified, non-urgent lead produces `crm_only` with `matchedRules: []` |
| **Result shape invariants** | Every route produces a numeric score in [0, 100] and a non-empty reason string |

---

## Environment Variables

> Required for Steps 3–7 (persistence and deployment). The routing engine and tests run without them.

Create a `.env.local` file at the project root (already gitignored):

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-publishable-key-here
```

**Why no `NEXT_PUBLIC_` prefix?**

In Next.js, variables prefixed with `NEXT_PUBLIC_` are bundled into the browser's JavaScript bundle — they're visible to anyone who opens DevTools. Variables without that prefix are server-only: only accessible in API routes and server components, never sent to the browser.

The Supabase client in this project is server-side only. The browser never holds a database client. It submits a form to the API route and receives JSON back. There is no reason to expose the project URL or publishable key to the browser, so we don't.

---

## Supabase Setup

Run the following in your Supabase project → **SQL Editor → New Query**.

### 1. Create the leads table

```sql
CREATE TABLE leads (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL    DEFAULT now(),

  -- LeadInput fields
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL,
  company_size  TEXT        NOT NULL CHECK (company_size IN ('1-10', '11-49', '50-199', '200+')),
  budget        TEXT        NOT NULL CHECK (budget IN ('under_10k', '10k_plus')),
  intent        TEXT        NOT NULL,

  -- RoutingResult snapshot (stored at write time, never recalculated)
  route         TEXT        NOT NULL CHECK (route IN ('human_immediate', 'human_standard', 'crm_only')),
  score         INTEGER     NOT NULL CHECK (score BETWEEN 0 AND 100),
  reason        TEXT        NOT NULL,
  matched_rules TEXT[]      NOT NULL
);
```

The `CHECK` constraints mirror the TypeScript union types — valid values are enforced at both the type level (compile time) and the database level (runtime).

### 2. Add the index

```sql
CREATE INDEX idx_leads_created_at
  ON leads(created_at DESC);
```

`listLeads()` orders by `created_at DESC`. This index backs that query directly. The sort direction in the index definition matches the query — Postgres can satisfy the ORDER BY with an index scan rather than a sort step.

A second index on `route` was considered and rejected: no current query filters by route, so an index there would slow down INSERTs (Postgres maintains every index on write) with no read benefit.

### 3. Enable Row Level Security

```sql
-- Step 1: Enable RLS. Without this, all policies below are ignored.
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Step 2: Allow anonymous INSERT (anyone can submit a lead)
CREATE POLICY "leads: anon can insert"
  ON leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Step 3: Allow anonymous SELECT (anyone can read leads)
CREATE POLICY "leads: anon can select"
  ON leads
  FOR SELECT
  TO anon
  USING (true);
```

### Understanding the publishable key and RLS

This distinction is a common interview question and worth being precise about.

**The publishable key identifies the Supabase project.** It tells the Supabase SDK which database cluster to connect to. It is not a personal credential — it does not authenticate a user or grant any inherent permissions. Everyone who uses your app shares the same publishable key.

**Row Level Security policies determine what requests made with that key are actually allowed to do.** RLS is a Postgres feature. When enabled on a table, every query — regardless of who sent it — must pass a policy check. If no policy permits the operation, the request is denied.

Putting it together:

| What it does | Mechanism |
|---|---|
| Identifies which database to talk to | Publishable key |
| Decides what operations are permitted | RLS policies |

The publishable key without a permissive RLS policy grants nothing. An RLS policy without the publishable key cannot be reached. They are separate concerns — one is routing, one is authorization.

### Why these policies are acceptable only for this assignment

The anonymous `SELECT` policy means any visitor who knows your project URL can read every lead: names, emails, intent statements, and routing decisions. That is a privacy violation in production.

In production, the `SELECT` policy would require an authenticated session with an appropriate role (`sales`, `admin`). The form submission `INSERT` might also go through a server-side API route using a service role key, with rate limiting to prevent spam.

---

## Build Status

| Step | Status | Description |
|---|---|---|
| Step 1 | ✅ Complete | Domain types |
| Step 2 | ✅ Complete | Routing engine + 14 tests |
| Step 3 | ✅ Complete | Supabase persistence |
| Step 4 | 🔜 Next | API route |
| Step 5 | 🔜 Pending | Lead form |
| Step 6 | 🔜 Pending | Internal /leads page |
| Step 7 | 🔜 Pending | Vercel deployment |

---

## Design Decisions

**Why string literal unions instead of TypeScript enums?**  
Enums compile to JavaScript objects with reverse mappings, have surprising numeric edge cases, and are heavier than necessary for a finite set of string values. String literal unions have zero runtime footprint and serialize naturally to JSON and databases.

**Why is `createdAt` a `string` not a `Date`?**  
`Date` objects don't survive JSON serialization — they become strings regardless. Keeping it as an ISO 8601 string avoids silent parse/serialize roundtrips in API responses. Convert to `Date` at the display layer only when formatting.

**Why `lib/supabase/` and not `lib/db/`?**  
`lib/db/` would imply a database-agnostic abstraction that doesn't exist. This project uses Supabase-specific clients, Supabase RLS, and Supabase environment variables. Naming it `lib/supabase/` is more honest about the concrete dependency.

**Why is `ScoredLead` not a type?**  
A `Lead` plus a `RoutingResult` are just two variables in the API route. Bundling them into a `ScoredLead` type would create a type that exists only to carry data between two adjacent lines of code — not a domain concept worth naming.

**Why does `detectUrgency` prefer false positives over false negatives?**  
A missed urgency signal means a time-sensitive person waits. A false positive means a non-urgent lead gets faster attention than necessary. In a B2B sales context, the cost of the latter is far lower. The keyword list is intentionally broad.
