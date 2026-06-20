import { useQuery } from "@tanstack/react-query";
import { authKeys, getCoachContext } from "@/lib/queries/auth";
import { useAuth } from "./useAuth";

interface CoachContext {
  clubId: string | null;
  coachId: string | null;
  ready: boolean;
}

/** Coach identity (club + coach ids) as server state, resolved once per user. */
export function useCoachContext(): CoachContext {
  const { user } = useAuth();
  const q = useQuery({
    queryKey: authKeys.coachContext(user?.id ?? ""),
    enabled: !!user,
    queryFn: () => getCoachContext(user!.id),
  });

  return {
    clubId: q.data?.clubId ?? null,
    coachId: q.data?.coachId ?? null,
    ready: !!user && q.isSuccess,
  };
}
