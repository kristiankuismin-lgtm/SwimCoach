import { supabase } from "@/lib/supabase";

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
