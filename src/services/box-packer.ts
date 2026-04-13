import { BP3D } from "binpackingjs";
import {
  normalizeProductQuantity,
  type IBox,
  type IProduct,
  type PackingResult,
  type PackedItem,
  type Orientation,
} from "@/types";

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

type BoxSubsetCandidate = {
  box: IBox;
  packedItems: PackedItem[];
  dimensionalWeight: number;
};

type MultiBoxSolution = {
  results: PackingResult[];
  totalDimensionalWeight: number;
  totalVolume: number;
};

const EXACT_MULTI_BOX_ITEM_LIMIT = 15;

function getDisplayItemName(name: string): string {
  return name.replace(/_\d+$/, "");
}

function makeProductsUnique(products: IProduct[]): IProduct[] {
  return products.map((product, index) => ({
    ...product,
    quantity: 1,
    name: `${product.name}_${index}`,
  }));
}

function expandProductsByQuantity(products: IProduct[]): IProduct[] {
  return products.flatMap((product) =>
    Array.from({ length: normalizeProductQuantity(product.quantity) }, () => ({
      ...product,
      quantity: 1,
    }))
  );
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

function getBoxVolume(box: IBox): number {
  return box.width * box.height * box.depth;
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

function hasItemStackedAbove(
  item: PackedItem,
  allItems: PackedItem[]
): boolean {
  const itemTop = item.y + item.height;
  for (const other of allItems) {
    if (other === item) continue;
    // Check if other item is above and overlaps in the x-z footprint
    const overlapX =
      other.x < item.x + item.width && other.x + other.width > item.x;
    const overlapZ =
      other.z < item.z + item.depth && other.z + other.depth > item.z;
    if (overlapX && overlapZ && other.y >= itemTop - 0.001) {
      return true;
    }
  }
  return false;
}

type CanStackOnTopInflation = "none" | "partial" | "full";

function getMinOtherItemHeight(
  products: IProduct[],
  spacing: number
): number {
  let minHeight = Infinity;
  for (const product of products) {
    if (product.canStackOnTop === false) continue;
    const [, oh] = arrangeForOrientation(
      product.width,
      product.height,
      product.depth,
      product.orientation
    );
    // For items with ALL_ROTATIONS, any dimension can be height.
    // The minimum possible height is the smallest dimension.
    const rotations = getAllowedRotations(product);
    const minDim =
      rotations.length === ALL_ROTATIONS.length
        ? Math.min(product.width, product.height, product.depth)
        : oh;
    minHeight = Math.min(minHeight, minDim + spacing);
  }
  return minHeight;
}

function runPacker(
  box: IBox,
  products: IProduct[],
  canStackOnTopInflation: CanStackOnTopInflation
): PackedBinResult {
  const spacing = getBoxSpacing(box);
  const effectiveWidth = box.width - spacing;
  const effectiveHeight = box.height - spacing;
  const effectiveDepth = box.depth - spacing;

  if (effectiveWidth <= 0 || effectiveHeight <= 0 || effectiveDepth <= 0) {
    return { bin: null, packedItems: [] };
  }

  // For partial inflation, compute the target height that guarantees
  // no other item can fit above the constrained item.
  let canStackOnTopTarget = effectiveHeight;
  if (canStackOnTopInflation === "partial") {
    const minOtherHeight = getMinOtherItemHeight(products, spacing);
    if (minOtherHeight > 0 && isFinite(minOtherHeight)) {
      // Leave just under minOtherHeight of space above, so nothing fits
      canStackOnTopTarget = effectiveHeight - minOtherHeight + 0.001;
    }
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

    // canBePlacedOnTop=false always needs full inflation (forces floor placement).
    // canStackOnTop=false inflation depends on the strategy.
    let itemHeight = oh + spacing;
    if (product.canBePlacedOnTop === false) {
      heightOverrides.set(product.name, oh);
      itemHeight = effectiveHeight;
    } else if (
      canStackOnTopInflation !== "none" &&
      product.canStackOnTop === false
    ) {
      heightOverrides.set(product.name, oh);
      itemHeight = canStackOnTopTarget;
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

function packItemsIntoBox(box: IBox, products: IProduct[]): PackedBinResult {
  const hasCanStackOnTopOnly = products.some(
    (p) => p.canStackOnTop === false && p.canBePlacedOnTop !== false
  );

  if (!hasCanStackOnTopOnly) {
    return runPacker(box, products, "full");
  }

  // Strategy 1: No inflation for canStackOnTop — allows the item to be
  // placed on top of others. If no stacking violations, this is ideal.
  const relaxed = runPacker(box, products, "none");
  if (relaxed.bin && relaxed.bin.items.length === products.length) {
    const productMap = new Map(products.map((p) => [p.name, p]));
    const violated = relaxed.packedItems.some((packed) => {
      const product = productMap.get(packed.name);
      return (
        product?.canStackOnTop === false &&
        hasItemStackedAbove(packed, relaxed.packedItems)
      );
    });
    if (!violated) {
      return relaxed;
    }
  }

  // Strategy 2: Partial inflation — inflate canStackOnTop=false items just
  // enough to prevent any other item from fitting above, while wasting less
  // space than full inflation. This is guaranteed to satisfy the constraint
  // without needing post-validation.
  const partial = runPacker(box, products, "partial");
  if (partial.bin && partial.bin.items.length === products.length) {
    return partial;
  }

  // Strategy 3: Full inflation (original behavior)
  return runPacker(box, products, "full");
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
  const sortedBoxes = [...boxes].sort((a, b) => {
    const dimWeightDiff = getDimensionalWeight(a) - getDimensionalWeight(b);
    if (dimWeightDiff !== 0) {
      return dimWeightDiff;
    }

    const volumeDiff = getBoxVolume(a) - getBoxVolume(b);
    if (volumeDiff !== 0) {
      return volumeDiff;
    }

    return a.name.localeCompare(b.name);
  });

  if (products.length <= EXACT_MULTI_BOX_ITEM_LIMIT) {
    const exactResult = packMultiBoxOptimally(sortedBoxes, products);
    if (exactResult) {
      return exactResult;
    }
  }

  return packMultiBoxHeuristic(sortedBoxes, products);
}

function buildMaskKey(mask: number): string {
  return mask.toString(36);
}

function isBetterSolution(
  candidate: MultiBoxSolution,
  currentBest: MultiBoxSolution | null
): boolean {
  if (!currentBest) {
    return true;
  }

  if (candidate.totalDimensionalWeight !== currentBest.totalDimensionalWeight) {
    return candidate.totalDimensionalWeight < currentBest.totalDimensionalWeight;
  }

  if (candidate.totalVolume !== currentBest.totalVolume) {
    return candidate.totalVolume < currentBest.totalVolume;
  }

  if (candidate.results.length !== currentBest.results.length) {
    return candidate.results.length < currentBest.results.length;
  }

  const candidateSignature = candidate.results.map((result) => result.box.name).join("|");
  const currentSignature = currentBest.results.map((result) => result.box.name).join("|");
  return candidateSignature < currentSignature;
}

function packMultiBoxOptimally(
  boxes: IBox[],
  products: IProduct[]
): PackingResult[] | null {
  const totalMask = (1 << products.length) - 1;
  const productsForMask = new Map<number, IProduct[]>();
  const fitCache = new Map<string, BoxSubsetCandidate | null>();
  const memo = new Map<number, MultiBoxSolution | null>();

  const getProductsForMask = (mask: number) => {
    const cachedProducts = productsForMask.get(mask);
    if (cachedProducts) {
      return cachedProducts;
    }

    const subsetProducts = products.filter((_, index) => (mask & (1 << index)) !== 0);
    productsForMask.set(mask, subsetProducts);
    return subsetProducts;
  };

  const getCandidate = (box: IBox, boxIndex: number, mask: number) => {
    const cacheKey = `${boxIndex}:${buildMaskKey(mask)}`;
    const cachedCandidate = fitCache.get(cacheKey);
    if (cachedCandidate !== undefined) {
      return cachedCandidate;
    }

    const subsetProducts = getProductsForMask(mask);
    const result = checkFit(box, subsetProducts);
    if (!result.fits) {
      fitCache.set(cacheKey, null);
      return null;
    }

    const candidate = {
      box,
      packedItems: result.packedItems,
      dimensionalWeight: getDimensionalWeight(box),
    };
    fitCache.set(cacheKey, candidate);
    return candidate;
  };

  const search = (remainingMask: number): MultiBoxSolution | null => {
    if (remainingMask === 0) {
      return {
        results: [],
        totalDimensionalWeight: 0,
        totalVolume: 0,
      };
    }

    const cachedSolution = memo.get(remainingMask);
    if (cachedSolution !== undefined) {
      return cachedSolution;
    }

    let best: MultiBoxSolution | null = null;

    for (let boxIndex = 0; boxIndex < boxes.length; boxIndex += 1) {
      const box = boxes[boxIndex]!;

      for (
        let subsetMask = remainingMask;
        subsetMask > 0;
        subsetMask = (subsetMask - 1) & remainingMask
      ) {
        const candidate = getCandidate(box, boxIndex, subsetMask);
        if (!candidate) {
          continue;
        }

        const remainingSolution = search(remainingMask ^ subsetMask);
        if (!remainingSolution) {
          continue;
        }

        const currentResult: PackingResult = {
          box: candidate.box,
          items: candidate.packedItems,
          dimensionalWeight: candidate.dimensionalWeight,
        };
        const nextSolution: MultiBoxSolution = {
          results: [currentResult, ...remainingSolution.results],
          totalDimensionalWeight:
            candidate.dimensionalWeight + remainingSolution.totalDimensionalWeight,
          totalVolume: getBoxVolume(candidate.box) + remainingSolution.totalVolume,
        };

        if (isBetterSolution(nextSolution, best)) {
          best = nextSolution;
        }
      }
    }

    memo.set(remainingMask, best);
    return best;
  };

  return search(totalMask)?.results ?? null;
}

function packMultiBoxHeuristic(
  boxes: IBox[],
  products: IProduct[]
): PackingResult[] {
  const results: PackingResult[] = [];
  let remaining = [...products];
  let iteration = 0;

  while (remaining.length > 0) {
    iteration++;
    if (iteration > 100) {
      throw new Error("Too many packing iterations - possible infinite loop");
    }

    let packedCandidate:
      | {
          box: IBox;
          packedItems: PackedItem[];
          fittedNames: Set<string>;
          score: number;
        }
      | null = null;

    for (const box of boxes) {
      const { bin, packedItems } = packItemsIntoBox(box, remaining);

      if (!bin || bin.items.length === 0) {
        continue;
      }

      const fittedNames = new Set(bin.items.map((item: { name: string }) => item.name));
      const score = getDimensionalWeight(box) / bin.items.length;

      if (
        !packedCandidate ||
        score < packedCandidate.score ||
        (score === packedCandidate.score &&
          getDimensionalWeight(box) < getDimensionalWeight(packedCandidate.box)) ||
        (score === packedCandidate.score &&
          getDimensionalWeight(box) === getDimensionalWeight(packedCandidate.box) &&
          getBoxVolume(box) < getBoxVolume(packedCandidate.box))
      ) {
        packedCandidate = {
          box,
          packedItems,
          fittedNames,
          score,
        };
      }
    }

    if (!packedCandidate) {
      throw new Error(
        `Cannot fit item(s) with the current box spacing: ${formatUnpackedItemNames(remaining)}`
      );
    }

    remaining = remaining.filter((product) => !packedCandidate.fittedNames.has(product.name));
    results.push({
      box: packedCandidate.box,
      items: packedCandidate.packedItems,
      dimensionalWeight: getDimensionalWeight(packedCandidate.box),
    });
  }

  return results;
}

export function findIdealBox(
  products: IProduct[],
  spacing = 0
): PackingResult | null {
  const expandedProducts = expandProductsByQuantity(products);

  if (expandedProducts.length === 0) {
    return null;
  }

  const uniqueProducts = makeProductsUnique(expandedProducts);
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

  const uniqueProducts = makeProductsUnique(expandProductsByQuantity(products));

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
