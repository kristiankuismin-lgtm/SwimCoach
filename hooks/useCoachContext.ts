import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";

interface CoachContext {
  clubId: string | null;
  coachId: string | null;
  ready: boolean;
}

export function useCoachContext(): CoachContext {
  const { user } = useAuth();
  const [ctx, setCtx] = useState<CoachContext>({ clubId: null, coachId: null, ready: false });

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data: u } = await supabase
        .from("users").select("club_id").eq("id", user!.id).single();
      const { data: c } = await supabase
        .from("coaches").select("id").eq("user_id", user!.id).single();
      setCtx({ clubId: u?.club_id ?? null, coachId: c?.id ?? null, ready: true });
    }
    load();
  }, [user]);

  return ctx;
}
