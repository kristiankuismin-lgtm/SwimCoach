import type { SwimStroke, RaceDistance } from "@/constants/strokes";

export interface BaselineResult {
  id: string;
  stroke: SwimStroke;
  distance: RaceDistance;
  timeString: string; // mm:ss.hh
}

export interface OnboardingData {
  // Vaihe 2: Lähtötaso
  baselines: BaselineResult[];
  // Vaihe 3: Volyymitavoitteet
  targetPoolKm: string;
  targetDrylandHours: string;
  targetWorkouts: string;
  // Vaihe 4: Tehoaluejakauma
  targetPctPk: number;
  targetPctVk: number;
  targetPctMk: number;
  targetPctMak: number;
  // Vaihe 5: Kisatavoite
  goalStroke: SwimStroke;
  goalDistance: RaceDistance;
  goalTimeString: string;
}

export const defaultOnboardingData: OnboardingData = {
  baselines: [],
  targetPoolKm: "",
  targetDrylandHours: "",
  targetWorkouts: "",
  targetPctPk: 50,
  targetPctVk: 25,
  targetPctMk: 15,
  targetPctMak: 10,
  goalStroke: "vapaa",
  goalDistance: 100,
  goalTimeString: "",
};
