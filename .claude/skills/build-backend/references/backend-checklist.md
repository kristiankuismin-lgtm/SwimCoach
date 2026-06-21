# Backend build checklist

Run through this on every change. Done = every box passes or is explicitly out of scope.

## Migration hygiene
- [ ] Schema/policy/view/function change is a NEW timestamped migration in `supabase/migrations/`.
- [ ] No edit to an already-applied/shared migration; no ad-hoc DDL straight to the DB.
- [ ] Exactly one active definition per object; superseded/broken SQL is in `sql-archive/`, not `migrations/`.
- [ ] `supabase db reset` runs clean (migrations + seed) end to end.

## RLS
- [ ] New table: `ENABLE ROW LEVEL SECURITY` AND explicit policies, in the same migration.
- [ ] Club scoping uses `public.current_club_id()`, not a raw inline `SELECT ... FROM users` subquery.
- [ ] Child tables scope through their parent; reads/writes scoped by the principal, never a client id.
- [ ] Verified with a signed-in (anon→authenticated) query, not only a service-role read.

## Views & aggregation
- [ ] No `SUM` of a per-row metric across a join that fans out a child table — separate subqueries per grain.
- [ ] `DROP VIEW` before re-creating if columns are reordered/inserted (CREATE OR REPLACE only appends).
- [ ] `security_invoker = on` set if the view is relied on for multi-tenant isolation (not just local demo).

## Types & domain
- [ ] `types/database.ts` regenerated via `npm run db:types`; never hand-edited.
- [ ] Enum values exact: strokes `vapaa/selka/rinta/perho/sekauinti`, zones `pk/vk/mk/mak`, distances TEXT,
      times integer ms.
- [ ] Demo rows in `seed.sql` match the real column set (not the drifted `demo_*.sql`).

## Edge functions
- [ ] Principal resolved from JWT; only that club's data fetched; response is JSON.
- [ ] No `\!`-escaped source (shell artifact); rule-based copilot kept as offline fallback.
