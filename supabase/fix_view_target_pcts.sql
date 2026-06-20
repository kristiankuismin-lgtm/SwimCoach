-- Fix swimmer_season_summary view to include zone targets
CREATE OR REPLACE VIEW swimmer_season_summary AS
SELECT
  s.id                          AS swimmer_id,
  s.full_name,
  s.club_id,
  yg.season_year,
  -- Volyymi
  COALESCE(SUM(wa.actual_pool_m), 0)          AS total_pool_m,
  COALESCE(SUM(wa.actual_dryland_min), 0)     AS total_dryland_min,
  COUNT(DISTINCT wa.workout_id)               AS total_workouts,
  -- Tavoitteet
  yg.target_pool_km * 1000                    AS target_pool_m,
  yg.target_dryland_hours * 60               AS target_dryland_min,
  yg.target_workouts,
  -- Tehoaluetavoitteet
  yg.target_pct_pk,
  yg.target_pct_vk,
  yg.target_pct_mk,
  yg.target_pct_mak,
  -- Tavoitteen toteutumis-%
  ROUND(
    COALESCE(SUM(wa.actual_pool_m), 0)::numeric
    / NULLIF(yg.target_pool_km * 1000, 0) * 100, 1
  )                                           AS goal_pool_pct,
  -- Tehoaluejakauma (toteutunut)
  ROUND(
    SUM(CASE WHEN ps.intensity_zone = 'pk'  THEN ps.total_m ELSE 0 END)::numeric
    / NULLIF(SUM(ps.total_m), 0) * 100, 1
  )                                           AS pct_pk,
  ROUND(
    SUM(CASE WHEN ps.intensity_zone = 'vk'  THEN ps.total_m ELSE 0 END)::numeric
    / NULLIF(SUM(ps.total_m), 0) * 100, 1
  )                                           AS pct_vk,
  ROUND(
    SUM(CASE WHEN ps.intensity_zone = 'mk'  THEN ps.total_m ELSE 0 END)::numeric
    / NULLIF(SUM(ps.total_m), 0) * 100, 1
  )                                           AS pct_mk,
  ROUND(
    SUM(CASE WHEN ps.intensity_zone = 'mak' THEN ps.total_m ELSE 0 END)::numeric
    / NULLIF(SUM(ps.total_m), 0) * 100, 1
  )                                           AS pct_mak
FROM swimmers s
LEFT JOIN yearly_goals yg          ON yg.swimmer_id = s.id
LEFT JOIN workout_attendance wa    ON wa.swimmer_id  = s.id
LEFT JOIN workouts w               ON w.id = wa.workout_id
  AND EXTRACT(YEAR FROM w.workout_date) = yg.season_year
LEFT JOIN pool_sets ps             ON ps.workout_id = w.id
GROUP BY s.id, s.full_name, s.club_id, yg.season_year,
         yg.target_pool_km, yg.target_dryland_hours, yg.target_workouts,
         yg.target_pct_pk, yg.target_pct_vk, yg.target_pct_mk, yg.target_pct_mak;
