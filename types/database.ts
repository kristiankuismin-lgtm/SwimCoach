// Tämä tiedosto generoidaan automaattisesti komennolla:
// npm run db:types
//
// Aseta ensin SUPABASE_PROJECT_ID .env-tiedostoon ja aja:
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      // Generoidaan automaattisesti
    };
    Views: {
      swimmer_season_summary: { Row: Record<string, unknown> };
      swimmer_time_progression: { Row: Record<string, unknown> };
    };
    Enums: {
      intensity_zone: "pk" | "vk" | "mk" | "mak";
      swim_stroke: "vapaa" | "selka" | "rinta" | "perho" | "sekauinti";
      workout_type: "uinti" | "kuiva" | "yhdistelma";
      user_role: "club_admin" | "coach" | "swimmer";
    };
  };
}
