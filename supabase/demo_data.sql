-- =============================================
-- SwimCoach demo data — kristian.kuismin@gmail.com
-- Aja tämä Supabase SQL Editorissa
-- =============================================

DO $$
DECLARE
  v_user_id    UUID;
  v_swimmer_id UUID;
  v_club_id    UUID;
  v_coach_id   UUID;
  v_goal_id    UUID;
  -- workout IDs
  w1 UUID; w2 UUID; w3 UUID; w4 UUID; w5 UUID;
  w6 UUID; w7 UUID; w8 UUID; w9 UUID; w10 UUID;
  w11 UUID; w12 UUID;
  -- competition IDs
  c1 UUID; c2 UUID;
BEGIN

-- 1. Hae käyttäjä
SELECT id INTO v_user_id FROM auth.users WHERE email = 'kristian.kuismin@gmail.com';
IF v_user_id IS NULL THEN RAISE EXCEPTION 'Käyttäjää ei löydy'; END IF;

SELECT id, club_id INTO v_swimmer_id, v_club_id
  FROM swimmers WHERE user_id = v_user_id LIMIT 1;
IF v_swimmer_id IS NULL THEN RAISE EXCEPTION 'Uimaria ei löydy'; END IF;

SELECT id INTO v_coach_id FROM coaches WHERE club_id = v_club_id LIMIT 1;

-- =============================================
-- 2. VUOSITAVOITE 2026
-- =============================================
INSERT INTO yearly_goals (
  swimmer_id, season_year,
  target_pool_km, target_dryland_hours, target_workouts,
  target_pct_pk, target_pct_vk, target_pct_mk, target_pct_mak,
  target_stroke, target_distance, target_time_ms
) VALUES (
  v_swimmer_id, 2026,
  600, 40, 100,
  60, 20, 15, 5,
  'vapaa', '100', 55000
)
ON CONFLICT (swimmer_id, season_year) DO UPDATE SET
  target_pool_km = EXCLUDED.target_pool_km,
  target_dryland_hours = EXCLUDED.target_dryland_hours,
  target_workouts = EXCLUDED.target_workouts,
  target_pct_pk = EXCLUDED.target_pct_pk,
  target_pct_vk = EXCLUDED.target_pct_vk,
  target_pct_mk = EXCLUDED.target_pct_mk,
  target_pct_mak = EXCLUDED.target_pct_mak,
  target_stroke = EXCLUDED.target_stroke,
  target_distance = EXCLUDED.target_distance,
  target_time_ms = EXCLUDED.target_time_ms
RETURNING id INTO v_goal_id;

-- =============================================
-- 3. HARJOITUKSET (tammikuu–kesäkuu 2026)
-- =============================================

-- Tammikuu
INSERT INTO workouts (id, club_id, coach_id, workout_date, workout_type, title)
VALUES (gen_random_uuid(), v_club_id, v_coach_id, '2026-01-08', 'uinti', 'Kauden avaus')
RETURNING id INTO w1;

INSERT INTO workouts (id, club_id, coach_id, workout_date, workout_type, title)
VALUES (gen_random_uuid(), v_club_id, v_coach_id, '2026-01-15', 'uinti', 'PK-pohja')
RETURNING id INTO w2;

INSERT INTO workouts (id, club_id, coach_id, workout_date, workout_type, title)
VALUES (gen_random_uuid(), v_club_id, v_coach_id, '2026-01-22', 'uinti', 'Tekniikka + volyymi')
RETURNING id INTO w3;

-- Helmikuu
INSERT INTO workouts (id, club_id, coach_id, workout_date, workout_type, title)
VALUES (gen_random_uuid(), v_club_id, v_coach_id, '2026-02-05', 'uinti', 'VK-intervalli')
RETURNING id INTO w4;

INSERT INTO workouts (id, club_id, coach_id, workout_date, workout_type, title)
VALUES (gen_random_uuid(), v_club_id, v_coach_id, '2026-02-12', 'uinti', 'Pohjatyö')
RETURNING id INTO w5;

INSERT INTO workouts (id, club_id, coach_id, workout_date, workout_type, title)
VALUES (gen_random_uuid(), v_club_id, v_coach_id, '2026-02-19', 'uinti', 'MK-harjoitus')
RETURNING id INTO w6;

-- Maaliskuu
INSERT INTO workouts (id, club_id, coach_id, workout_date, workout_type, title)
VALUES (gen_random_uuid(), v_club_id, v_coach_id, '2026-03-05', 'uinti', 'Sprintti + PK')
RETURNING id INTO w7;

INSERT INTO workouts (id, club_id, coach_id, workout_date, workout_type, title)
VALUES (gen_random_uuid(), v_club_id, v_coach_id, '2026-03-19', 'uinti', 'Kisaharjoitus')
RETURNING id INTO w8;

-- Huhtikuu
INSERT INTO workouts (id, club_id, coach_id, workout_date, workout_type, title)
VALUES (gen_random_uuid(), v_club_id, v_coach_id, '2026-04-02', 'uinti', 'Volyymipäivä')
RETURNING id INTO w9;

INSERT INTO workouts (id, club_id, coach_id, workout_date, workout_type, title)
VALUES (gen_random_uuid(), v_club_id, v_coach_id, '2026-04-16', 'uinti', 'MAK-intervalli')
RETURNING id INTO w10;

-- Toukokuu
INSERT INTO workouts (id, club_id, coach_id, workout_date, workout_type, title)
VALUES (gen_random_uuid(), v_club_id, v_coach_id, '2026-05-07', 'uinti', 'Kisavalmistautuminen')
RETURNING id INTO w11;

-- Kesäkuu
INSERT INTO workouts (id, club_id, coach_id, workout_date, workout_type, title)
VALUES (gen_random_uuid(), v_club_id, v_coach_id, '2026-06-04', 'uinti', 'Kevyt viikko')
RETURNING id INTO w12;

-- =============================================
-- 4. POOL SETS (total_m on GENERATED, ei syötetä)
-- =============================================

-- w1: 5500m, enimmäkseen PK
INSERT INTO pool_sets (workout_id, set_order, repetitions, distance_m, stroke, intensity_zone) VALUES
  (w1, 1, 10, 100, 'vapaa', 'pk'),   -- 1000m
  (w1, 2, 20, 50,  'vapaa', 'pk'),   -- 1000m
  (w1, 3, 8,  200, 'vapaa', 'pk'),   -- 1600m
  (w1, 4, 10, 100, 'vapaa', 'vk'),   -- 1000m pk
  (w1, 5, 4,  100, 'vapaa', 'mk');   -- 400m

-- w2: 6000m PK-pohja
INSERT INTO pool_sets (workout_id, set_order, repetitions, distance_m, stroke, intensity_zone) VALUES
  (w2, 1, 20, 100, 'vapaa', 'pk'),   -- 2000m
  (w2, 2, 10, 200, 'vapaa', 'pk'),   -- 2000m
  (w2, 3, 8,  100, 'selka', 'pk'),   -- 800m
  (w2, 4, 6,  100, 'rinta', 'vk'),   -- 600m
  (w2, 5, 4,  150, 'vapaa', 'vk');   -- 600m

-- w3: 5000m tekniikka
INSERT INTO pool_sets (workout_id, set_order, repetitions, distance_m, stroke, intensity_zone) VALUES
  (w3, 1, 10, 100, 'vapaa', 'pk'),
  (w3, 2, 20, 50,  'selka', 'pk'),
  (w3, 3, 10, 100, 'rinta', 'pk'),
  (w3, 4, 20, 50,  'perho', 'vk'),
  (w3, 5, 8,  100, 'vapaa', 'mk');

-- w4: 5500m VK-intervalli
INSERT INTO pool_sets (workout_id, set_order, repetitions, distance_m, stroke, intensity_zone) VALUES
  (w4, 1, 20, 100, 'vapaa', 'pk'),   -- 2000m
  (w4, 2, 10, 100, 'vapaa', 'vk'),   -- 1000m
  (w4, 3, 8,  200, 'vapaa', 'vk'),   -- 1600m
  (w4, 4, 3,  100, 'vapaa', 'mk'),   -- 300m
  (w4, 5, 6,  100, 'vapaa', 'pk');   -- 600m

-- w5: 6500m pohjatyö
INSERT INTO pool_sets (workout_id, set_order, repetitions, distance_m, stroke, intensity_zone) VALUES
  (w5, 1, 25, 100, 'vapaa', 'pk'),   -- 2500m
  (w5, 2, 16, 200, 'vapaa', 'pk'),   -- 3200m
  (w5, 3, 4,  200, 'vapaa', 'vk'),   -- 800m

-- w6: 5000m MK
  (w6, 1, 10, 100, 'vapaa', 'pk'),   -- 1000m
  (w6, 2, 10, 100, 'vapaa', 'vk'),   -- 1000m
  (w6, 3, 10, 100, 'vapaa', 'mk'),   -- 1000m
  (w6, 4, 5,  200, 'vapaa', 'mk'),   -- 1000m
  (w6, 5, 4,  100, 'vapaa', 'mak');  -- 400m

-- w7: 5200m sprintti + PK
INSERT INTO pool_sets (workout_id, set_order, repetitions, distance_m, stroke, intensity_zone) VALUES
  (w7, 1, 20, 100, 'vapaa', 'pk'),   -- 2000m
  (w7, 2, 20, 50,  'vapaa', 'vk'),   -- 1000m
  (w7, 3, 16, 50,  'vapaa', 'mk'),   -- 800m
  (w7, 4, 12, 50,  'vapaa', 'mak'),  -- 600m
  (w7, 5, 8,  100, 'vapaa', 'pk');   -- 800m

-- w8: 5800m kisaharjoitus
INSERT INTO pool_sets (workout_id, set_order, repetitions, distance_m, stroke, intensity_zone) VALUES
  (w8, 1, 10, 200, 'vapaa', 'pk'),   -- 2000m
  (w8, 2, 10, 100, 'vapaa', 'vk'),   -- 1000m
  (w8, 3, 8,  100, 'vapaa', 'mk'),   -- 800m
  (w8, 4, 10, 100, 'vapaa', 'vk'),   -- 1000m
  (w8, 5, 4,  250, 'vapaa', 'pk');   -- 1000m

-- w9: 7000m volyymipäivä
INSERT INTO pool_sets (workout_id, set_order, repetitions, distance_m, stroke, intensity_zone) VALUES
  (w9, 1, 30, 100, 'vapaa', 'pk'),   -- 3000m
  (w9, 2, 10, 200, 'vapaa', 'pk'),   -- 2000m
  (w9, 3, 10, 100, 'vapaa', 'vk'),   -- 1000m
  (w9, 4, 4,  200, 'vapaa', 'vk'),   -- 800m
  (w9, 5, 4,  50,  'vapaa', 'mk'),   -- 200m

-- w10: 4500m MAK
  (w10, 1, 15, 100, 'vapaa', 'pk'),  -- 1500m
  (w10, 2, 10, 100, 'vapaa', 'vk'),  -- 1000m
  (w10, 3, 8,  50,  'vapaa', 'mk'),  -- 400m
  (w10, 4, 16, 50,  'vapaa', 'mak'), -- 800m
  (w10, 5, 8,  100, 'vapaa', 'pk'),  -- 800m

-- w11: 5000m kisavalmistautuminen
  (w11, 1, 20, 100, 'vapaa', 'pk'),  -- 2000m
  (w11, 2, 10, 100, 'vapaa', 'vk'),  -- 1000m
  (w11, 3, 8,  100, 'vapaa', 'mk'),  -- 800m
  (w11, 4, 4,  100, 'vapaa', 'mak'), -- 400m
  (w11, 5, 8,  100, 'vapaa', 'pk'),  -- 800m

-- w12: 4000m kevyt
  (w12, 1, 20, 100, 'vapaa', 'pk'),  -- 2000m
  (w12, 2, 10, 100, 'vapaa', 'pk'),  -- 1000m
  (w12, 3, 5,  100, 'vapaa', 'vk'),  -- 500m
  (w12, 4, 5,  100, 'vapaa', 'vk');  -- 500m

-- =============================================
-- 5. WORKOUT ATTENDANCE (uimari kirjattu jokaiseen)
-- =============================================
INSERT INTO workout_attendance (workout_id, swimmer_id, actual_pool_m) VALUES
  (w1,  v_swimmer_id, 5500),
  (w2,  v_swimmer_id, 6000),
  (w3,  v_swimmer_id, 5000),
  (w4,  v_swimmer_id, 5500),
  (w5,  v_swimmer_id, 6500),
  (w6,  v_swimmer_id, 5000),
  (w7,  v_swimmer_id, 5200),
  (w8,  v_swimmer_id, 5800),
  (w9,  v_swimmer_id, 7000),
  (w10, v_swimmer_id, 4500),
  (w11, v_swimmer_id, 5000),
  (w12, v_swimmer_id, 4000);

-- =============================================
-- 6. KILPAILUT JA TULOKSET
-- =============================================

-- Kilpailu 1: Helmikuu 2026
INSERT INTO competitions (id, club_id, name, competition_date, location)
VALUES (gen_random_uuid(), v_club_id, 'Talvikisat 2026', '2026-02-28', 'Helsinki')
RETURNING id INTO c1;

-- Kilpailu 2: Toukokuu 2026
INSERT INTO competitions (id, club_id, name, competition_date, location)
VALUES (gen_random_uuid(), v_club_id, 'Kevät GP 2026', '2026-05-17', 'Espoo')
RETURNING id INTO c2;

-- Tulokset kilpailu 1
INSERT INTO competition_results (competition_id, swimmer_id, stroke, distance, result_time_ms, place_overall, is_personal_best)
VALUES
  (c1, v_swimmer_id, 'vapaa', '100', 57800, 4, false),
  (c1, v_swimmer_id, 'vapaa', '200', 124500, 3, false);

-- Tulokset kilpailu 2 (paremmat ajat)
INSERT INTO competition_results (competition_id, swimmer_id, stroke, distance, result_time_ms, place_overall, is_personal_best)
VALUES
  (c2, v_swimmer_id, 'vapaa', '100', 56200, 2, true),
  (c2, v_swimmer_id, 'vapaa', '200', 122100, 2, true);

-- =============================================
-- 7. HENKILÖKOHTAISET ENNÄTYKSET
-- =============================================
INSERT INTO personal_records (swimmer_id, stroke, distance, best_time_ms, set_at, competition_id, is_baseline)
VALUES
  -- Lähtötaso (onboarding)
  (v_swimmer_id, 'vapaa', '100', 59200, '2026-01-01', NULL, true),
  (v_swimmer_id, 'vapaa', '200', 127000, '2026-01-01', NULL, true),
  -- Nykyinen PR (Kevät GP:stä)
  (v_swimmer_id, 'vapaa', '100', 56200, '2026-05-17', c2, false),
  (v_swimmer_id, 'vapaa', '200', 122100, '2026-05-17', c2, false)
ON CONFLICT DO NOTHING;

RAISE NOTICE 'Demo data lisätty onnistuneesti uimarille %', v_swimmer_id;

END $$;
