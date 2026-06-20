import { supabase } from "@/lib/supabase";

/** Query-key factory for identity/context lookups. */
export const authKeys = {
  all: ["auth"] as const,
  coachContext: (userId: string) => [...authKeys.all, "coach-context", userId] as const,
  swimmerContext: (userId: string) => [...authKeys.all, "swimmer-context", userId] as const,
};

/** Resolve a coach's club + coach ids from their auth user id. */
export async function getCoachContext(userId: string) {
  const [{ data: u }, { data: c }] = await Promise.all([
    supabase.from("users").select("club_id").eq("id", userId).single(),
    supabase.from("coaches").select("id").eq("user_id", userId).single(),
  ]);
  return { clubId: u?.club_id ?? null, coachId: c?.id ?? null };
}

export function signOut() {
  return supabase.auth.signOut();
}
