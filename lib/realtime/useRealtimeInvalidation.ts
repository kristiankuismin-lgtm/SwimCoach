import { useEffect } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/**
 * Keep a TanStack query live off Postgres changes. Opens a realtime channel on
 * `table` and invalidates `queryKey` whenever a row changes — so screens never
 * own a channel or hand-sync the cache; they just call the query hook, which
 * calls this.
 *
 * Pass `queryKey: null` to stay disabled (e.g. before the club id is known) so
 * the call site keeps a stable hook order.
 */
export function useRealtimeInvalidation(table: string, queryKey: QueryKey | null): void {
  const queryClient = useQueryClient();
  // Serialise the key so the effect re-subscribes only when its value changes —
  // a fresh array reference every render would otherwise thrash the channel.
  const keyString = queryKey ? JSON.stringify(queryKey) : null;

  useEffect(() => {
    if (!keyString) return;
    const key = JSON.parse(keyString) as QueryKey;
    const channel = supabase
      .channel(`rt:${table}:${keyString}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () =>
        queryClient.invalidateQueries({ queryKey: key }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, keyString, queryClient]);
}
