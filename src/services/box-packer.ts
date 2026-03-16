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

function makeProductsUnique(products: IProduct[]): IProduct[] {
  return products.map((product, index) => ({
    ...product,
    name: `${product.name}_${index}`,
  }));
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

function getDimensionalWeight(box: IBox): number {
  return Math.ceil((box.width * box.height * box.depth) / 5000);
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

        results.push({
          box,
          items: packedItems,
          dimensionalWeight: getDimensionalWeight(box),
        });
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

export function findIdealBox(
  products: IProduct[],
  spacing = 0
): PackingResult | null {
  if (products.length === 0) {
    return null;
  }

  const uniqueProducts = makeProductsUnique(products);
  const normalizedSpacing = Math.max(spacing, 0);
  const lowerBounds = {
    width: Math.max(...uniqueProducts.map((product) => product.width)),
    height: Math.max(...uniqueProducts.map((product) => product.height)),
    depth: Math.max(...uniqueProducts.map((product) => product.depth)),
  };
  const spacingPadding = normalizedSpacing * (uniqueProducts.length + 1);
  const current = {
    width:
      uniqueProducts.reduce((sum, product) => sum + product.width, 0) +
      spacingPadding,
    height:
      uniqueProducts.reduce((sum, product) => sum + product.height, 0) +
      spacingPadding,
    depth:
      uniqueProducts.reduce((sum, product) => sum + product.depth, 0) +
      spacingPadding,
  };
  const createIdealBox = (dimensions: typeof current): IBox => ({
    id: "ideal",
    name: "Ideal Box",
    ...dimensions,
    spacing: normalizedSpacing,
  });

  for (let round = 0; round < 4; round += 1) {
    for (const dimension of ["width", "height", "depth"] as const) {
      let low = lowerBounds[dimension];
      let high = current[dimension];

      while (high - low > 0.1) {
        const mid = low + (high - low) / 2;
        const candidate = createIdealBox({
          ...current,
          [dimension]: mid,
        });

        if (checkFit(candidate, uniqueProducts).fits) {
          high = mid;
        } else {
          low = mid;
        }
      }

      current[dimension] = high;
    }
  }

  const idealBox = createIdealBox(current);
  const finalResult = checkFit(idealBox, uniqueProducts);

  if (!finalResult.fits) {
    return null;
  }

  return {
    box: idealBox,
    items: finalResult.packedItems,
    dimensionalWeight: getDimensionalWeight(idealBox),
  };
}

export function calculatePacking(
  boxes: IBox[],
  products: IProduct[]
): PackingResult[] {
  if (products.length === 0) return [];
  if (boxes.length === 0) throw new Error("No boxes available");

  const uniqueProducts = makeProductsUnique(products);

  // Try single box first
  const singleResult = getSmallestSuitableBox(boxes, uniqueProducts);
  if (singleResult) {
    return [
      {
        box: singleResult.box,
        items: singleResult.packedItems,
        dimensionalWeight: getDimensionalWeight(singleResult.box),
      },
    ];
  }

  // Fall back to multi-box
  return packMultiBox(boxes, uniqueProducts);
}
