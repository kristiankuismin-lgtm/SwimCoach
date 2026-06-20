import type { SwimStroke } from "@/constants/strokes";
import type { IntensityZone } from "@/constants/zones";

export type DrylandCategory = "voima" | "liikkuvuus" | "koordinaatio" | "kestävyys" | "palautuminen";

export interface SetEntry {
  id: string;
  repetitions: number;
  distance_m: number;
  stroke: SwimStroke;
  intensity_zone: IntensityZone;
  description?: string;
}

export interface DrylandEntry {
  duration_min: number;
  category: DrylandCategory;
  description?: string;
}

export interface AttendeeEntry {
  swimmer_id: string;
  full_name: string;
  present: boolean;
  actual_pool_m?: number;  // poikkeava metrimäärä (esim. loukkaantunut)
}

export interface NewWorkoutState {
  date: string;
  group_id: string;
  sets: SetEntry[];
  dryland: DrylandEntry | null;
  attendees: AttendeeEntry[];
  notes: string;
}

export const DRYLAND_CATEGORIES: Record<DrylandCategory, string> = {
  voima:        "Voima",
  liikkuvuus:   "Liikkuvuus",
  koordinaatio: "Koordinaatio",
  kestävyys:    "Kestävyys",
  palautuminen: "Palautuminen",
};
