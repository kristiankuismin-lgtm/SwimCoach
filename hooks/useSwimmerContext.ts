import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";

interface SwimmerContext {
  swimmerId: string | null;
  clubId: string | null;
  ready: boolean;
}

export function useSwimmerContext(): SwimmerContext {
  const { user } = useAuth();
  const [ctx, setCtx] = useState<SwimmerContext>({ swimmerId: null, clubId: null, ready: false });

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data: u } = await supabase
        .from("users").select("club_id").eq("id", user!.id).single();
      const { data: s } = await supabase
        .from("swimmers").select("id").eq("user_id", user!.id).single();
      setCtx({ swimmerId: s?.id ?? null, clubId: u?.club_id ?? null, ready: true });
    }
    load();
  }, [user]);

  return ctx;
}
