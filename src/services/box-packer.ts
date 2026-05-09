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
const POSITION_TOLERANCE = 0.001;
const MIN_SUPPORT_SURFACE_RATIO = 0.7;
const STACK_EPSILON = 1;
const IDEAL_BOX_DIMENSION_TOLERANCE = 0.1;

type BinPackingPosition = [number, number, number];
type BinPackingDimensions = [number, number, number];
type BinPackingItem = InstanceType<typeof Item>;
type BinPackingBin = InstanceType<typeof Bin>;

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

type IdealBoxScore = {
  dimensionalWeight: number;
  aspectRatio: number;
  volume: number;
};

const IDEAL_BOX_RATIO_PATTERNS: [number, number, number][] = [
  [1, 1, 1],
  [1, 1, 1.25],
  [1, 1, 1.5],
  [1, 1.25, 1.5],
  [1, 1.25, 1.75],
  [1, 1.5, 1.5],
  [1, 1.5, 2],
  [1, 1.75, 2.25],
  [1, 2, 2.5],
];

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

function normalizePackedItem(item: BinPackingItem, spacing: number): PackedItem {
  const [width, height, depth] = item.getDimension();

  return {
    name: item.name,
    width: Math.max(width / BINPACKING_SCALE_FACTOR - spacing, 0),
    height: Math.max(height / BINPACKING_SCALE_FACTOR - spacing, 0),
    depth: Math.max(depth / BINPACKING_SCALE_FACTOR - spacing, 0),
    x: (item.position?.[0] ?? 0) / BINPACKING_SCALE_FACTOR + spacing,
    y: (item.position?.[1] ?? 0) / BINPACKING_SCALE_FACTOR + spacing,
    z: (item.position?.[2] ?? 0) / BINPACKING_SCALE_FACTOR + spacing,
  };
}

function getAxisOverlap(startA: number, sizeA: number, startB: number, sizeB: number): number {
  return Math.max(0, Math.min(startA + sizeA, startB + sizeB) - Math.max(startA, startB));
}

function hasItemStackedAbove(
  item: PackedItem,
  allItems: PackedItem[]
): boolean {
  const itemTop = item.y + item.height;
  for (const other of allItems) {
    if (other === item) continue;
    const overlapX = getAxisOverlap(item.x, item.width, other.x, other.width);
    const overlapZ = getAxisOverlap(item.z, item.depth, other.z, other.depth);
    if (overlapX > 0 && overlapZ > 0 && other.y >= itemTop - POSITION_TOLERANCE) {
      return true;
    }
  }
  return false;
}

function hasSufficientSupport(
  item: PackedItem,
  allItems: PackedItem[],
  spacing: number
): boolean {
  if (item.y <= spacing + POSITION_TOLERANCE) {
    return true;
  }

  const footprintArea = item.width * item.depth;
  if (footprintArea <= 0) {
    return false;
  }

  let supportedArea = 0;
  for (const other of allItems) {
    if (other === item) continue;

    const otherTop = other.y + other.height;
    const expectedSupportedY = otherTop + spacing;
    if (Math.abs(expectedSupportedY - item.y) > POSITION_TOLERANCE) {
      continue;
    }

    const overlapX = getAxisOverlap(item.x, item.width, other.x, other.width);
    if (overlapX <= 0) {
      continue;
    }

    const overlapZ = getAxisOverlap(item.z, item.depth, other.z, other.depth);
    if (overlapZ <= 0) {
      continue;
    }

    supportedArea += overlapX * overlapZ;
  }

  return supportedArea / footprintArea >= MIN_SUPPORT_SURFACE_RATIO;
}

function isPackedLayoutStable(
  packedItems: PackedItem[],
  products: IProduct[],
  spacing: number
): boolean {
  const productMap = new Map(products.map((product) => [product.name, product]));

  return packedItems.every((packed) => {
    const product = productMap.get(packed.name);
    if (!product) {
      return false;
    }

    if (!hasSufficientSupport(packed, packedItems, spacing)) {
      return false;
    }

    if (
      product.canBePlacedOnTop === false &&
      packed.y > spacing + POSITION_TOLERANCE
    ) {
      return false;
    }

    if (product.canStackOnTop === false && hasItemStackedAbove(packed, packedItems)) {
      return false;
    }

    return true;
  });
}

function footprintsOverlap(
  aPosition: BinPackingPosition,
  aDimensions: BinPackingDimensions,
  bPosition: BinPackingPosition,
  bDimensions: BinPackingDimensions
): boolean {
  const overlapX =
    aPosition[0] < bPosition[0] + bDimensions[0] &&
    aPosition[0] + aDimensions[0] > bPosition[0];
  const overlapZ =
    aPosition[2] < bPosition[2] + bDimensions[2] &&
    aPosition[2] + aDimensions[2] > bPosition[2];

  return overlapX && overlapZ;
}

function itemTop(
  position: BinPackingPosition,
  dimensions: BinPackingDimensions
): number {
  return position[1] + dimensions[1];
}

function isAboveOrTouching(baseY: number, topY: number): boolean {
  return baseY >= topY - STACK_EPSILON;
}

function createConstraintAwareBin(
  box: IBox,
  productByName: ReadonlyMap<string, IProduct>
): BinPackingBin {
  const spacing = getBoxSpacing(box);
  const bin = new Bin(
    box.name,
    box.width - spacing,
    box.height - spacing,
    box.depth - spacing,
    box.maxWeight ?? 9999999
  );

  bin.putItem = (item: BinPackingItem, position: BinPackingPosition): boolean => {
    const rotations = bin.getBestRotationOrder(item);
    const itemProduct = productByName.get(item.name);
    item.position = position;

    for (const rotation of rotations) {
      item.rotationType = rotation;
      const dimensions = item.getDimension() as BinPackingDimensions;

      if (
        bin.getWidth() < position[0] + dimensions[0] ||
        bin.getHeight() < position[1] + dimensions[1] ||
        bin.getDepth() < position[2] + dimensions[2]
      ) {
        continue;
      }

      if (itemProduct?.canBePlacedOnTop === false && position[1] !== 0) {
        continue;
      }

      let fits = true;

      for (const placedItem of bin.items) {
        if (placedItem.intersect(item)) {
          fits = false;
          break;
        }

        const placedDimensions = placedItem.getDimension() as BinPackingDimensions;
        const placedPosition = placedItem.position as BinPackingPosition;

        if (!footprintsOverlap(position, dimensions, placedPosition, placedDimensions)) {
          continue;
        }

        const placedProduct = productByName.get(placedItem.name);
        if (
          placedProduct?.canStackOnTop === false &&
          isAboveOrTouching(position[1], itemTop(placedPosition, placedDimensions))
        ) {
          fits = false;
          break;
        }

        if (
          itemProduct?.canStackOnTop === false &&
          isAboveOrTouching(placedPosition[1], itemTop(position, dimensions))
        ) {
          fits = false;
          break;
        }
      }

      if (fits) {
        bin.items.push(item);
        return true;
      }
    }

    return false;
  };

  return bin;
}

function runPacker(box: IBox, products: IProduct[]): PackedBinResult {
  const spacing = getBoxSpacing(box);
  const effectiveWidth = box.width - spacing;
  const effectiveHeight = box.height - spacing;
  const effectiveDepth = box.depth - spacing;

  if (effectiveWidth <= 0 || effectiveHeight <= 0 || effectiveDepth <= 0) {
    return { bin: null, packedItems: [] };
  }

  const packer = new Packer();
  const productByName = new Map(products.map((product) => [product.name, product]));
  const bin = createConstraintAwareBin(box, productByName);
  packer.addBin(bin);

  for (const product of products) {
    const [ow, oh, od] = arrangeForOrientation(
      product.width,
      product.height,
      product.depth,
      product.orientation
    );

    const allowedRotation = getAllowedRotations(product);

    packer.addItem(
      new Item(
        product.name,
        ow + spacing,
        oh + spacing,
        od + spacing,
        product.weight ?? 0,
        allowedRotation
      )
    );
  }

  packer.pack();

  return {
    bin,
    packedItems: bin.items.map((item: BinPackingItem) => normalizePackedItem(item, spacing)),
  };
}

function packItemsIntoBox(box: IBox, products: IProduct[]): PackedBinResult {
  const spacing = getBoxSpacing(box);
  const isValidResult = ({ bin, packedItems }: PackedBinResult) =>
    Boolean(
      bin &&
        bin.items.length > 0 &&
        isPackedLayoutStable(packedItems, products, spacing)
    );

  const packed = runPacker(box, products);
  return isValidResult(packed) ? packed : { bin: null, packedItems: [] };
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

function getIdealBoxScore(box: IBox): IdealBoxScore {
  const dims = [box.width, box.height, box.depth].sort((a, b) => a - b);
  return {
    dimensionalWeight: getDimensionalWeight(box),
    aspectRatio: dims[2]! / dims[0]!,
    volume: getBoxVolume(box),
  };
}

function isBetterIdealBoxScore(
  candidate: IdealBoxScore,
  currentBest: IdealBoxScore | null
): boolean {
  if (!currentBest) {
    return true;
  }

  if (candidate.dimensionalWeight !== currentBest.dimensionalWeight) {
    return candidate.dimensionalWeight < currentBest.dimensionalWeight;
  }

  if (candidate.aspectRatio !== currentBest.aspectRatio) {
    return candidate.aspectRatio < currentBest.aspectRatio;
  }

  return candidate.volume < currentBest.volume;
}

function permuteRatios(
  pattern: readonly [number, number, number]
): [number, number, number][] {
  const seen = new Set<string>();
  const result: [number, number, number][] = [];
  const values = [...pattern];

  for (const a of values) {
    for (const b of values) {
      for (const c of values) {
        const candidate: [number, number, number] = [a, b, c];
        const sameValues =
          candidate.slice().sort((left, right) => left - right).join("|") ===
          values.slice().sort((left, right) => left - right).join("|");

        if (!sameValues) {
          continue;
        }

        const key = candidate.join("|");
        if (seen.has(key)) {
          continue;
        }

        seen.add(key);
        result.push(candidate);
      }
    }
  }

  return result;
}

function normalizeRatios(
  ratios: readonly [number, number, number]
): [number, number, number] {
  const ratioVolume = Math.cbrt(ratios[0] * ratios[1] * ratios[2]);
  return [
    ratios[0] / ratioVolume,
    ratios[1] / ratioVolume,
    ratios[2] / ratioVolume,
  ];
}

function createIdealBoxCandidate(
  dimensions: { width: number; height: number; depth: number },
  spacing: number
): IBox {
  return {
    id: "ideal",
    name: "Ideal Box",
    ...dimensions,
    spacing,
  };
}

function getPackedLayoutExtents(
  packedItems: PackedItem[],
  spacing: number
): { width: number; height: number; depth: number } {
  const maxX = packedItems.reduce((value, item) => Math.max(value, item.x + item.width), 0);
  const maxY = packedItems.reduce((value, item) => Math.max(value, item.y + item.height), 0);
  const maxZ = packedItems.reduce((value, item) => Math.max(value, item.z + item.depth), 0);

  return {
    width: maxX + spacing,
    height: maxY + spacing,
    depth: maxZ + spacing,
  };
}

function minimizeIdealBoxDimension(
  box: IBox,
  products: IProduct[],
  dimension: "width" | "height" | "depth"
): { box: IBox; packedItems: PackedItem[] } | null {
  const spacing = getBoxSpacing(box);
  const initialResult = checkFit(box, products);

  if (!initialResult.fits) {
    return null;
  }

  let low = 0;
  let high = box[dimension];
  let bestValue = box[dimension];
  let bestPackedItems = initialResult.packedItems;

  while (high - low > IDEAL_BOX_DIMENSION_TOLERANCE) {
    const mid = low + (high - low) / 2;
    const candidate = createIdealBoxCandidate(
      {
        width: dimension === "width" ? mid : box.width,
        height: dimension === "height" ? mid : box.height,
        depth: dimension === "depth" ? mid : box.depth,
      },
      spacing
    );
    const result = checkFit(candidate, products);

    if (result.fits) {
      bestValue = mid;
      bestPackedItems = result.packedItems;
      high = mid;
    } else {
      low = mid;
    }
  }

  return {
    box: createIdealBoxCandidate(
      {
        width: dimension === "width" ? bestValue : box.width,
        height: dimension === "height" ? bestValue : box.height,
        depth: dimension === "depth" ? bestValue : box.depth,
      },
      spacing
    ),
    packedItems: bestPackedItems,
  };
}

function tightenIdealBoxCandidate(
  candidate: { box: IBox; packedItems: PackedItem[] },
  products: IProduct[]
): { box: IBox; packedItems: PackedItem[] } | null {
  const spacing = getBoxSpacing(candidate.box);
  let currentBox = candidate.box;
  let currentPackedItems = candidate.packedItems;

  const compactBox = createIdealBoxCandidate(
    getPackedLayoutExtents(currentPackedItems, spacing),
    spacing
  );
  const compactResult = checkFit(compactBox, products);

  if (compactResult.fits) {
    currentBox = compactBox;
    currentPackedItems = compactResult.packedItems;
  }

  for (let round = 0; round < 3; round += 1) {
    let improved = false;

    for (const dimension of ["width", "height", "depth"] as const) {
      const minimized = minimizeIdealBoxDimension(currentBox, products, dimension);
      if (!minimized) {
        return null;
      }

      if (minimized.box[dimension] < currentBox[dimension] - POSITION_TOLERANCE) {
        currentBox = minimized.box;
        currentPackedItems = minimized.packedItems;
        improved = true;
      }
    }

    if (!improved) {
      break;
    }
  }

  const finalResult = checkFit(currentBox, products);
  if (!finalResult.fits) {
    return null;
  }

  return {
    box: currentBox,
    packedItems: finalResult.packedItems,
  };
}

function findIdealBoxForRatios(
  ratios: readonly [number, number, number],
  lowerBounds: { width: number; height: number; depth: number },
  upperBounds: { width: number; height: number; depth: number },
  spacing: number,
  products: IProduct[]
): { box: IBox; packedItems: PackedItem[] } | null {
  const [ratioWidth, ratioHeight, ratioDepth] = normalizeRatios(ratios);

  const createCandidateAtScale = (scale: number) =>
    createIdealBoxCandidate(
      {
        width: ratioWidth * scale,
        height: ratioHeight * scale,
        depth: ratioDepth * scale,
      },
      spacing
    );

  let low = Math.max(
    lowerBounds.width / ratioWidth,
    lowerBounds.height / ratioHeight,
    lowerBounds.depth / ratioDepth
  );
  let high = Math.max(
    upperBounds.width / ratioWidth,
    upperBounds.height / ratioHeight,
    upperBounds.depth / ratioDepth,
    low
  );

  let result = checkFit(createCandidateAtScale(high), products);
  let attempts = 0;

  while (!result.fits && attempts < 8) {
    high *= 1.5;
    result = checkFit(createCandidateAtScale(high), products);
    attempts += 1;
  }

  if (!result.fits) {
    return null;
  }

  while (high - low > IDEAL_BOX_DIMENSION_TOLERANCE) {
    const mid = low + (high - low) / 2;
    const candidate = createCandidateAtScale(mid);

    if (checkFit(candidate, products).fits) {
      high = mid;
    } else {
      low = mid;
    }
  }

  const finalBox = createCandidateAtScale(high);
  const finalResult = checkFit(finalBox, products);

  if (!finalResult.fits) {
    return null;
  }

  return tightenIdealBoxCandidate(
    {
      box: finalBox,
      packedItems: finalResult.packedItems,
    },
    products
  );
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

  if (uniqueProducts.length === 1) {
    const product = uniqueProducts[0]!;
    const [width, height, depth] = arrangeForOrientation(
      product.width,
      product.height,
      product.depth,
      product.orientation
    );
    const idealBox = createIdealBoxCandidate(
      {
        width: width + normalizedSpacing * 2,
        height: height + normalizedSpacing * 2,
        depth: depth + normalizedSpacing * 2,
      },
      normalizedSpacing
    );
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

  const lowerBounds = {
    width: Math.max(...uniqueProducts.map((product) => product.width)),
    height: Math.max(...uniqueProducts.map((product) => product.height)),
    depth: Math.max(...uniqueProducts.map((product) => product.depth)),
  };
  const spacingPadding = normalizedSpacing * (uniqueProducts.length + 1);
  const upperBounds = {
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
  const ratioPatterns = new Map<string, [number, number, number]>();

  for (const pattern of IDEAL_BOX_RATIO_PATTERNS) {
    for (const permutation of permuteRatios(pattern)) {
      ratioPatterns.set(permutation.join("|"), permutation);
    }
  }

  const lowerBoundPattern: [number, number, number] = [
    lowerBounds.width,
    lowerBounds.height,
    lowerBounds.depth,
  ];
  ratioPatterns.set(lowerBoundPattern.join("|"), lowerBoundPattern);

  let bestCandidate:
    | {
        box: IBox;
        packedItems: PackedItem[];
        score: IdealBoxScore;
      }
    | null = null;

  for (const ratios of ratioPatterns.values()) {
    const candidate = findIdealBoxForRatios(
      ratios,
      lowerBounds,
      upperBounds,
      normalizedSpacing,
      uniqueProducts
    );

    if (!candidate) {
      continue;
    }

    const score = getIdealBoxScore(candidate.box);
    if (isBetterIdealBoxScore(score, bestCandidate?.score ?? null)) {
      bestCandidate = {
        ...candidate,
        score,
      };
    }
  }

  if (!bestCandidate) {
    return null;
  }

  return {
    box: bestCandidate.box,
    items: bestCandidate.packedItems,
    dimensionalWeight: getDimensionalWeight(bestCandidate.box),
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
