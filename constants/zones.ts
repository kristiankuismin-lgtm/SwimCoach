export type IntensityZone = "pk" | "vk" | "mk" | "mak";

export const ZONES: Record<IntensityZone, { label: string; color: string; description: string }> = {
  pk: {
    label: "PK",
    color: "#3B82F6",
    description: "Perus kestävyys",
  },
  vk: {
    label: "VK",
    color: "#22C55E",
    description: "Vauhtikestävyys",
  },
  mk: {
    label: "MK",
    color: "#EAB308",
    description: "Matkakestävyys",
  },
  mak: {
    label: "MAK",
    color: "#EF4444",
    description: "Maksimikestävyys",
  },
};

export const ZONE_ORDER: IntensityZone[] = ["pk", "vk", "mk", "mak"];
