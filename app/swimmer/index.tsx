import { useSwimmerContext } from "@/hooks/useSwimmerContext";
import { useSwimmerProfile, useRecentWorkouts } from "@/lib/queries/swimmers";
import { SwimmerHome } from "@/features/swimmer/SwimmerHome";
import { Screen } from "@/components/ui/Screen";
import { PaceClock } from "@/components/ui/PaceClock";

export default function SwimmerDashboard() {
  const { swimmerId, ready } = useSwimmerContext();
  const year = new Date().getFullYear();

  const profileQ = useSwimmerProfile(swimmerId ?? undefined);
  const workoutsQ = useRecentWorkouts(swimmerId ?? undefined, 20);

  function refresh() {
    profileQ.refetch();
    workoutsQ.refetch();
  }

  if (!ready || profileQ.isLoading || !profileQ.data) {
    return (
      <Screen center>
        <PaceClock size={48} />
      </Screen>
    );
  }

  return (
    <SwimmerHome
      profile={profileQ.data}
      recentWorkouts={workoutsQ.data ?? []}
      year={year}
      refreshing={profileQ.isRefetching || workoutsQ.isRefetching}
      onRefresh={refresh}
    />
  );
}
