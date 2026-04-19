import type { IBox, IProduct, Orientation } from "@/types";
import { inchesToCm, ozToGrams } from "@/types";

export type DemoScenarioId = "ecommerce-order" | "gift-kit";
export const DEMO_MAX_ITEM_QUANTITY = 50;
export const DEMO_MAX_TOTAL_UNITS = 120;

export interface DemoScenarioItem {
  id: string;
  name: string;
  quantity: number;
  widthIn: number;
  heightIn: number;
  depthIn: number;
  weightOz: number;
  canStackOnTop?: boolean;
  canBePlacedOnTop?: boolean;
  orientation?: Orientation;
}

export interface DemoScenario {
  id: DemoScenarioId;
  name: string;
  description: string;
  imageSrc: string;
  spacingOverrideIn: number;
  items: DemoScenarioItem[];
}

function createDemoBox(
  id: string,
  name: string,
  widthIn: number,
  heightIn: number,
  depthIn: number
): IBox {
  return {
    id,
    name,
    width: inchesToCm(widthIn),
    height: inchesToCm(heightIn),
    depth: inchesToCm(depthIn),
    spacing: 0,
    maxWeight: null,
  };
}

export const DEMO_BOXES: IBox[] = [
  createDemoBox("demo-small-mailer", "Small Mailer", 10, 8, 4),
  createDemoBox("demo-medium-mailer", "Medium Mailer", 12, 10, 6),
  createDemoBox("demo-gift-set-box", "Gift Set Box", 15, 6, 9),
  createDemoBox("demo-large-shipper", "Large Shipper", 14, 10, 8),
  createDemoBox("demo-wide-shipper", "Wide Shipper", 18, 10, 14),
  createDemoBox("demo-xl-shipper", "XL Shipper", 16, 12, 10),
];

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "ecommerce-order",
    name: "Ecommerce order",
    description: "A typical online order with shoes, apparel, and accessories.",
    imageSrc: "/demo/ecommerce-order-card.png",
    spacingOverrideIn: 0,
    items: [
      {
        id: "running-shoes",
        name: "Running shoes",
        quantity: 1,
        widthIn: 13,
        heightIn: 8,
        depthIn: 5,
        weightOz: 32,
      },
      {
        id: "folded-tshirt",
        name: "Folded t-shirt",
        quantity: 1,
        widthIn: 10,
        heightIn: 8,
        depthIn: 1.5,
        weightOz: 8,
      },
      {
        id: "pair-of-socks",
        name: "Pair of socks",
        quantity: 2,
        widthIn: 6,
        heightIn: 4,
        depthIn: 1.5,
        weightOz: 3,
      },
    ],
  },
  {
    id: "gift-kit",
    name: "Gift kit",
    description: "A curated gift set with fragile items and a flat insert.",
    imageSrc: "/demo/gift-kit-card.png",
    spacingOverrideIn: 0.25,
    items: [
      {
        id: "ceramic-mug",
        name: "Ceramic mug",
        quantity: 1,
        widthIn: 4.5,
        heightIn: 4.5,
        depthIn: 4.5,
        weightOz: 14,
        canStackOnTop: false,
        canBePlacedOnTop: false,
      },
      {
        id: "soy-candle",
        name: "Soy candle",
        quantity: 1,
        widthIn: 3.5,
        heightIn: 3.5,
        depthIn: 4,
        weightOz: 12,
        canStackOnTop: false,
        canBePlacedOnTop: false,
      },
      {
        id: "notebook",
        name: "Notebook",
        quantity: 1,
        widthIn: 8.5,
        heightIn: 6,
        depthIn: 0.75,
        weightOz: 10,
        canStackOnTop: false,
        canBePlacedOnTop: false,
        orientation: "horizontal",
      },
    ],
  },
];

export function getDemoScenario(scenarioId: DemoScenarioId): DemoScenario | undefined {
  return DEMO_SCENARIOS.find((scenario) => scenario.id === scenarioId);
}

export function buildDemoProducts(
  scenario: DemoScenario,
  quantities: Record<string, number>
): IProduct[] {
  return scenario.items
    .filter((item) => quantities[item.id] != null)
    .map((item) => ({
      name: item.name,
      quantity: quantities[item.id],
      width: inchesToCm(item.widthIn),
      height: inchesToCm(item.heightIn),
      depth: inchesToCm(item.depthIn),
      weight: ozToGrams(item.weightOz),
      canStackOnTop: item.canStackOnTop ?? true,
      canBePlacedOnTop: item.canBePlacedOnTop ?? true,
      orientation: item.orientation ?? "any",
    }));
}
