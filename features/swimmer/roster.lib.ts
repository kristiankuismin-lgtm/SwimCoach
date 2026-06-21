/**
 * Roster name search for the coach's Koti list. Pure data → view-model; no
 * react / react-native imports.
 */
import { type SwimmerSummary } from "./swimmer-card.lib";

/** Case-insensitive name search over a roster. Empty query → unchanged. */
export function filterRoster(swimmers: SwimmerSummary[], query: string): SwimmerSummary[] {
  const q = query.trim().toLowerCase();
  if (!q) return swimmers;
  return swimmers.filter((s) => s.full_name.toLowerCase().includes(q));
}
