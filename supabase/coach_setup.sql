-- =============================================
-- 1. Muuta kristian valmentajaksi + luo coaches-rivi
-- =============================================
DO $$
DECLARE
  v_user_id UUID;
  v_club_id UUID;
  v_coach_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'kristian.kuismin@gmail.com';
  SELECT club_id INTO v_club_id FROM users WHERE id = v_user_id;

  -- Vaihda rooli coachiksi
  UPDATE users SET role = 'coach' WHERE id = v_user_id;

  -- Lisää coaches-rivi jos ei ole
  INSERT INTO coaches (user_id, club_id, bio)
  VALUES (v_user_id, v_club_id, 'Päävalmentaja')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_coach_id;

  RAISE NOTICE 'Coach setup valmis käyttäjälle %', v_user_id;
END $$;

-- =============================================
-- 2. RLS-policyt valmentajalle
-- =============================================

-- workouts: coach voi lukea ja kirjoittaa oman seuran harjoitukset
CREATE POLICY "coach_read_workouts" ON workouts
  FOR SELECT USING (
    club_id IN (SELECT club_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "coach_insert_workouts" ON workouts
  FOR INSERT WITH CHECK (
    club_id IN (SELECT club_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "coach_update_workouts" ON workouts
  FOR UPDATE USING (
    club_id IN (SELECT club_id FROM users WHERE id = auth.uid())
  );

-- pool_sets: kuka tahansa voi lukea (jo olemassa), coach voi kirjoittaa
CREATE POLICY "coach_insert_pool_sets" ON pool_sets
  FOR INSERT WITH CHECK (
    workout_id IN (
      SELECT id FROM workouts WHERE club_id IN (
        SELECT club_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- workout_attendance: coach voi kirjoittaa oman seuran harjoituksiin
CREATE POLICY "coach_insert_attendance" ON workout_attendance
  FOR INSERT WITH CHECK (
    workout_id IN (
      SELECT id FROM workouts WHERE club_id IN (
        SELECT club_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "coach_read_attendance" ON workout_attendance
  FOR SELECT USING (
    workout_id IN (
      SELECT id FROM workouts WHERE club_id IN (
        SELECT club_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- dryland_sessions
CREATE POLICY "coach_insert_dryland" ON dryland_sessions
  FOR INSERT WITH CHECK (
    workout_id IN (
      SELECT id FROM workouts WHERE club_id IN (
        SELECT club_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- swimmers: coach voi lukea oman seuran uimarit
CREATE POLICY "coach_read_swimmers" ON swimmers
  FOR SELECT USING (
    club_id IN (SELECT club_id FROM users WHERE id = auth.uid())
  );

-- training_groups: coach voi lukea
CREATE POLICY "coach_read_groups" ON training_groups
  FOR SELECT USING (
    club_id IN (SELECT club_id FROM users WHERE id = auth.uid())
  );

-- group_members: coach voi lukea
CREATE POLICY "coach_read_group_members" ON group_members
  FOR SELECT USING (
    group_id IN (
      SELECT id FROM training_groups WHERE club_id IN (
        SELECT club_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- coaches: coach voi lukea itsensä
CREATE POLICY "coach_read_own" ON coaches
  FOR SELECT USING (user_id = auth.uid());
