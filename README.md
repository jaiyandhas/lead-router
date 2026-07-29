# Lead Router

A B2B SaaS lead routing engine built as a full-stack architecture exercise.

The core problem: three stakeholders (Sales, Growth, Founder) have conflicting requirements for what should happen when a user submits a lead form. This project resolves the conflict by separating two orthogonal questions that are often confused:

| Question | Answer | Why |
|---|---|---|
| Should this lead be stored? | **Always yes** | Storage is cheap. Satisfies Growth. |
| Should a human spend time on this lead right now? | **Only if it qualifies** | Human attention is the scarce resource. |

---

## Architecture

### Routing vs Scoring

This system is a **routing engine**, not a scoring engine. The distinction matters:

- A scoring engine picks a winner by comparing numbers. The routing decision is implicit.
- A routing engine applies ordered business rules. The decision is explicit and auditable.

Routing decisions are determined exclusively by rule priority order. A numeric `score` field exists for human readability and dashboard display only — it is never compared between leads to make a routing decision.

### The three routes

| Route | Condition | Stakeholder |
|---|---|---|
| `human_immediate` | Urgency detected in stated intent | Founder |
| `human_standard` | Company ≥50 employees **and** budget ≥$10k | Sales |
| `crm_only` | Everything else — stored for nurture | Growth |

### Rule priority

Rules are evaluated in order. **The first matching rule wins.** There is no scoring, no weight tuning, no implicit interaction between rules.

```
Priority 1: urgency_detected     → human_immediate
Priority 2: qualified_sales_lead → human_standard
Priority 3: (default fallthrough) → crm_only
```

Adding a new rule means inserting a rule object at the correct array position. The routing engine itself does not change.

### Why `matchedRules` exists

`matchedRules` is an **explainability feature**, not a debug field. It answers:
- **Sales**: "Why wasn't this lead routed to me?"
- **Support**: "Why didn't anyone call this person back?"
- **Audit**: Historical record of which rule fired at the time of submission.
- **Future ML**: Ground truth labels for supervised learning if routing is ever AI-assisted.

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
- A Supabase project (see [Step 3 setup](#supabase-setup) below)

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

Tests are co-located with the modules they cover in `src/domain/routing/`. Because `routeLead()` is a pure function, the entire test suite runs with zero mocks, zero network calls, and zero database connections.

```
✓ src/domain/routing/engine.test.ts (14 tests)
```

---

## Environment Variables

> These are required for Steps 3–7 (persistence and deployment). The app will run without them for Steps 1–2.

Create a `.env.local` file at the project root (this file is gitignored):

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Why two Supabase keys?**

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — safe to expose to the browser. Supabase Row Level Security (RLS) policies control what the anon key can and cannot do.
- `SUPABASE_SERVICE_ROLE_KEY` — bypasses RLS entirely. **Never expose this to the browser.** It must only be used in server-side code (API routes). It has no `NEXT_PUBLIC_` prefix intentionally.

---

## Supabase Setup

> Coming in Step 3. Will include the `leads` table schema, RLS policies, and an explanation of what each policy protects.

---

## Build Status

| Step | Status | Description |
|---|---|---|
| Step 1 | ✅ Complete | Domain types |
| Step 2 | ✅ Complete | Routing engine + tests |
| Step 3 | 🔜 Next | Supabase persistence |
| Step 4 | 🔜 Pending | API route |
| Step 5 | 🔜 Pending | Lead form |
| Step 6 | 🔜 Pending | Internal /leads page |
| Step 7 | 🔜 Pending | Vercel deployment |

---

## Design Decisions

**Why not weighted scoring?**  
Weights are arbitrary numbers that someone tuned once and never revisited. They interact silently — a large company with no urgency can outscore an urgent small company. With explicit priority rules, every decision is auditable: you can read the rule list and predict the outcome for any lead.

**Why string literal unions instead of TypeScript enums?**  
Enums compile to JavaScript objects with reverse mappings, have surprising numeric edge cases, and are heavier than necessary for a finite set of string values. String literal unions have zero runtime footprint and serialize naturally to JSON and databases.

**Why is `createdAt` a `string` not a `Date`?**  
`Date` objects don't survive JSON serialization — they become strings regardless. Keeping it as an ISO 8601 string avoids silent parse/serialize roundtrips in API responses. Convert to `Date` at the display layer only when formatting.

**Why `lib/supabase/` and not `lib/db/`?**  
`lib/db/` would imply a database-agnostic abstraction that doesn't exist. This project uses Supabase-specific clients, Supabase RLS, and Supabase environment variables. Naming it `lib/supabase/` is more honest about the concrete dependency.

**Why is `ScoredLead` not a type?**  
A `Lead` plus a `RoutingResult` are just two variables in the API route. Bundling them into a `ScoredLead` type would create a type that exists only to carry data between two adjacent lines of code — not a domain concept worth naming.
