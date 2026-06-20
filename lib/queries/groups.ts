import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const groupKeys = {
  all: ["groups"] as const,
  byClub: (clubId: string) => [...groupKeys.all, clubId] as const,
};

export function useClubGroups(clubId: string | undefined) {
  return useQuery({
    queryKey: groupKeys.byClub(clubId ?? ""),
    enabled: !!clubId,
    queryFn: async () => {
      const { data, error } = await getClubGroups(clubId!);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export async function getClubGroups(clubId: string) {
  return supabase
    .from("training_groups")
    .select("id, name")
    .eq("club_id", clubId)
    .order("name");
}

export async function getGroupMembers(groupId: string) {
  return supabase
    .from("group_members")
    .select("swimmer_id, swimmers(id, full_name)")
    .eq("group_id", groupId)
    .is("left_at", null);
}
