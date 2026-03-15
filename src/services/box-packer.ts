import { BP3D } from "binpackingjs";
import type { IBox, IProduct, PackingResult, PackedItem } from "@/types";

const { Packer, Bin, Item } = BP3D;
const BINPACKING_SCALE_FACTOR = 10 ** 5;

type BinPackingItem = {
  name: string;
  width: number;
  height: number;
  depth: number;
  position: number[];
  getDimension(): [number, number, number];
};

type PackedBinResult = {
  bin: InstanceType<typeof Bin> | null;
  packedItems: PackedItem[];
};

function getDisplayItemName(name: string): string {
  return name.replace(/_\d+$/, "");
}

function formatUnpackedItemNames(products: IProduct[]): string {
  const counts = new Map<string, number>();

  for (const product of products) {
    const displayName = getDisplayItemName(product.name);
    counts.set(displayName, (counts.get(displayName) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([name, count]) => (count > 1 ? `${name} x${count}` : name))
    .join(", ");
}

function getBoxSpacing(box: IBox): number {
  return Math.max(box.spacing ?? 0, 0);
}

function normalizePackedItem(item: BinPackingItem, spacing: number): PackedItem {
  const [inflatedWidth, inflatedHeight, inflatedDepth] = item.getDimension();

  return {
    name: item.name,
    width: Math.max(inflatedWidth / BINPACKING_SCALE_FACTOR - spacing, 0),
    height: Math.max(inflatedHeight / BINPACKING_SCALE_FACTOR - spacing, 0),
    depth: Math.max(inflatedDepth / BINPACKING_SCALE_FACTOR - spacing, 0),
    x: (item.position?.[0] ?? 0) / BINPACKING_SCALE_FACTOR + spacing,
    y: (item.position?.[1] ?? 0) / BINPACKING_SCALE_FACTOR + spacing,
    z: (item.position?.[2] ?? 0) / BINPACKING_SCALE_FACTOR + spacing,
  };
}

function packItemsIntoBox(box: IBox, products: IProduct[]): PackedBinResult {
  const spacing = getBoxSpacing(box);
  const effectiveWidth = box.width - spacing;
  const effectiveHeight = box.height - spacing;
  const effectiveDepth = box.depth - spacing;

  if (effectiveWidth <= 0 || effectiveHeight <= 0 || effectiveDepth <= 0) {
    return { bin: null, packedItems: [] };
  }

  const packer = new Packer();
  const bin = new Bin(
    box.name,
    effectiveWidth,
    effectiveHeight,
    effectiveDepth,
    box.maxWeight ?? 9999999
  );
  packer.addBin(bin);

  for (const product of products) {
    packer.addItem(
      new Item(
        product.name,
        product.width + spacing,
        product.height + spacing,
        product.depth + spacing,
        product.weight ?? 0
      )
    );
  }

  packer.pack();

  return {
    bin,
    packedItems: bin.items.map((item: BinPackingItem) =>
      normalizePackedItem(item, spacing)
    ),
  };
}

export function checkFit(
  box: IBox,
  products: IProduct[]
): { fits: boolean; packedItems: PackedItem[] } {
  const { bin, packedItems } = packItemsIntoBox(box, products);

  return {
    fits: bin?.items.length === products.length,
    packedItems,
  };
}

export function getSmallestSuitableBox(
  boxes: IBox[],
  products: IProduct[]
): { box: IBox; packedItems: PackedItem[] } | null {
  const sorted = [...boxes].sort(
    (a, b) => a.width * a.height * a.depth - b.width * b.height * b.depth
  );

  for (const box of sorted) {
    const result = checkFit(box, products);
    if (result.fits) {
      return { box, packedItems: result.packedItems };
    }
  }

  return null;
}

export function packMultiBox(
  boxes: IBox[],
  products: IProduct[]
): PackingResult[] {
  const sortedBoxes = [...boxes].sort(
    (a, b) => b.width * b.height * b.depth - a.width * a.height * a.depth
  );

  const results: PackingResult[] = [];
  let remaining = [...products];
  let iteration = 0;

  while (remaining.length > 0) {
    iteration++;
    if (iteration > 100) {
      throw new Error("Too many packing iterations - possible infinite loop");
    }

    let packed = false;

    for (const box of sortedBoxes) {
      const { bin, packedItems } = packItemsIntoBox(box, remaining);

      if (bin && bin.items.length > 0) {
        const fittedNames = new Set(
          bin.items.map((i: { name: string }) => i.name)
        );
        remaining = remaining.filter((p) => !fittedNames.has(p.name));

        const dimWeight = Math.ceil(
          (box.width * box.height * box.depth) / 5000
        );
        results.push({ box, items: packedItems, dimensionalWeight: dimWeight });
        packed = true;
        break;
      }
    }

    if (!packed) {
      throw new Error(
        `Cannot fit item(s) with the current box spacing: ${formatUnpackedItemNames(remaining)}`
      );
    }
  }

  return results;
}

export function calculatePacking(
  boxes: IBox[],
  products: IProduct[]
): PackingResult[] {
  if (products.length === 0) return [];
  if (boxes.length === 0) throw new Error("No boxes available");

  // Make product names unique to avoid collision in Set lookups
  const uniqueProducts = products.map((p, i) => ({
    ...p,
    name: `${p.name}_${i}`,
  }));

  // Try single box first
  const singleResult = getSmallestSuitableBox(boxes, uniqueProducts);
  if (singleResult) {
    const dimWeight = Math.ceil(
      (singleResult.box.width *
        singleResult.box.height *
        singleResult.box.depth) /
        5000
    );
    return [
      {
        box: singleResult.box,
        items: singleResult.packedItems,
        dimensionalWeight: dimWeight,
      },
    ];
  }

  // Fall back to multi-box
  return packMultiBox(boxes, uniqueProducts);
}
