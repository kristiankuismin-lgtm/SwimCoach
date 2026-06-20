-- =============================================
-- Demo swimmers — 4 uutta uimaria + ryhmä
-- =============================================
DO $$
DECLARE
  v_club_id    UUID;
  v_coach_id   UUID;
  v_group_id   UUID;
  v_kristian   UUID;
  -- uudet uimarit
  s1 UUID; s2 UUID; s3 UUID; s4 UUID;
  -- kilpailut (samat kuin kristianilla)
  c1 UUID; c2 UUID;
BEGIN

-- Hae club + coach
SELECT club_id INTO v_club_id FROM swimmers
  JOIN auth.users ON swimmers.user_id = auth.users.id
  WHERE auth.users.email = 'kristian.kuismin@gmail.com' LIMIT 1;
IF v_club_id IS NULL THEN RAISE EXCEPTION 'Club ei löydy'; END IF;

SELECT id INTO v_coach_id FROM coaches WHERE club_id = v_club_id LIMIT 1;

-- Hae Kristianin swimmer_id
SELECT id INTO v_kristian FROM swimmers WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'kristian.kuismin@gmail.com'
) LIMIT 1;

-- Luo tai hae ryhmä "Kilpa A"
INSERT INTO training_groups (club_id, coach_id, name, description)
VALUES (v_club_id, v_coach_id, 'Kilpa A', 'Kilpauimarit A-ryhmä')
ON CONFLICT DO NOTHING;
SELECT id INTO v_group_id FROM training_groups WHERE club_id = v_club_id AND name = 'Kilpa A' LIMIT 1;

-- Lisää Kristian ryhmään
INSERT INTO group_members (group_id, swimmer_id) VALUES (v_group_id, v_kristian)
ON CONFLICT (group_id, swimmer_id) DO NOTHING;

-- =============================================
-- LUO 4 UUTTA UIMARIA
-- =============================================

-- 1. Emilia Mäkinen — hyvällä uralla, 78% tavoitteesta
INSERT INTO swimmers (club_id, full_name, birth_date, primary_stroke, lane_number)
VALUES (v_club_id, 'Emilia Mäkinen', '2006-03-14', 'vapaa', 2)
ON CONFLICT DO NOTHING
RETURNING id INTO s1;
IF s1 IS NULL THEN
  SELECT id INTO s1 FROM swimmers WHERE club_id = v_club_id AND full_name = 'Emilia Mäkinen';
END IF;
INSERT INTO group_members (group_id, swimmer_id) VALUES (v_group_id, s1)
ON CONFLICT DO NOTHING;

-- 2. Mikael Virtanen — jäljessä tavoitteesta (45%), riski
INSERT INTO swimmers (club_id, full_name, birth_date, primary_stroke, lane_number)
VALUES (v_club_id, 'Mikael Virtanen', '2005-08-22', 'selkä', 3)
ON CONFLICT DO NOTHING
RETURNING id INTO s2;
IF s2 IS NULL THEN
  SELECT id INTO s2 FROM swimmers WHERE club_id = v_club_id AND full_name = 'Mikael Virtanen';
END IF;
INSERT INTO group_members (group_id, swimmer_id) VALUES (v_group_id, s2)
ON CONFLICT DO NOTHING;

-- 3. Sanna Korhonen — lähes tavoitteessa, 91%
INSERT INTO swimmers (club_id, full_name, birth_date, primary_stroke, lane_number)
VALUES (v_club_id, 'Sanna Korhonen', '2007-01-05', 'perho', 4)
ON CONFLICT DO NOTHING
RETURNING id INTO s3;
IF s3 IS NULL THEN
  SELECT id INTO s3 FROM swimmers WHERE club_id = v_club_id AND full_name = 'Sanna Korhonen';
END IF;
INSERT INTO group_members (group_id, swimmer_id) VALUES (v_group_id, s3)
ON CONFLICT DO NOTHING;

-- 4. Aleksi Leinonen — vahva PK-uimari, 62%
INSERT INTO swimmers (club_id, full_name, birth_date, primary_stroke, lane_number)
VALUES (v_club_id, 'Aleksi Leinonen', '2004-11-30', 'vapaa', 5)
ON CONFLICT DO NOTHING
RETURNING id INTO s4;
IF s4 IS NULL THEN
  SELECT id INTO s4 FROM swimmers WHERE club_id = v_club_id AND full_name = 'Aleksi Leinonen';
END IF;
INSERT INTO group_members (group_id, swimmer_id) VALUES (v_group_id, s4)
ON CONFLICT DO NOTHING;

-- =============================================
-- VUOSITAVOITTEET 2026
-- =============================================
INSERT INTO yearly_goals (swimmer_id, season_year,
  target_pool_km, target_dryland_hours, target_workouts,
  target_pct_pk, target_pct_vk, target_pct_mk, target_pct_mak,
  target_stroke, target_distance, target_time_ms)
VALUES
  (s1, 2026, 550, 35, 90, 60, 20, 15, 5, 'vapaa', '100', 58000),
  (s2, 2026, 480, 30, 85, 65, 20, 12, 3, 'selkä', '100', 62000),
  (s3, 2026, 520, 32, 88, 60, 22, 13, 5, 'perho', '100', 65000),
  (s4, 2026, 600, 40, 95, 70, 15, 12, 3, 'vapaa', '400', 245000)
ON CONFLICT (swimmer_id, season_year) DO NOTHING;

-- =============================================
-- HARJOITUKSET + LÄSNÄOLOT
-- (käytetään olemassa olevia harjoituksia Kristianilta)
-- =============================================

-- Emilia: 18 harjoitusta, 430km (78%)
INSERT INTO workout_attendance (workout_id, swimmer_id, actual_pool_m)
SELECT w.id, s1,
  CASE ROW_NUMBER() OVER (ORDER BY w.workout_date)
    WHEN 1 THEN 4200 WHEN 2 THEN 3800 WHEN 3 THEN 5100 WHEN 4 THEN 4600
    WHEN 5 THEN 4900 WHEN 6 THEN 3500 WHEN 7 THEN 5200 WHEN 8 THEN 4400
    WHEN 9 THEN 4800 WHEN 10 THEN 3900 ELSE 4000
  END
FROM workouts w WHERE w.club_id = v_club_id ORDER BY w.workout_date LIMIT 18
ON CONFLICT DO NOTHING;

-- Mikael: 10 harjoitusta, 216km (45%)
INSERT INTO workout_attendance (workout_id, swimmer_id, actual_pool_m)
SELECT w.id, s2,
  CASE ROW_NUMBER() OVER (ORDER BY w.workout_date)
    WHEN 1 THEN 4000 WHEN 2 THEN 4200 WHEN 3 THEN 3800 WHEN 4 THEN 4500
    WHEN 5 THEN 3900 ELSE 3600
  END
FROM workouts w WHERE w.club_id = v_club_id ORDER BY w.workout_date LIMIT 10
ON CONFLICT DO NOTHING;

-- Sanna: 21 harjoitusta, 473km (91%)
INSERT INTO workout_attendance (workout_id, swimmer_id, actual_pool_m)
SELECT w.id, s3,
  CASE ROW_NUMBER() OVER (ORDER BY w.workout_date)
    WHEN 1 THEN 4500 WHEN 2 THEN 5000 WHEN 3 THEN 4200 WHEN 4 THEN 4800
    WHEN 5 THEN 5100 WHEN 6 THEN 4600 WHEN 7 THEN 4900 WHEN 8 THEN 4300
    WHEN 9 THEN 4700 WHEN 10 THEN 5000 ELSE 4400
  END
FROM workouts w WHERE w.club_id = v_club_id ORDER BY w.workout_date LIMIT 21
ON CONFLICT DO NOTHING;

-- Aleksi: 15 harjoitusta, 372km (62%)
INSERT INTO workout_attendance (workout_id, swimmer_id, actual_pool_m)
SELECT w.id, s4,
  CASE ROW_NUMBER() OVER (ORDER BY w.workout_date)
    WHEN 1 THEN 5500 WHEN 2 THEN 5800 WHEN 3 THEN 6000 WHEN 4 THEN 5200
    WHEN 5 THEN 5600 WHEN 6 THEN 5300 WHEN 7 THEN 5900 ELSE 5000
  END
FROM workouts w WHERE w.club_id = v_club_id ORDER BY w.workout_date LIMIT 15
ON CONFLICT DO NOTHING;

-- =============================================
-- KISATULOKSET
-- =============================================
SELECT id INTO c1 FROM competitions WHERE club_id = v_club_id ORDER BY competition_date ASC LIMIT 1;
SELECT id INTO c2 FROM competitions WHERE club_id = v_club_id ORDER BY competition_date DESC LIMIT 1;

-- Emilia — 100m vapaa parantunut
INSERT INTO personal_records (swimmer_id, stroke, distance, best_time_ms, is_baseline, set_at)
VALUES (s1, 'vapaa', '100', 60200, true, '2026-01-01')
ON CONFLICT (swimmer_id, stroke, distance, is_baseline) DO NOTHING;
INSERT INTO competition_results (competition_id, swimmer_id, stroke, distance, result_time_ms)
VALUES (c1, s1, 'vapaa', '100', 60200), (c2, s1, 'vapaa', '100', 58800)
ON CONFLICT DO NOTHING;

-- Mikael — 100m selkä
INSERT INTO personal_records (swimmer_id, stroke, distance, best_time_ms, is_baseline, set_at)
VALUES (s2, 'selkä', '100', 65400, true, '2026-01-01')
ON CONFLICT (swimmer_id, stroke, distance, is_baseline) DO NOTHING;
INSERT INTO competition_results (competition_id, swimmer_id, stroke, distance, result_time_ms)
VALUES (c1, s2, 'selkä', '100', 65400), (c2, s2, 'selkä', '100', 64100)
ON CONFLICT DO NOTHING;

-- Sanna — 100m perho
INSERT INTO personal_records (swimmer_id, stroke, distance, best_time_ms, is_baseline, set_at)
VALUES (s3, 'perho', '100', 68900, true, '2026-01-01')
ON CONFLICT (swimmer_id, stroke, distance, is_baseline) DO NOTHING;
INSERT INTO competition_results (competition_id, swimmer_id, stroke, distance, result_time_ms)
VALUES (c1, s3, 'perho', '100', 68900), (c2, s3, 'perho', '100', 67300)
ON CONFLICT DO NOTHING;

-- Aleksi — 400m vapaa
INSERT INTO personal_records (swimmer_id, stroke, distance, best_time_ms, is_baseline, set_at)
VALUES (s4, 'vapaa', '400', 252000, true, '2026-01-01')
ON CONFLICT (swimmer_id, stroke, distance, is_baseline) DO NOTHING;
INSERT INTO competition_results (competition_id, swimmer_id, stroke, distance, result_time_ms)
VALUES (c1, s4, 'vapaa', '400', 252000), (c2, s4, 'vapaa', '400', 247500)
ON CONFLICT DO NOTHING;

RAISE NOTICE 'Demo swimmers lisätty onnistuneesti\!';
END $$;
