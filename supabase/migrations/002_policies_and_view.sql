-- ============================================================
-- 002 — RLS policies + season-summary view fix
-- Makes the app actually readable for a logged-in coach.
-- The base migration enabled RLS but left most tables with no
-- policy (deny-all) and had no "read your own user row" policy,
-- which broke role resolution in useAuth.
-- ============================================================

-- Helper: caller's club_id. SECURITY DEFINER so the lookup on `users`
-- bypasses RLS (avoids policy recursion / the broken raw-subquery pattern).
CREATE OR REPLACE FUNCTION public.current_club_id() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT club_id FROM public.users WHERE id = auth.uid();
$$;

-- Replace base-migration policies that used raw subqueries on `users`
-- (those return nothing once RLS is on, because there was no users read policy).
DROP POLICY IF EXISTS "club_isolation"   ON swimmers;
DROP POLICY IF EXISTS "club_isolation"   ON workouts;
DROP POLICY IF EXISTS "swimmer_own_data" ON workout_attendance;

-- users: read own row (unblocks useAuth role resolution + every club lookup)
CREATE POLICY "users_self_read" ON users FOR SELECT USING (id = auth.uid());

-- clubs / coaches
CREATE POLICY "clubs_read"   ON clubs   FOR SELECT USING (id = public.current_club_id());
CREATE POLICY "coaches_read" ON coaches FOR SELECT USING (club_id = public.current_club_id());

-- swimmers (read + coach writes)
CREATE POLICY "swimmers_read"  ON swimmers FOR SELECT USING (club_id = public.current_club_id());
CREATE POLICY "swimmers_write" ON swimmers FOR ALL
  USING (club_id = public.current_club_id())
  WITH CHECK (club_id = public.current_club_id());

-- groups
CREATE POLICY "groups_read" ON training_groups FOR SELECT USING (club_id = public.current_club_id());

-- yearly_goals
CREATE POLICY "goals_rw" ON yearly_goals FOR ALL
  USING      (swimmer_id IN (SELECT id FROM swimmers WHERE club_id = public.current_club_id()))
  WITH CHECK (swimmer_id IN (SELECT id FROM swimmers WHERE club_id = public.current_club_id()));

-- workouts
CREATE POLICY "workouts_rw" ON workouts FOR ALL
  USING (club_id = public.current_club_id())
  WITH CHECK (club_id = public.current_club_id());

-- pool_sets
CREATE POLICY "pool_sets_rw" ON pool_sets FOR ALL
  USING      (workout_id IN (SELECT id FROM workouts WHERE club_id = public.current_club_id()))
  WITH CHECK (workout_id IN (SELECT id FROM workouts WHERE club_id = public.current_club_id()));

-- workout_attendance
CREATE POLICY "attendance_rw" ON workout_attendance FOR ALL
  USING      (workout_id IN (SELECT id FROM workouts WHERE club_id = public.current_club_id()))
  WITH CHECK (workout_id IN (SELECT id FROM workouts WHERE club_id = public.current_club_id()));

-- competition_results
CREATE POLICY "results_rw" ON competition_results FOR ALL
  USING      (swimmer_id IN (SELECT id FROM swimmers WHERE club_id = public.current_club_id()))
  WITH CHECK (swimmer_id IN (SELECT id FROM swimmers WHERE club_id = public.current_club_id()));

-- personal_records
CREATE POLICY "pr_rw" ON personal_records FOR ALL
  USING      (swimmer_id IN (SELECT id FROM swimmers WHERE club_id = public.current_club_id()))
  WITH CHECK (swimmer_id IN (SELECT id FROM swimmers WHERE club_id = public.current_club_id()));

-- progress_snapshots (read)
CREATE POLICY "snapshots_read" ON progress_snapshots FOR SELECT
  USING (swimmer_id IN (SELECT id FROM swimmers WHERE club_id = public.current_club_id()));

-- NOTE: competitions, group_members, dryland_exercises, swimmer_embeddings do NOT have
-- RLS enabled in the base migration, so they are already readable; no policy needed here.

-- ============================================================
-- View fix: swimmer_season_summary
--  (1) expose zone *targets* (SwimmerCard + copilot read target_pct_*)
--  (2) FIX the volume fan-out bug: the original summed actual_pool_m across a
--      join that also expanded pool_sets, multiplying volume by #sets/workout.
--      Volume and zone aggregations are now computed in separate subqueries.
-- DROP first: CREATE OR REPLACE can't reorder/insert view columns.
-- ============================================================
DROP VIEW IF EXISTS swimmer_season_summary;
CREATE VIEW swimmer_season_summary AS
SELECT
  s.id                                        AS swimmer_id,
  s.full_name,
  s.club_id,
  yg.season_year,
  COALESCE(vol.total_pool_m, 0)               AS total_pool_m,
  COALESCE(vol.total_dryland_min, 0)          AS total_dryland_min,
  COALESCE(vol.total_workouts, 0)             AS total_workouts,
  yg.target_pool_km * 1000                    AS target_pool_m,
  yg.target_dryland_hours * 60                AS target_dryland_min,
  yg.target_workouts,
  yg.target_pct_pk,
  yg.target_pct_vk,
  yg.target_pct_mk,
  yg.target_pct_mak,
  ROUND(COALESCE(vol.total_pool_m, 0)::numeric
    / NULLIF(yg.target_pool_km * 1000, 0) * 100, 1)        AS goal_pool_pct,
  ROUND(z.pk_m::numeric  / NULLIF(z.tot_m, 0) * 100, 1)    AS pct_pk,
  ROUND(z.vk_m::numeric  / NULLIF(z.tot_m, 0) * 100, 1)    AS pct_vk,
  ROUND(z.mk_m::numeric  / NULLIF(z.tot_m, 0) * 100, 1)    AS pct_mk,
  ROUND(z.mak_m::numeric / NULLIF(z.tot_m, 0) * 100, 1)    AS pct_mak
FROM swimmers s
LEFT JOIN yearly_goals yg ON yg.swimmer_id = s.id
-- Volume from attendance only (no pool_sets fan-out)
LEFT JOIN (
  SELECT wa.swimmer_id,
         EXTRACT(YEAR FROM w.workout_date)::int AS season_year,
         SUM(wa.actual_pool_m)                  AS total_pool_m,
         SUM(wa.actual_dryland_min)             AS total_dryland_min,
         COUNT(DISTINCT wa.workout_id)          AS total_workouts
  FROM workout_attendance wa
  JOIN workouts w ON w.id = wa.workout_id
  GROUP BY wa.swimmer_id, EXTRACT(YEAR FROM w.workout_date)
) vol ON vol.swimmer_id = s.id AND vol.season_year = yg.season_year
-- Zone metres from the sets of attended workouts (separate aggregation)
LEFT JOIN (
  SELECT wa.swimmer_id,
         EXTRACT(YEAR FROM w.workout_date)::int AS season_year,
         SUM(CASE WHEN ps.intensity_zone = 'pk'  THEN ps.total_m ELSE 0 END) AS pk_m,
         SUM(CASE WHEN ps.intensity_zone = 'vk'  THEN ps.total_m ELSE 0 END) AS vk_m,
         SUM(CASE WHEN ps.intensity_zone = 'mk'  THEN ps.total_m ELSE 0 END) AS mk_m,
         SUM(CASE WHEN ps.intensity_zone = 'mak' THEN ps.total_m ELSE 0 END) AS mak_m,
         SUM(ps.total_m)                                                     AS tot_m
  FROM workout_attendance wa
  JOIN workouts w  ON w.id = wa.workout_id
  JOIN pool_sets ps ON ps.workout_id = w.id
  GROUP BY wa.swimmer_id, EXTRACT(YEAR FROM w.workout_date)
) z ON z.swimmer_id = s.id AND z.season_year = yg.season_year;
