export type SwimStroke = "vapaa" | "selka" | "rinta" | "perho" | "sekauinti";

export const STROKES: Record<SwimStroke, { label: string; short: string }> = {
  vapaa:      { label: "Vapaauinti", short: "V" },
  selka:      { label: "Selkäuinti", short: "S" },
  rinta:      { label: "Rintauinti", short: "R" },
  perho:      { label: "Perhonen",   short: "P" },
  sekauinti:  { label: "Sekauinti",  short: "IM" },
};

// Distances are stored as TEXT in the DB (the `race_distance` enum), so the
// domain type is the string union — keep these in sync with that column.
export const RACE_DISTANCES = ["50", "100", "200", "400", "800", "1500"] as const;
export type RaceDistance = typeof RACE_DISTANCES[number];
