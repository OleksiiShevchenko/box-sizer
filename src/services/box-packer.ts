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

function normalizePackedItem(item: BinPackingItem): PackedItem {
  const [width, height, depth] = item.getDimension();

  return {
    name: item.name,
    width: width / BINPACKING_SCALE_FACTOR,
    height: height / BINPACKING_SCALE_FACTOR,
    depth: depth / BINPACKING_SCALE_FACTOR,
    x: (item.position?.[0] ?? 0) / BINPACKING_SCALE_FACTOR,
    y: (item.position?.[1] ?? 0) / BINPACKING_SCALE_FACTOR,
    z: (item.position?.[2] ?? 0) / BINPACKING_SCALE_FACTOR,
  };
}

export function checkFit(
  box: IBox,
  products: IProduct[]
): { fits: boolean; packedItems: PackedItem[] } {
  const packer = new Packer();
  const bin = new Bin(
    box.name,
    box.width,
    box.height,
    box.depth,
    box.maxWeight ?? 9999999
  );
  packer.addBin(bin);

  for (const p of products) {
    packer.addItem(
      new Item(p.name, p.width, p.height, p.depth, p.weight ?? 0)
    );
  }

  packer.pack();

  const packedItems: PackedItem[] = bin.items.map(normalizePackedItem);

  return {
    fits: bin.items.length === products.length,
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
      const packer = new Packer();
      const bin = new Bin(
        box.name,
        box.width,
        box.height,
        box.depth,
        box.maxWeight ?? 9999999
      );
      packer.addBin(bin);

      for (const p of remaining) {
        packer.addItem(
          new Item(p.name, p.width, p.height, p.depth, p.weight ?? 0)
        );
      }

      packer.pack();

      if (bin.items.length > 0) {
        const fittedNames = new Set(
          bin.items.map((i: { name: string }) => i.name)
        );
        remaining = remaining.filter((p) => !fittedNames.has(p.name));

        const packedItems: PackedItem[] = bin.items.map(normalizePackedItem);

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
        `Cannot fit item(s): ${remaining.map((r) => r.name).join(", ")}`
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
