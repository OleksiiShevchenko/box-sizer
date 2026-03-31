import type { IBox, IProduct } from "../../src/types";

export interface SeedBox extends IBox {
  spacing: number;
  maxWeight: number | null;
}

export interface ExpectedPackingOutcome {
  boxNames?: string[];
  errorMessage?: string;
  floorItemNames?: string[];
  preservedHeights?: Record<string, number>;
  minWallGap?: number;
}

export interface PackingCase {
  id: string;
  description: string;
  items: IProduct[];
  expected: ExpectedPackingOutcome;
}

export interface SpacingOverrideCase extends PackingCase {
  spacingOverride: number | null;
}

export const PACKWELL_E2E_EMAIL =
  process.env.E2E_EMAIL ?? "packwell-e2e@example.com";
export const PACKWELL_E2E_PASSWORD =
  process.env.E2E_PASSWORD ?? "Packwell123!";

export const QA_BOXES: SeedBox[] = [
  {
    id: "qa-01",
    name: "QA-01 Flat 16x6x16",
    width: 16,
    height: 6,
    depth: 16,
    spacing: 0,
    maxWeight: 1000,
  },
  {
    id: "qa-02",
    name: "QA-02 Cube 16x16x16",
    width: 16,
    height: 16,
    depth: 16,
    spacing: 0,
    maxWeight: 1000,
  },
  {
    id: "qa-03",
    name: "QA-03 Tall 10x24x10",
    width: 10,
    height: 24,
    depth: 10,
    spacing: 0,
    maxWeight: 1000,
  },
  {
    id: "qa-04",
    name: "QA-04 Mailer 24x12x18",
    width: 24,
    height: 12,
    depth: 18,
    spacing: 0,
    maxWeight: 2000,
  },
  {
    id: "qa-05",
    name: "QA-05 Spaced 24x15x10",
    width: 24,
    height: 15,
    depth: 10,
    spacing: 2,
    maxWeight: 1500,
  },
  {
    id: "qa-06",
    name: "QA-06 Limited 22x22x22",
    width: 22,
    height: 22,
    depth: 22,
    spacing: 0,
    maxWeight: 800,
  },
  {
    id: "qa-07",
    name: "QA-07 Cube 24x24x24",
    width: 24,
    height: 24,
    depth: 24,
    spacing: 0,
    maxWeight: 3000,
  },
  {
    id: "qa-08",
    name: "QA-08 Wide 32x16x32",
    width: 32,
    height: 16,
    depth: 32,
    spacing: 0,
    maxWeight: 5000,
  },
  {
    id: "qa-09",
    name: "QA-09 Cube 32x32x32",
    width: 32,
    height: 32,
    depth: 32,
    spacing: 0,
    maxWeight: 12000,
  },
];

export function getQaBox(name: string): SeedBox {
  const box = QA_BOXES.find((candidate) => candidate.name === name);

  if (!box) {
    throw new Error(`Unknown QA box: ${name}`);
  }

  return box;
}

type ProductOverride = Partial<IProduct>;

function buildProduct(
  name: string,
  width: number,
  height: number,
  depth: number,
  weight: number,
  overrides: ProductOverride = {}
): IProduct {
  return {
    name,
    width,
    height,
    depth,
    weight,
    quantity: 1,
    orientation: "any",
    canStackOnTop: true,
    canBePlacedOnTop: true,
    ...overrides,
  };
}

export const PACKWELL_ITEMS = {
  cube10: (overrides: ProductOverride = {}) =>
    buildProduct("Cube10", 10, 10, 10, 200, overrides),
  rotPanel: (overrides: ProductOverride = {}) =>
    buildProduct("RotPanel", 6, 14, 14, 200, overrides),
  tall8x18: (overrides: ProductOverride = {}) =>
    buildProduct("Tall8x18", 8, 18, 8, 200, overrides),
  base12: (overrides: ProductOverride = {}) =>
    buildProduct("Base12", 12, 10, 12, 200, overrides),
  top10: (overrides: ProductOverride = {}) =>
    buildProduct("Top10", 10, 5, 10, 150, overrides),
  floor10: (overrides: ProductOverride = {}) =>
    buildProduct("Floor10", 10, 10, 10, 200, {
      canBePlacedOnTop: false,
      ...overrides,
    }),
  large14x18: (overrides: ProductOverride = {}) =>
    buildProduct("Large14x18", 14, 18, 14, 400, overrides),
  spacedItem: (overrides: ProductOverride = {}) =>
    buildProduct("SpacedItem", 10, 11, 6, 200, overrides),
  denseCube: (overrides: ProductOverride = {}) =>
    buildProduct("DenseCube", 10, 10, 10, 900, overrides),
};

export const CORE_SELECTION_CASES: PackingCase[] = [
  {
    id: "single-general",
    description: "single general item selects the default cube",
    items: [buildProduct("Cube12", 12, 12, 12, 200)],
    expected: { boxNames: ["QA-02 Cube 16x16x16"] },
  },
  {
    id: "cube10-selects-tall-box",
    description: "Cube10 selects the tall box because the flat box is too short",
    items: [PACKWELL_ITEMS.cube10()],
    expected: { boxNames: ["QA-03 Tall 10x24x10"] },
  },
  {
    id: "single-rotatable-flat",
    description: "rotatable flat item selects the flat box",
    items: [PACKWELL_ITEMS.rotPanel()],
    expected: { boxNames: ["QA-01 Flat 16x6x16"] },
  },
  {
    id: "horizontal-only",
    description: "horizontal-only item selects the flat box",
    items: [PACKWELL_ITEMS.rotPanel({ orientation: "horizontal" })],
    expected: { boxNames: ["QA-01 Flat 16x6x16"] },
  },
  {
    id: "vertical-only",
    description: "vertical-only item selects the tall box",
    items: [PACKWELL_ITEMS.tall8x18({ orientation: "vertical" })],
    expected: { boxNames: ["QA-03 Tall 10x24x10"] },
  },
  {
    id: "quantity-single-box",
    description: "quantity expansion stays in one medium cube",
    items: [buildProduct("Cube12", 12, 12, 12, 200, { quantity: 3 })],
    expected: { boxNames: ["QA-07 Cube 24x24x24"] },
  },
  {
    id: "optimal-multi-box",
    description: "multi-box fallback minimizes total dimensional weight",
    items: [
      buildProduct("Greedy", 20, 18, 18, 400, { quantity: 2 }),
    ],
    expected: {
      boxNames: ["QA-06 Limited 22x22x22", "QA-06 Limited 22x22x22"],
    },
  },
  {
    id: "all-stackable",
    description: "all-stackable pair packs into the small cube",
    items: [PACKWELL_ITEMS.base12(), PACKWELL_ITEMS.top10()],
    expected: { boxNames: ["QA-02 Cube 16x16x16"] },
  },
  {
    id: "no-stack-on-top",
    description: "canStackOnTop=false promotes the result to a larger box",
    items: [
      PACKWELL_ITEMS.base12({ canStackOnTop: false }),
      PACKWELL_ITEMS.top10(),
    ],
    expected: {
      boxNames: ["QA-04 Mailer 24x12x18"],
      preservedHeights: { Base12: 10 },
    },
  },
  {
    id: "floor-only",
    description: "canBePlacedOnTop=false keeps the floor-only item at y=0",
    items: [
      PACKWELL_ITEMS.floor10(),
      buildProduct("Topper", 10, 8, 10, 200),
    ],
    expected: {
      boxNames: ["QA-04 Mailer 24x12x18"],
      floorItemNames: ["Floor10"],
    },
  },
  {
    id: "smaller-floor-only",
    description: "floor-only regression keeps the smaller item grounded",
    items: [
      PACKWELL_ITEMS.large14x18(),
      PACKWELL_ITEMS.floor10(),
    ],
    expected: {
      boxNames: ["QA-07 Cube 24x24x24"],
      floorItemNames: ["Floor10"],
    },
  },
  {
    id: "both-stacking-flags-false",
    description: "both stacking flags false preserve height and floor placement",
    items: [
      PACKWELL_ITEMS.cube10({
        canStackOnTop: false,
        canBePlacedOnTop: false,
      }),
    ],
    expected: {
      boxNames: ["QA-01 Flat 16x6x16"],
      floorItemNames: ["Cube10"],
      preservedHeights: { Cube10: 10 },
    },
  },
  {
    id: "horizontal-floor-only",
    description: "horizontal floor-only item combines with a cube in the mailer",
    items: [
      buildProduct("WideFloor", 14, 4, 14, 200, {
        orientation: "horizontal",
        canBePlacedOnTop: false,
      }),
      PACKWELL_ITEMS.cube10(),
    ],
    expected: {
      boxNames: ["QA-04 Mailer 24x12x18"],
      floorItemNames: ["WideFloor"],
    },
  },
  {
    id: "vertical-no-stack",
    description: "vertical no-stack item promotes the result to the medium cube",
    items: [
      PACKWELL_ITEMS.tall8x18({
        orientation: "vertical",
        canStackOnTop: false,
      }),
      buildProduct("Companion16", 16, 16, 16, 150),
    ],
    expected: {
      boxNames: ["QA-07 Cube 24x24x24"],
      preservedHeights: { Tall8x18: 18 },
    },
  },
  {
    id: "weight-disqualifies-smaller-box",
    description: "weight pushes the result past the limited box",
    items: [buildProduct("DenseCube17", 17, 13, 13, 900)],
    expected: { boxNames: ["QA-07 Cube 24x24x24"] },
  },
  {
    id: "weight-under-limit",
    description: "lighter item still uses the limited box",
    items: [buildProduct("DenseCube17", 17, 13, 13, 700)],
    expected: { boxNames: ["QA-06 Limited 22x22x22"] },
  },
];

export const SPACING_OVERRIDE_CASES: SpacingOverrideCase[] = [
  {
    id: "native-spacing-disqualifies-smaller-box",
    description: "native spacing promotes the result to the mailer",
    items: [
      buildProduct("WeightedSpaced", 11, 12, 9, 450, { quantity: 2 }),
    ],
    spacingOverride: null,
    expected: { boxNames: ["QA-04 Mailer 24x12x18"] },
  },
  {
    id: "override-zero-restores-smaller-box",
    description: "spacingOverride=0 restores the smaller spaced box",
    items: [
      buildProduct("WeightedSpaced", 11, 12, 9, 450, { quantity: 2 }),
    ],
    spacingOverride: 0,
    expected: { boxNames: ["QA-05 Spaced 24x15x10"] },
  },
  {
    id: "override-two-promotes-larger-box",
    description: "spacingOverride=2 promotes the result to the medium cube",
    items: [
      buildProduct("WeightedSpaced", 11, 12, 9, 450, { quantity: 2 }),
    ],
    spacingOverride: 2,
    expected: { boxNames: ["QA-07 Cube 24x24x24"] },
  },
];

export function cloneBoxes(boxes: SeedBox[] = QA_BOXES): SeedBox[] {
  return boxes.map((box) => ({ ...box }));
}

export function createUnlimitedWeightBox(
  overrides: Partial<SeedBox> = {}
): SeedBox {
  return {
    id: "synthetic-unlimited",
    name: "Synthetic Unlimited",
    width: 20,
    height: 20,
    depth: 20,
    spacing: 0,
    maxWeight: null,
    ...overrides,
  };
}
