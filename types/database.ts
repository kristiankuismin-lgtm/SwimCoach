export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          club_id: string
          coach_id: string
          created_at: string | null
          id: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          club_id: string
          coach_id: string
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          club_id?: string
          coach_id?: string
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversations_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          content: string
          context_date_from: string | null
          context_date_to: string | null
          context_swimmer_ids: string[] | null
          conversation_id: string
          created_at: string | null
          id: string
          role: string | null
        }
        Insert: {
          content: string
          context_date_from?: string | null
          context_date_to?: string | null
          context_swimmer_ids?: string[] | null
          conversation_id: string
          created_at?: string | null
          id?: string
          role?: string | null
        }
        Update: {
          content?: string
          context_date_from?: string | null
          context_date_to?: string | null
          context_swimmer_ids?: string[] | null
          conversation_id?: string
          created_at?: string | null
          id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      coaches: {
        Row: {
          bio: string | null
          club_id: string
          created_at: string | null
          id: string
          specialties: string[] | null
          user_id: string
        }
        Insert: {
          bio?: string | null
          club_id: string
          created_at?: string | null
          id?: string
          specialties?: string[] | null
          user_id: string
        }
        Update: {
          bio?: string | null
          club_id?: string
          created_at?: string | null
          id?: string
          specialties?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaches_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_results: {
        Row: {
          competition_id: string
          created_at: string | null
          distance: Database["public"]["Enums"]["race_distance"]
          goal_id: string | null
          id: string
          is_personal_best: boolean | null
          notes: string | null
          place_age_group: number | null
          place_overall: number | null
          result_time_ms: number
          stroke: Database["public"]["Enums"]["swim_stroke"]
          swimmer_id: string
          time_diff_ms: number | null
        }
        Insert: {
          competition_id: string
          created_at?: string | null
          distance: Database["public"]["Enums"]["race_distance"]
          goal_id?: string | null
          id?: string
          is_personal_best?: boolean | null
          notes?: string | null
          place_age_group?: number | null
          place_overall?: number | null
          result_time_ms: number
          stroke: Database["public"]["Enums"]["swim_stroke"]
          swimmer_id: string
          time_diff_ms?: number | null
        }
        Update: {
          competition_id?: string
          created_at?: string | null
          distance?: Database["public"]["Enums"]["race_distance"]
          goal_id?: string | null
          id?: string
          is_personal_best?: boolean | null
          notes?: string | null
          place_age_group?: number | null
          place_overall?: number | null
          result_time_ms?: number
          stroke?: Database["public"]["Enums"]["swim_stroke"]
          swimmer_id?: string
          time_diff_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_results_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_results_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "yearly_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_results_swimmer_id_fkey"
            columns: ["swimmer_id"]
            isOneToOne: false
            referencedRelation: "swimmer_season_summary"
            referencedColumns: ["swimmer_id"]
          },
          {
            foreignKeyName: "competition_results_swimmer_id_fkey"
            columns: ["swimmer_id"]
            isOneToOne: false
            referencedRelation: "swimmers"
            referencedColumns: ["id"]
          },
        ]
      }
      competitions: {
        Row: {
          club_id: string
          competition_date: string
          created_at: string | null
          id: string
          level: string | null
          location: string | null
          name: string
          notes: string | null
        }
        Insert: {
          club_id: string
          competition_date: string
          created_at?: string | null
          id?: string
          level?: string | null
          location?: string | null
          name: string
          notes?: string | null
        }
        Update: {
          club_id?: string
          competition_date?: string
          created_at?: string | null
          id?: string
          level?: string | null
          location?: string | null
          name?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competitions_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      dryland_exercises: {
        Row: {
          duration_sec: number | null
          exercise_order: number
          id: string
          name: string
          notes: string | null
          reps: number | null
          session_id: string
          sets: number | null
          weight_kg: number | null
        }
        Insert: {
          duration_sec?: number | null
          exercise_order: number
          id?: string
          name: string
          notes?: string | null
          reps?: number | null
          session_id: string
          sets?: number | null
          weight_kg?: number | null
        }
        Update: {
          duration_sec?: number | null
          exercise_order?: number
          id?: string
          name?: string
          notes?: string | null
          reps?: number | null
          session_id?: string
          sets?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dryland_exercises_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "dryland_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      dryland_sessions: {
        Row: {
          category: Database["public"]["Enums"]["dryland_category"]
          created_at: string | null
          description: string | null
          duration_min: number
          id: string
          workout_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["dryland_category"]
          created_at?: string | null
          description?: string | null
          duration_min: number
          id?: string
          workout_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["dryland_category"]
          created_at?: string | null
          description?: string | null
          duration_min?: number
          id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dryland_sessions_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          left_at: string | null
          swimmer_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          left_at?: string | null
          swimmer_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          left_at?: string | null
          swimmer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "training_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_swimmer_id_fkey"
            columns: ["swimmer_id"]
            isOneToOne: false
            referencedRelation: "swimmer_season_summary"
            referencedColumns: ["swimmer_id"]
          },
          {
            foreignKeyName: "group_members_swimmer_id_fkey"
            columns: ["swimmer_id"]
            isOneToOne: false
            referencedRelation: "swimmers"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_records: {
        Row: {
          best_time_ms: number
          competition_id: string | null
          created_at: string | null
          distance: Database["public"]["Enums"]["race_distance"]
          id: string
          is_baseline: boolean | null
          set_at: string
          stroke: Database["public"]["Enums"]["swim_stroke"]
          swimmer_id: string
          updated_at: string | null
        }
        Insert: {
          best_time_ms: number
          competition_id?: string | null
          created_at?: string | null
          distance: Database["public"]["Enums"]["race_distance"]
          id?: string
          is_baseline?: boolean | null
          set_at: string
          stroke: Database["public"]["Enums"]["swim_stroke"]
          swimmer_id: string
          updated_at?: string | null
        }
        Update: {
          best_time_ms?: number
          competition_id?: string | null
          created_at?: string | null
          distance?: Database["public"]["Enums"]["race_distance"]
          id?: string
          is_baseline?: boolean | null
          set_at?: string
          stroke?: Database["public"]["Enums"]["swim_stroke"]
          swimmer_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_records_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_records_swimmer_id_fkey"
            columns: ["swimmer_id"]
            isOneToOne: false
            referencedRelation: "swimmer_season_summary"
            referencedColumns: ["swimmer_id"]
          },
          {
            foreignKeyName: "personal_records_swimmer_id_fkey"
            columns: ["swimmer_id"]
            isOneToOne: false
            referencedRelation: "swimmers"
            referencedColumns: ["id"]
          },
        ]
      }
      pool_sets: {
        Row: {
          created_at: string | null
          description: string | null
          distance_m: number
          id: string
          intensity_zone: Database["public"]["Enums"]["intensity_zone"]
          interval_sec: number | null
          repetitions: number
          set_order: number
          stroke: Database["public"]["Enums"]["swim_stroke"] | null
          target_time_sec: number | null
          total_m: number | null
          workout_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          distance_m: number
          id?: string
          intensity_zone: Database["public"]["Enums"]["intensity_zone"]
          interval_sec?: number | null
          repetitions?: number
          set_order: number
          stroke?: Database["public"]["Enums"]["swim_stroke"] | null
          target_time_sec?: number | null
          total_m?: number | null
          workout_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          distance_m?: number
          id?: string
          intensity_zone?: Database["public"]["Enums"]["intensity_zone"]
          interval_sec?: number | null
          repetitions?: number
          set_order?: number
          stroke?: Database["public"]["Enums"]["swim_stroke"] | null
          target_time_sec?: number | null
          total_m?: number | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pool_sets_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_snapshots: {
        Row: {
          created_at: string | null
          cum_dryland_min: number | null
          cum_pool_m: number | null
          cum_workouts: number | null
          goal_pool_pct: number | null
          goal_workout_pct: number | null
          id: string
          improvement_vs_baseline_ms: number | null
          latest_race_dist: Database["public"]["Enums"]["race_distance"] | null
          latest_race_ms: number | null
          latest_race_stroke: Database["public"]["Enums"]["swim_stroke"] | null
          pct_mak: number | null
          pct_mk: number | null
          pct_pk: number | null
          pct_vk: number | null
          season_year: number
          snapshot_date: string
          swimmer_id: string
        }
        Insert: {
          created_at?: string | null
          cum_dryland_min?: number | null
          cum_pool_m?: number | null
          cum_workouts?: number | null
          goal_pool_pct?: number | null
          goal_workout_pct?: number | null
          id?: string
          improvement_vs_baseline_ms?: number | null
          latest_race_dist?: Database["public"]["Enums"]["race_distance"] | null
          latest_race_ms?: number | null
          latest_race_stroke?: Database["public"]["Enums"]["swim_stroke"] | null
          pct_mak?: number | null
          pct_mk?: number | null
          pct_pk?: number | null
          pct_vk?: number | null
          season_year: number
          snapshot_date: string
          swimmer_id: string
        }
        Update: {
          created_at?: string | null
          cum_dryland_min?: number | null
          cum_pool_m?: number | null
          cum_workouts?: number | null
          goal_pool_pct?: number | null
          goal_workout_pct?: number | null
          id?: string
          improvement_vs_baseline_ms?: number | null
          latest_race_dist?: Database["public"]["Enums"]["race_distance"] | null
          latest_race_ms?: number | null
          latest_race_stroke?: Database["public"]["Enums"]["swim_stroke"] | null
          pct_mak?: number | null
          pct_mk?: number | null
          pct_pk?: number | null
          pct_vk?: number | null
          season_year?: number
          snapshot_date?: string
          swimmer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_snapshots_swimmer_id_fkey"
            columns: ["swimmer_id"]
            isOneToOne: false
            referencedRelation: "swimmer_season_summary"
            referencedColumns: ["swimmer_id"]
          },
          {
            foreignKeyName: "progress_snapshots_swimmer_id_fkey"
            columns: ["swimmer_id"]
            isOneToOne: false
            referencedRelation: "swimmers"
            referencedColumns: ["id"]
          },
        ]
      }
      swimmer_embeddings: {
        Row: {
          content_text: string
          content_type: string
          created_at: string | null
          embedding: string | null
          id: string
          swimmer_id: string
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          content_text: string
          content_type: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          swimmer_id: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          content_text?: string
          content_type?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          swimmer_id?: string
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swimmer_embeddings_swimmer_id_fkey"
            columns: ["swimmer_id"]
            isOneToOne: false
            referencedRelation: "swimmer_season_summary"
            referencedColumns: ["swimmer_id"]
          },
          {
            foreignKeyName: "swimmer_embeddings_swimmer_id_fkey"
            columns: ["swimmer_id"]
            isOneToOne: false
            referencedRelation: "swimmers"
            referencedColumns: ["id"]
          },
        ]
      }
      swimmers: {
        Row: {
          birth_date: string
          club_id: string
          coach_id: string | null
          created_at: string | null
          full_name: string
          gender: string | null
          id: string
          notes: string | null
          onboarding_done: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          birth_date: string
          club_id: string
          coach_id?: string | null
          created_at?: string | null
          full_name: string
          gender?: string | null
          id?: string
          notes?: string | null
          onboarding_done?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          birth_date?: string
          club_id?: string
          coach_id?: string | null
          created_at?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          notes?: string | null
          onboarding_done?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swimmers_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swimmers_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swimmers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      training_groups: {
        Row: {
          club_id: string
          coach_id: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          club_id: string
          coach_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          club_id?: string
          coach_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_groups_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_groups_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          club_id: string
          created_at: string | null
          email: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          club_id: string
          created_at?: string | null
          email: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          club_id?: string
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_attendance: {
        Row: {
          actual_dryland_min: number | null
          actual_pool_m: number | null
          felt_scale: number | null
          id: string
          notes: string | null
          recorded_at: string | null
          swimmer_id: string
          workout_id: string
        }
        Insert: {
          actual_dryland_min?: number | null
          actual_pool_m?: number | null
          felt_scale?: number | null
          id?: string
          notes?: string | null
          recorded_at?: string | null
          swimmer_id: string
          workout_id: string
        }
        Update: {
          actual_dryland_min?: number | null
          actual_pool_m?: number | null
          felt_scale?: number | null
          id?: string
          notes?: string | null
          recorded_at?: string | null
          swimmer_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_attendance_swimmer_id_fkey"
            columns: ["swimmer_id"]
            isOneToOne: false
            referencedRelation: "swimmer_season_summary"
            referencedColumns: ["swimmer_id"]
          },
          {
            foreignKeyName: "workout_attendance_swimmer_id_fkey"
            columns: ["swimmer_id"]
            isOneToOne: false
            referencedRelation: "swimmers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_attendance_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          club_id: string
          coach_id: string | null
          created_at: string | null
          group_id: string | null
          id: string
          notes: string | null
          title: string | null
          total_dryland_min: number | null
          total_pool_m: number | null
          updated_at: string | null
          workout_date: string
          workout_type: Database["public"]["Enums"]["workout_type"]
        }
        Insert: {
          club_id: string
          coach_id?: string | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          notes?: string | null
          title?: string | null
          total_dryland_min?: number | null
          total_pool_m?: number | null
          updated_at?: string | null
          workout_date: string
          workout_type: Database["public"]["Enums"]["workout_type"]
        }
        Update: {
          club_id?: string
          coach_id?: string | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          notes?: string | null
          title?: string | null
          total_dryland_min?: number | null
          total_pool_m?: number | null
          updated_at?: string | null
          workout_date?: string
          workout_type?: Database["public"]["Enums"]["workout_type"]
        }
        Relationships: [
          {
            foreignKeyName: "workouts_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workouts_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workouts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "training_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      yearly_goals: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          season_year: number
          swimmer_id: string
          target_distance: Database["public"]["Enums"]["race_distance"] | null
          target_dryland_hours: number | null
          target_pct_mak: number | null
          target_pct_mk: number | null
          target_pct_pk: number | null
          target_pct_vk: number | null
          target_pool_km: number | null
          target_stroke: Database["public"]["Enums"]["swim_stroke"] | null
          target_time_ms: number | null
          target_workouts: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          season_year: number
          swimmer_id: string
          target_distance?: Database["public"]["Enums"]["race_distance"] | null
          target_dryland_hours?: number | null
          target_pct_mak?: number | null
          target_pct_mk?: number | null
          target_pct_pk?: number | null
          target_pct_vk?: number | null
          target_pool_km?: number | null
          target_stroke?: Database["public"]["Enums"]["swim_stroke"] | null
          target_time_ms?: number | null
          target_workouts?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          season_year?: number
          swimmer_id?: string
          target_distance?: Database["public"]["Enums"]["race_distance"] | null
          target_dryland_hours?: number | null
          target_pct_mak?: number | null
          target_pct_mk?: number | null
          target_pct_pk?: number | null
          target_pct_vk?: number | null
          target_pool_km?: number | null
          target_stroke?: Database["public"]["Enums"]["swim_stroke"] | null
          target_time_ms?: number | null
          target_workouts?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "yearly_goals_swimmer_id_fkey"
            columns: ["swimmer_id"]
            isOneToOne: false
            referencedRelation: "swimmer_season_summary"
            referencedColumns: ["swimmer_id"]
          },
          {
            foreignKeyName: "yearly_goals_swimmer_id_fkey"
            columns: ["swimmer_id"]
            isOneToOne: false
            referencedRelation: "swimmers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      swimmer_season_summary: {
        Row: {
          club_id: string | null
          full_name: string | null
          goal_pool_pct: number | null
          pct_mak: number | null
          pct_mk: number | null
          pct_pk: number | null
          pct_vk: number | null
          season_year: number | null
          swimmer_id: string | null
          target_dryland_min: number | null
          target_pct_mak: number | null
          target_pct_mk: number | null
          target_pct_pk: number | null
          target_pct_vk: number | null
          target_pool_m: number | null
          target_workouts: number | null
          total_dryland_min: number | null
          total_pool_m: number | null
          total_workouts: number | null
        }
        Relationships: [
          {
            foreignKeyName: "swimmers_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      swimmer_time_progression: {
        Row: {
          baseline_ms: number | null
          competition_date: string | null
          competition_name: string | null
          delta_ms: number | null
          distance: Database["public"]["Enums"]["race_distance"] | null
          improvement_pct: number | null
          result_time_ms: number | null
          stroke: Database["public"]["Enums"]["swim_stroke"] | null
          swimmer_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_results_swimmer_id_fkey"
            columns: ["swimmer_id"]
            isOneToOne: false
            referencedRelation: "swimmer_season_summary"
            referencedColumns: ["swimmer_id"]
          },
          {
            foreignKeyName: "competition_results_swimmer_id_fkey"
            columns: ["swimmer_id"]
            isOneToOne: false
            referencedRelation: "swimmers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      current_club_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      dryland_category:
        | "voima"
        | "liikkuvuus"
        | "koordinaatio"
        | "kestävyys"
        | "palautuminen"
      intensity_zone: "pk" | "vk" | "mk" | "mak"
      race_distance: "50" | "100" | "200" | "400" | "800" | "1500"
      swim_stroke: "vapaa" | "selka" | "rinta" | "perho" | "sekauinti"
      user_role: "club_admin" | "coach" | "swimmer"
      workout_type: "uinti" | "kuiva" | "yhdistelma"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      dryland_category: [
        "voima",
        "liikkuvuus",
        "koordinaatio",
        "kestävyys",
        "palautuminen",
      ],
      intensity_zone: ["pk", "vk", "mk", "mak"],
      race_distance: ["50", "100", "200", "400", "800", "1500"],
      swim_stroke: ["vapaa", "selka", "rinta", "perho", "sekauinti"],
      user_role: ["club_admin", "coach", "swimmer"],
      workout_type: ["uinti", "kuiva", "yhdistelma"],
    },
  },
} as const

