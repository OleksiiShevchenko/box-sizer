import { BP3D } from "binpackingjs";
import type { IBox, IProduct, PackingResult, PackedItem, Orientation } from "@/types";

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

// BP3D rotation types: each maps [w,h,d] → [X,Y,Z]
// 0: WHD  w→X h→Y d→Z   (height stays on Y)
// 1: HWD  h→X w→Y d→Z
// 2: HDW  h→X d→Y w→Z
// 3: DHW  d→X h→Y w→Z   (height stays on Y)
// 4: DWH  d→X w→Y h→Z
// 5: WDH  w→X d→Y h→Z
const ALL_ROTATIONS = [0, 1, 2, 3, 4, 5];
const HEIGHT_ON_Y_ROTATIONS = [0, 3];

function arrangeForOrientation(
  w: number,
  h: number,
  d: number,
  orientation: Orientation | undefined
): [number, number, number] {
  if (!orientation || orientation === "any") return [w, h, d];

  const dims = [w, h, d].sort((a, b) => a - b);

  if (orientation === "horizontal") {
    return [dims[2], dims[0], dims[1]];
  }

  return [dims[1], dims[2], dims[0]];
}

function getAllowedRotations(product: IProduct): number[] {
  const hasOrientationConstraint =
    product.orientation === "horizontal" || product.orientation === "vertical";
  const hasStackingConstraint =
    product.canStackOnTop === false || product.canBePlacedOnTop === false;

  if (hasOrientationConstraint || hasStackingConstraint) {
    return HEIGHT_ON_Y_ROTATIONS;
  }

  return ALL_ROTATIONS;
}

function getDimensionalWeight(box: IBox): number {
  return Math.ceil((box.width * box.height * box.depth) / 5000);
}

function normalizePackedItem(
  item: BinPackingItem,
  spacing: number,
  heightOverrides?: Map<string, number>
): PackedItem {
  const [inflatedWidth, inflatedHeight, inflatedDepth] = item.getDimension();

  const originalHeight = heightOverrides?.get(item.name);
  const height =
    originalHeight != null
      ? originalHeight
      : Math.max(inflatedHeight / BINPACKING_SCALE_FACTOR - spacing, 0);

  return {
    name: item.name,
    width: Math.max(inflatedWidth / BINPACKING_SCALE_FACTOR - spacing, 0),
    height,
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

  const heightOverrides = new Map<string, number>();

  for (const product of products) {
    const [ow, oh, od] = arrangeForOrientation(
      product.width,
      product.height,
      product.depth,
      product.orientation
    );

    // Both stacking flags use height inflation to enforce constraints:
    // - canStackOnTop=false: fills column so nothing can be placed above
    // - canBePlacedOnTop=false: fills column so item must start at y=0
    //   (BP3D sorts items by volume internally, so insertion order cannot
    //   guarantee floor placement — height inflation is the only reliable
    //   mechanism. As a side effect, it also prevents stacking above.)
    const needsHeightInflation =
      product.canStackOnTop === false || product.canBePlacedOnTop === false;

    let itemHeight = oh + spacing;
    if (needsHeightInflation) {
      heightOverrides.set(product.name, oh);
      itemHeight = effectiveHeight;
    }

    const allowedRotation = getAllowedRotations(product);

    packer.addItem(
      new Item(
        product.name,
        ow + spacing,
        itemHeight,
        od + spacing,
        product.weight ?? 0,
        allowedRotation
      )
    );
  }

  packer.pack();

  return {
    bin,
    packedItems: bin.items.map((item: BinPackingItem) =>
      normalizePackedItem(item, spacing, heightOverrides)
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
