-- ============================================================
-- UINTISOVELLUS — PostgreSQL Schema
-- Multi-tenant SaaS | Supabase-yhteensopiva
-- ============================================================

-- Ota UUID-laajennus käyttöön
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector"; -- AI-embedding-hakuja varten

-- ============================================================
-- ENUMERAATIOT
-- ============================================================

-- Tehoalueet (suomalainen uintivalmennus)
CREATE TYPE intensity_zone AS ENUM (
  'pk',   -- Perus kestävyys   (T1) ~60–70% HRmax
  'vk',   -- Vauhtikestävyys   (T2) ~70–80% HRmax
  'mk',   -- Matkakestävyys    (T3) ~80–90% HRmax
  'mak'   -- Maksimikestävyys  (T4) >90% HRmax / anaerobinen
);

-- Uintilajit
CREATE TYPE swim_stroke AS ENUM (
  'vapaa',      -- Vapaauinti (crawl)
  'selka',      -- Selkäuinti
  'rinta',      -- Rintauinti
  'perho',      -- Perhonen
  'sekauinti'   -- IM (individual medley)
);

-- Kilpailumatkat metreinä
CREATE TYPE race_distance AS ENUM (
  '50', '100', '200', '400', '800', '1500'
);

-- Harjoitustyyppi
CREATE TYPE workout_type AS ENUM (
  'uinti',      -- Uima-altaassa
  'kuiva',      -- Kuivaharjoittelu
  'yhdistelma'  -- Molemmat samalla kerralla
);

-- Kuivaharjoittelun kategoria
CREATE TYPE dryland_category AS ENUM (
  'voima',
  'liikkuvuus',
  'koordinaatio',
  'kestävyys',
  'palautuminen'
);

-- Käyttäjärooli
CREATE TYPE user_role AS ENUM (
  'club_admin',
  'coach',
  'swimmer'
);

-- ============================================================
-- MULTI-TENANT RAKENNE
-- ============================================================

-- Seurat (tenant-juuri)
CREATE TABLE clubs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,        -- URL-tunniste esim. "hel-uinti"
  city          TEXT,
  country       TEXT DEFAULT 'FI',
  logo_url      TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Käyttäjät (Supabase Auth -yhteensopiva)
CREATE TABLE users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  club_id       UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  role          user_role NOT NULL,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Valmentajat
CREATE TABLE coaches (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  club_id       UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  bio           TEXT,
  specialties   TEXT[],                      -- esim. ['sprintti', 'rintauinti']
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Uimarit
CREATE TABLE swimmers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  club_id         UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  coach_id        UUID REFERENCES coaches(id) ON DELETE SET NULL,
  full_name       TEXT NOT NULL,
  birth_date      DATE NOT NULL,
  gender          TEXT CHECK (gender IN ('M', 'F', 'other')),
  -- Lähtötaso (syötetään rekisteröinnissä)
  onboarding_done BOOLEAN DEFAULT false,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Harjoitusryhmät
CREATE TABLE training_groups (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id     UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  coach_id    UUID REFERENCES coaches(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,                 -- esim. "Kilpa A", "Juniori B"
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Uimarin kuuluminen ryhmään
CREATE TABLE group_members (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id    UUID NOT NULL REFERENCES training_groups(id) ON DELETE CASCADE,
  swimmer_id  UUID NOT NULL REFERENCES swimmers(id) ON DELETE CASCADE,
  joined_at   DATE NOT NULL DEFAULT CURRENT_DATE,
  left_at     DATE,
  UNIQUE (group_id, swimmer_id)
);

-- ============================================================
-- VUOSITAVOITTEET
-- ============================================================

CREATE TABLE yearly_goals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  swimmer_id      UUID NOT NULL REFERENCES swimmers(id) ON DELETE CASCADE,
  season_year     INT NOT NULL,              -- esim. 2025
  -- Volyymitavoitteet
  target_pool_km  NUMERIC(6,1),             -- km uintia vuodessa
  target_dryland_hours NUMERIC(5,1),        -- kuivaharjoittelutunteja
  target_workouts INT,                      -- harjoituskerrat yhteensä
  -- Tehoaluejakauma-tavoite (summa = 100)
  target_pct_pk   NUMERIC(4,1),             -- % perus kestävyys
  target_pct_vk   NUMERIC(4,1),             -- % vauhtikestävyys
  target_pct_mk   NUMERIC(4,1),             -- % matkakestävyys
  target_pct_mak  NUMERIC(4,1),             -- % maksimikestävyys
  -- Kisatavoite
  target_stroke   swim_stroke,
  target_distance race_distance,
  target_time_ms  INT,                      -- tavoiteaika millisekunteina
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (swimmer_id, season_year)
);

-- ============================================================
-- HARJOITUKSET
-- ============================================================

-- Harjoituskerta (session)
CREATE TABLE workouts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id         UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  coach_id        UUID REFERENCES coaches(id) ON DELETE SET NULL,
  group_id        UUID REFERENCES training_groups(id) ON DELETE SET NULL,
  workout_date    DATE NOT NULL,
  workout_type    workout_type NOT NULL,
  title           TEXT,                      -- vapaaehtoinen otsikko
  notes           TEXT,
  -- Lasketut koosteet (päivitetään triggerillä)
  total_pool_m    INT DEFAULT 0,             -- kokonaismetrit
  total_dryland_min INT DEFAULT 0,           -- kuivaharjoitteluaika min
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Uimarin osallistuminen harjoitukseen
CREATE TABLE workout_attendance (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id      UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  swimmer_id      UUID NOT NULL REFERENCES swimmers(id) ON DELETE CASCADE,
  -- Yksilöllinen volyymi (voi poiketa ryhmästä)
  actual_pool_m   INT,                       -- todellinen uintimäärä (m)
  actual_dryland_min INT,
  felt_scale      INT CHECK (felt_scale BETWEEN 1 AND 10), -- RPE/fiilis
  notes           TEXT,
  recorded_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE (workout_id, swimmer_id)
);

-- ============================================================
-- UIMASETIT
-- ============================================================

-- Yksittäinen setti harjoituksessa
CREATE TABLE pool_sets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id      UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  set_order       INT NOT NULL,              -- järjestys harjoituksessa
  -- Settirakenne
  repetitions     INT NOT NULL DEFAULT 1,    -- toistot, esim. 8
  distance_m      INT NOT NULL,              -- matka/toisto metreinä, esim. 50
  total_m         INT GENERATED ALWAYS AS (repetitions * distance_m) STORED,
  stroke          swim_stroke,
  intensity_zone  intensity_zone NOT NULL,
  -- Aika (vapaaehtoinen)
  interval_sec    INT,                       -- lähtöväli sekunteina
  target_time_sec NUMERIC(6,2),             -- tavoiteaika/setti
  -- Kuvaus
  description     TEXT,                      -- esim. "Negatiivinen jako"
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- KUIVAHARJOITTELU
-- ============================================================

CREATE TABLE dryland_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id      UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  duration_min    INT NOT NULL,
  category        dryland_category NOT NULL,
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE dryland_exercises (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      UUID NOT NULL REFERENCES dryland_sessions(id) ON DELETE CASCADE,
  exercise_order  INT NOT NULL,
  name            TEXT NOT NULL,             -- esim. "Leuanveto"
  sets            INT,
  reps            INT,
  duration_sec    INT,
  weight_kg       NUMERIC(5,2),
  notes           TEXT
);

-- ============================================================
-- KILPAILUT JA TULOKSET
-- ============================================================

CREATE TABLE competitions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id         UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,             -- esim. "SM-kisat 2025"
  competition_date DATE NOT NULL,
  location        TEXT,
  level           TEXT,                      -- esim. "SM", "piiri", "seura", "kansainvälinen"
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE competition_results (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id  UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  swimmer_id      UUID NOT NULL REFERENCES swimmers(id) ON DELETE CASCADE,
  stroke          swim_stroke NOT NULL,
  distance        race_distance NOT NULL,
  result_time_ms  INT NOT NULL,              -- tulos millisekunteina
  -- Sijoitukset
  place_overall   INT,
  place_age_group INT,
  -- Vertailu tavoitteeseen
  goal_id         UUID REFERENCES yearly_goals(id) ON DELETE SET NULL,
  time_diff_ms    INT,
  is_personal_best BOOLEAN DEFAULT false,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (competition_id, swimmer_id, stroke, distance)
);

-- Henkilökohtaiset ennätykset (päivittyy automaattisesti)
CREATE TABLE personal_records (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  swimmer_id      UUID NOT NULL REFERENCES swimmers(id) ON DELETE CASCADE,
  stroke          swim_stroke NOT NULL,
  distance        race_distance NOT NULL,
  best_time_ms    INT NOT NULL,
  set_at          DATE NOT NULL,
  competition_id  UUID REFERENCES competitions(id) ON DELETE SET NULL,
  -- Lähtötaso-ennätys (onboarding-vaiheessa syötetty)
  is_baseline     BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (swimmer_id, stroke, distance)
);

-- ============================================================
-- KEHITYKSEN PEILAUS (PROGRESS SNAPSHOTS)
-- ============================================================

-- Viikoittainen/kuukausittainen koostekuva per uimari
CREATE TABLE progress_snapshots (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  swimmer_id          UUID NOT NULL REFERENCES swimmers(id) ON DELETE CASCADE,
  season_year         INT NOT NULL,
  snapshot_date       DATE NOT NULL,          -- yleensä viikon/kuun loppu
  -- Kumulatiiviset luvut kauden alusta
  cum_pool_m          INT DEFAULT 0,           -- kertyneet metrit
  cum_dryland_min     INT DEFAULT 0,
  cum_workouts        INT DEFAULT 0,
  -- Tehoaluejakauma tähän hetkeen (%)
  pct_pk              NUMERIC(4,1),
  pct_vk              NUMERIC(4,1),
  pct_mk              NUMERIC(4,1),
  pct_mak             NUMERIC(4,1),
  -- Tavoitteen toteutumisprosentti
  goal_pool_pct       NUMERIC(5,1),           -- % vuositavoitteesta
  goal_workout_pct    NUMERIC(5,1),
  -- Kisatulos viimeisimmästä relevanttisesta kisasta
  latest_race_ms      INT,
  latest_race_stroke  swim_stroke,
  latest_race_dist    race_distance,
  -- Vertailu lähtötasoon (ms)
  improvement_vs_baseline_ms INT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE (swimmer_id, snapshot_date)
);

-- ============================================================
-- AI COACH COPILOT
-- ============================================================

-- Valmentajan AI-kyselyt ja vastaukset (chat-historia)
CREATE TABLE ai_conversations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id        UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  club_id         UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  title           TEXT,                       -- automaattinen otsikko
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ai_messages (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id     UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role                TEXT CHECK (role IN ('user', 'assistant')),
  content             TEXT NOT NULL,
  -- Kontekstiviittaukset (mitkä data-pisteet käytettiin)
  context_swimmer_ids UUID[],
  context_date_from   DATE,
  context_date_to     DATE,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- Swimmer-embeddings RAG-hakua varten (pgvector)
CREATE TABLE swimmer_embeddings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  swimmer_id      UUID NOT NULL REFERENCES swimmers(id) ON DELETE CASCADE,
  content_type    TEXT NOT NULL,             -- 'workout_summary', 'competition_history', 'goal_progress'
  content_text    TEXT NOT NULL,             -- alkuperäinen teksti
  embedding       vector(1536),             -- OpenAI text-embedding-3-small
  valid_from      DATE,
  valid_to        DATE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX ON swimmer_embeddings USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — Supabase
-- ============================================================

ALTER TABLE clubs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches            ENABLE ROW LEVEL SECURITY;
ALTER TABLE swimmers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_groups    ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_sets          ENABLE ROW LEVEL SECURITY;
ALTER TABLE dryland_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records   ENABLE ROW LEVEL SECURITY;
ALTER TABLE yearly_goals       ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages        ENABLE ROW LEVEL SECURITY;

-- Esimerkki: käyttäjä näkee vain oman seuransa datan
CREATE POLICY "club_isolation" ON swimmers
  USING (club_id = (SELECT club_id FROM users WHERE id = auth.uid()));

CREATE POLICY "club_isolation" ON workouts
  USING (club_id = (SELECT club_id FROM users WHERE id = auth.uid()));

-- Uimari näkee vain omat tietonsa
CREATE POLICY "swimmer_own_data" ON workout_attendance
  USING (
    swimmer_id IN (
      SELECT id FROM swimmers WHERE user_id = auth.uid()
    )
    OR
    (SELECT role FROM users WHERE id = auth.uid()) IN ('coach', 'club_admin')
  );

-- ============================================================
-- INDEKSIT SUORITUSKYKYÄ VARTEN
-- ============================================================

CREATE INDEX idx_workouts_date         ON workouts(club_id, workout_date DESC);
CREATE INDEX idx_pool_sets_workout     ON pool_sets(workout_id, set_order);
CREATE INDEX idx_attendance_swimmer    ON workout_attendance(swimmer_id, recorded_at DESC);
CREATE INDEX idx_results_swimmer       ON competition_results(swimmer_id, stroke, distance);
CREATE INDEX idx_pr_swimmer            ON personal_records(swimmer_id, stroke, distance);
CREATE INDEX idx_snapshots_swimmer     ON progress_snapshots(swimmer_id, snapshot_date DESC);
CREATE INDEX idx_yearly_goals_swimmer  ON yearly_goals(swimmer_id, season_year);

-- ============================================================
-- HYÖDYLLISET NÄKYMÄT
-- ============================================================

-- Uimarin kauden koostenäkymä (valmentajan dashboard)
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
  -- Tavoitteen toteutumis-%
  ROUND(
    COALESCE(SUM(wa.actual_pool_m), 0)::numeric
    / NULLIF(yg.target_pool_km * 1000, 0) * 100, 1
  )                                           AS goal_pool_pct,
  -- Tehoaluejakauma
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
         yg.target_pool_km, yg.target_dryland_hours, yg.target_workouts;


-- Kehitys lähtötasosta (kisatulokset per uimari)
CREATE OR REPLACE VIEW swimmer_time_progression AS
SELECT
  cr.swimmer_id,
  cr.stroke,
  cr.distance,
  c.competition_date,
  c.name                    AS competition_name,
  cr.result_time_ms,
  pr_base.best_time_ms      AS baseline_ms,
  cr.result_time_ms - pr_base.best_time_ms AS delta_ms,
  ROUND(
    (pr_base.best_time_ms - cr.result_time_ms)::numeric
    / pr_base.best_time_ms * 100, 2
  )                         AS improvement_pct
FROM competition_results cr
JOIN competitions c          ON c.id = cr.competition_id
LEFT JOIN personal_records pr_base
  ON pr_base.swimmer_id = cr.swimmer_id
  AND pr_base.stroke    = cr.stroke
  AND pr_base.distance  = cr.distance
  AND pr_base.is_baseline = true
ORDER BY cr.swimmer_id, cr.stroke, cr.distance, c.competition_date;
