import type { IntensityZone } from "@/constants/zones";

export interface ZoneDistribution {
  pk: number;
  vk: number;
  mk: number;
  mak: number;
  total: number;
}

export function calcZoneDistribution(
  sets: Array<{ total_m: number; intensity_zone: IntensityZone }>
): ZoneDistribution {
  const dist = { pk: 0, vk: 0, mk: 0, mak: 0, total: 0 };
  for (const s of sets) {
    dist[s.intensity_zone] += s.total_m;
    dist.total += s.total_m;
  }
  return dist;
}

export function zonePct(dist: ZoneDistribution, zone: IntensityZone): number {
  if (dist.total === 0) return 0;
  return Math.round((dist[zone] / dist.total) * 1000) / 10;
}
