import type { PackingResult } from "@/types";

export const HERO_RECOMMENDED_BOX = {
  name: "Medium box",
  widthIn: 10,
  heightIn: 10,
  depthIn: 10,
  dimensionalWeightLbs: 8.8,
  shippingSavingsUsd: 4.22,
} as const;

export const HERO_PACKING_RESULT: PackingResult = {
  box: {
    id: "hero-medium-box",
    name: HERO_RECOMMENDED_BOX.name,
    width: 25.4,
    height: 25.4,
    depth: 25.4,
    maxWeight: null,
  },
  dimensionalWeight: 4,
  items: [
    { name: "Item 7_6", width: 15.24, height: 7.62, depth: 17.78, x: 0, y: 0, z: 0 },
    { name: "Item 2_1", width: 12.7, height: 12.7, depth: 12.7, x: 0, y: 7.62, z: 0 },
    { name: "Item 2_2", width: 12.7, height: 12.7, depth: 12.7, x: 12.7, y: 7.62, z: 0 },
    { name: "Item 6_8", width: 10.16, height: 15.24, depth: 10.16, x: 0, y: 7.62, z: 12.7 },
    { name: "Item 6_9", width: 10.16, height: 15.24, depth: 10.16, x: 10.16, y: 7.62, z: 12.7 },
    { name: "Item 3_7", width: 7.62, height: 7.62, depth: 17.78, x: 15.24, y: 0, z: 0 },
    { name: "Item 5_4", width: 10.16, height: 7.62, depth: 7.62, x: 0, y: 0, z: 17.78 },
    { name: "Item 5_5", width: 10.16, height: 7.62, depth: 7.62, x: 10.16, y: 0, z: 17.78 },
    { name: "Item 1_0", width: 5.08, height: 10.16, depth: 10.16, x: 20.32, y: 7.62, z: 12.7 },
    { name: "Item 4_3", width: 17.78, height: 5.08, depth: 5.08, x: 0, y: 20.32, z: 0 },
  ],
};
