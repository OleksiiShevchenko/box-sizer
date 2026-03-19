import {
  calculatePacking,
  checkFit,
  findIdealBox,
  getSmallestSuitableBox,
} from "./box-packer";
import type { IBox, IProduct } from "@/types";

const smallBox: IBox = {
  id: "1",
  name: "Small Box",
  width: 20,
  height: 15,
  depth: 10,
};

const mediumBox: IBox = {
  id: "2",
  name: "Medium Box",
  width: 30,
  height: 25,
  depth: 20,
};

const largeBox: IBox = {
  id: "3",
  name: "Large Box",
  width: 50,
  height: 40,
  depth: 30,
};

const boxes = [smallBox, mediumBox, largeBox];

describe("checkFit", () => {
  it("returns true when a single item fits in a box", () => {
    const products: IProduct[] = [
      { name: "Item1", width: 10, height: 10, depth: 5 },
    ];
    const result = checkFit(smallBox, products);
    expect(result.fits).toBe(true);
    expect(result.packedItems.length).toBe(1);
  });

  it("returns false when an item is too large", () => {
    const products: IProduct[] = [
      { name: "BigItem", width: 100, height: 100, depth: 100 },
    ];
    const result = checkFit(smallBox, products);
    expect(result.fits).toBe(false);
  });

  it("handles multiple items that fit", () => {
    const products: IProduct[] = [
      { name: "A", width: 10, height: 10, depth: 5 },
      { name: "B", width: 10, height: 5, depth: 5 },
    ];
    const result = checkFit(smallBox, products);
    expect(result.fits).toBe(true);
    expect(result.packedItems.length).toBe(2);
  });

  it("returns packed items in real-world dimensions and positions", () => {
    const products: IProduct[] = [
      { name: "Item1", width: 10, height: 10, depth: 5 },
    ];
    const result = checkFit(smallBox, products);
    const dimensions = [
      result.packedItems[0].width,
      result.packedItems[0].height,
      result.packedItems[0].depth,
    ].sort((a, b) => a - b);

    expect(result.packedItems[0]).toMatchObject({
      x: 0,
      y: 0,
      z: 0,
    });
    expect(dimensions).toEqual([5, 10, 10]);
  });

  it("keeps adjacent-item gaps equal to the configured spacing", () => {
    const spacedBox: IBox = {
      id: "4",
      name: "Spaced Box",
      width: 24,
      height: 15,
      depth: 10,
      spacing: 2,
    };
    const products: IProduct[] = [
      { name: "Left", width: 9, height: 11, depth: 6 },
      { name: "Right", width: 9, height: 11, depth: 6 },
    ];

    const result = checkFit(spacedBox, products);

    expect(result.fits).toBe(true);
    expect(result.packedItems).toHaveLength(2);

    const [first, second] = [...result.packedItems].sort((a, b) => a.x - b.x);
    expect(second.x - (first.x + first.width)).toBeCloseTo(2, 5);
  });

  it("keeps items at least one spacing unit away from every box wall", () => {
    const spacedBox: IBox = {
      id: "5",
      name: "Wall Gap Box",
      width: 20,
      height: 15,
      depth: 10,
      spacing: 2,
    };
    const products: IProduct[] = [
      { name: "Solo", width: 10, height: 8, depth: 5 },
    ];

    const result = checkFit(spacedBox, products);
    const [item] = result.packedItems;

    expect(result.fits).toBe(true);
    expect(item.x).toBeGreaterThanOrEqual(2);
    expect(item.y).toBeGreaterThanOrEqual(2);
    expect(item.z).toBeGreaterThanOrEqual(2);
    expect(spacedBox.width - (item.x + item.width)).toBeGreaterThanOrEqual(2);
    expect(spacedBox.height - (item.y + item.height)).toBeGreaterThanOrEqual(2);
    expect(spacedBox.depth - (item.z + item.depth)).toBeGreaterThanOrEqual(2);
  });

  it("keeps spacing at zero backward compatible", () => {
    const zeroSpacingBox: IBox = {
      ...smallBox,
      spacing: 0,
    };
    const products: IProduct[] = [
      { name: "Item1", width: 10, height: 10, depth: 5 },
    ];

    const result = checkFit(zeroSpacingBox, products);
    const dimensions = [
      result.packedItems[0].width,
      result.packedItems[0].height,
      result.packedItems[0].depth,
    ].sort((a, b) => a - b);

    expect(result.fits).toBe(true);
    expect(result.packedItems[0]).toMatchObject({
      x: 0,
      y: 0,
      z: 0,
    });
    expect(dimensions).toEqual([5, 10, 10]);
  });
});

describe("getSmallestSuitableBox", () => {
  it("returns the smallest box that fits the items", () => {
    const products: IProduct[] = [
      { name: "Item1", width: 5, height: 5, depth: 5 },
    ];
    const result = getSmallestSuitableBox(boxes, products);
    expect(result).not.toBeNull();
    expect(result!.box.name).toBe("Small Box");
  });

  it("returns a larger box when items don't fit in small", () => {
    const products: IProduct[] = [
      { name: "Item1", width: 25, height: 20, depth: 15 },
    ];
    const result = getSmallestSuitableBox(boxes, products);
    expect(result).not.toBeNull();
    expect(result!.box.name).toBe("Medium Box");
  });

  it("returns null when no box fits", () => {
    const products: IProduct[] = [
      { name: "Huge", width: 200, height: 200, depth: 200 },
    ];
    const result = getSmallestSuitableBox(boxes, products);
    expect(result).toBeNull();
  });
});

describe("calculatePacking", () => {
  it("returns empty array for empty products", () => {
    const results = calculatePacking(boxes, []);
    expect(results).toEqual([]);
  });

  it("throws when no boxes available", () => {
    expect(() =>
      calculatePacking([], [{ name: "A", width: 5, height: 5, depth: 5 }])
    ).toThrow("No boxes available");
  });

  it("packs a single item into the smallest box", () => {
    const products: IProduct[] = [
      { name: "Item1", width: 5, height: 5, depth: 5 },
    ];
    const results = calculatePacking(boxes, products);
    expect(results.length).toBe(1);
    expect(results[0].box.name).toBe("Small Box");
    expect(results[0].items.length).toBe(1);
    expect(results[0].dimensionalWeight).toBeGreaterThan(0);
  });

  it("packs multiple items into one box when possible", () => {
    const products: IProduct[] = [
      { name: "A", width: 10, height: 10, depth: 5 },
      { name: "B", width: 10, height: 5, depth: 5 },
    ];
    const results = calculatePacking(boxes, products);
    expect(results.length).toBe(1);
  });

  it("uses multiple boxes when items don't fit in one", () => {
    const products: IProduct[] = [
      { name: "Big1", width: 45, height: 35, depth: 25 },
      { name: "Big2", width: 45, height: 35, depth: 25 },
    ];
    const results = calculatePacking(boxes, products);
    expect(results.length).toBe(2);
  });

  it("throws when items cannot fit in any box", () => {
    const products: IProduct[] = [
      { name: "Impossible", width: 200, height: 200, depth: 200 },
    ];
    expect(() => calculatePacking(boxes, products)).toThrow();
  });

  it("throws user-facing item names when spacing prevents a fit", () => {
    const spacedBox: IBox = {
      id: "6",
      name: "Spacing QA Box",
      width: 24,
      height: 15,
      depth: 10,
      spacing: 2,
    };
    const products: IProduct[] = [
      { name: "Speaker", width: 20, height: 10, depth: 8 },
      { name: "Speaker", width: 20, height: 10, depth: 8 },
    ];

    expect(() => calculatePacking([spacedBox], products)).toThrow(
      "Cannot fit item(s) with the current box spacing: Speaker x2"
    );
  });

  it("includes dimensional weight in results", () => {
    const products: IProduct[] = [
      { name: "Item", width: 10, height: 10, depth: 5 },
    ];
    const results = calculatePacking(boxes, products);
    expect(results[0].dimensionalWeight).toBe(
      Math.ceil((smallBox.width * smallBox.height * smallBox.depth) / 5000)
    );
  });

  it("handles products with weight", () => {
    const products: IProduct[] = [
      { name: "Heavy", width: 10, height: 10, depth: 5, weight: 500 },
    ];
    const results = calculatePacking(boxes, products);
    expect(results.length).toBe(1);
  });
});

describe("findIdealBox", () => {
  it("returns null for empty products", () => {
    expect(findIdealBox([])).toBeNull();
  });

  it("returns an ideal box matching a single item when spacing is zero", () => {
    const result = findIdealBox([{ name: "Single", width: 12, height: 8, depth: 6 }]);

    expect(result).not.toBeNull();
    expect(result?.box.id).toBe("ideal");
    expect(result?.box.name).toBe("Ideal Box");
    expect(result?.box.width).toBeCloseTo(12, 1);
    expect(result?.box.height).toBeCloseTo(8, 1);
    expect(result?.box.depth).toBeCloseTo(6, 1);
    expect(result?.box.spacing).toBe(0);
    expect(result?.items).toHaveLength(1);
  });

  it("returns a box that fits multiple items with less volume than packing them separately", () => {
    const products: IProduct[] = [
      { name: "A", width: 12, height: 10, depth: 8 },
      { name: "B", width: 12, height: 10, depth: 8 },
    ];
    const separatePackingVolume = products
      .map((product) => getSmallestSuitableBox(boxes, [product])!.box)
      .reduce((sum, box) => sum + box.width * box.height * box.depth, 0);
    const result = findIdealBox(products);

    expect(result).not.toBeNull();
    expect(checkFit(result!.box, products).fits).toBe(true);
    expect(result!.items).toHaveLength(2);
    expect(result!.box.width * result!.box.height * result!.box.depth).toBeLessThan(
      separatePackingVolume
    );
  });

  it("respects spacing when calculating the ideal box", () => {
    const result = findIdealBox(
      [{ name: "Single", width: 12, height: 8, depth: 6 }],
      2
    );

    expect(result).not.toBeNull();
    expect(result?.box.spacing).toBe(2);
    expect(result?.box.width).toBeCloseTo(16, 1);
    expect(result?.box.height).toBeCloseTo(12, 1);
    expect(result?.box.depth).toBeCloseTo(10, 1);
  });

  it("returns a synthetic ideal box id", () => {
    const result = findIdealBox([{ name: "Single", width: 12, height: 8, depth: 6 }]);

    expect(result?.box.id).toBe("ideal");
  });
});

describe("stacking constraints", () => {
  it("prevents items from being placed above a canStackOnTop=false item", () => {
    const box: IBox = { id: "s1", name: "Stack Box", width: 30, height: 30, depth: 30 };
    const products: IProduct[] = [
      { name: "Fragile", width: 12, height: 10, depth: 12, canStackOnTop: false },
      { name: "Light", width: 10, height: 5, depth: 10 },
    ];
    const result = checkFit(box, products);
    expect(result.fits).toBe(true);

    const fragile = result.packedItems.find((p) => p.name.startsWith("Fragile"))!;
    const light = result.packedItems.find((p) => p.name.startsWith("Light"))!;

    // Original height is restored in output
    expect(fragile.height).toBeCloseTo(10, 0);

    // Light item must not be above fragile item
    const overlapX = light.x < fragile.x + fragile.width && light.x + light.width > fragile.x;
    const overlapZ = light.z < fragile.z + fragile.depth && light.z + light.depth > fragile.z;
    if (overlapX && overlapZ) {
      expect(light.y).toBeCloseTo(fragile.y, 0);
    }
  });

  it("places canBePlacedOnTop=false items at ground level", () => {
    // Floor-only item uses height inflation, so both items need side-by-side space
    const box: IBox = { id: "s2", name: "Wide Box", width: 30, height: 30, depth: 30 };
    const products: IProduct[] = [
      { name: "Any", width: 12, height: 8, depth: 12 },
      { name: "Floor", width: 12, height: 8, depth: 12, canBePlacedOnTop: false },
    ];
    const result = checkFit(box, products);
    expect(result.fits).toBe(true);

    const floorItem = result.packedItems.find((p) => p.name.startsWith("Floor"))!;
    expect(floorItem.y).toBe(0);
    // Original height must be restored in output
    expect(floorItem.height).toBeCloseTo(8, 0);
  });

  it("places smaller canBePlacedOnTop=false items at ground level despite BP3D volume sort", () => {
    // The floor-only item is SMALLER than the other item.
    // BP3D sorts by volume descending, placing the bigger item first.
    // Height inflation guarantees the floor item fills the full column
    // and must be placed at y=0.
    const box: IBox = { id: "s2c", name: "Wide Box", width: 30, height: 30, depth: 30 };
    const products: IProduct[] = [
      { name: "Big", width: 14, height: 18, depth: 14 },
      { name: "SmallFloor", width: 10, height: 10, depth: 10, canBePlacedOnTop: false },
    ];
    const result = checkFit(box, products);
    expect(result.fits).toBe(true);

    const floorItem = result.packedItems.find((p) => p.name.startsWith("SmallFloor"))!;
    expect(floorItem.y).toBe(0);
    expect(floorItem.height).toBeCloseTo(10, 0);
  });

  it("canBePlacedOnTop=false prevents stacking above (height inflation side effect)", () => {
    // canBePlacedOnTop=false uses height inflation to guarantee floor placement.
    // This also prevents items from being stacked above, even if canStackOnTop=true.
    // This is a known trade-off: BP3D's internal volume sort makes insertion-order
    // enforcement unreliable, so height inflation is the only reliable mechanism.
    const box: IBox = { id: "s2b", name: "Stack Test", width: 15, height: 25, depth: 15 };
    const products: IProduct[] = [
      { name: "FloorOnly", width: 12, height: 12, depth: 12, canBePlacedOnTop: false, canStackOnTop: true },
      { name: "OnTop", width: 12, height: 12, depth: 12 },
    ];
    const result = checkFit(box, products);
    // FloorOnly fills the full column height, so OnTop can't stack above it
    // and the box is too narrow for side-by-side placement
    expect(result.fits).toBe(false);
  });

  it("reduces capacity when canStackOnTop is disabled", () => {
    const box: IBox = { id: "s3", name: "Tight", width: 15, height: 25, depth: 15 };
    const products: IProduct[] = [
      { name: "A", width: 12, height: 12, depth: 12, canStackOnTop: false },
      { name: "B", width: 12, height: 12, depth: 12 },
    ];
    const result = checkFit(box, products);
    expect(result.fits).toBe(false);
  });

  it("is backward compatible when stacking fields are omitted", () => {
    const products: IProduct[] = [
      { name: "Normal", width: 10, height: 10, depth: 5 },
    ];
    const result = checkFit(smallBox, products);
    expect(result.fits).toBe(true);
  });

  it("handles both stacking flags false", () => {
    const box: IBox = { id: "s4", name: "Box", width: 30, height: 30, depth: 30 };
    const products: IProduct[] = [
      { name: "Both", width: 10, height: 10, depth: 10, canStackOnTop: false, canBePlacedOnTop: false },
    ];
    const result = checkFit(box, products);
    expect(result.fits).toBe(true);

    const item = result.packedItems[0];
    expect(item.height).toBeCloseTo(10, 0);
    expect(item.y).toBe(0);
  });

  it("works with stacking and spacing combined", () => {
    const box: IBox = { id: "s5", name: "Spaced", width: 30, height: 30, depth: 30, spacing: 2 };
    const products: IProduct[] = [
      { name: "NoStack", width: 10, height: 10, depth: 10, canStackOnTop: false },
    ];
    const result = checkFit(box, products);
    expect(result.fits).toBe(true);

    const item = result.packedItems[0];
    expect(item.height).toBeCloseTo(10, 0);
    expect(item.y).toBeGreaterThanOrEqual(2);
  });

  it("keeps inflated height on Y axis even with non-cubic items", () => {
    // Regression: BP3D must not rotate the inflated height onto X or Z
    const box: IBox = { id: "s6", name: "Rotation Test", width: 30, height: 30, depth: 30 };
    const products: IProduct[] = [
      { name: "Rect", width: 8, height: 5, depth: 12, canStackOnTop: false },
      { name: "Small", width: 6, height: 6, depth: 6 },
    ];
    const result = checkFit(box, products);
    expect(result.fits).toBe(true);

    const rect = result.packedItems.find((p) => p.name.startsWith("Rect"))!;
    // The original height (5) must be restored, not the inflated box height
    expect(rect.height).toBeCloseTo(5, 0);
    // The inflated dimension must have been on Y (height axis), so small
    // item should NOT overlap the rect's footprint vertically
    const small = result.packedItems.find((p) => p.name.startsWith("Small"))!;
    const overlapX = small.x < rect.x + rect.width && small.x + small.width > rect.x;
    const overlapZ = small.z < rect.z + rect.depth && small.z + small.depth > rect.z;
    if (overlapX && overlapZ) {
      // If they share the same footprint, small must be at same Y (floor level)
      expect(small.y).toBeCloseTo(rect.y, 0);
    }
  });
});

describe("orientation constraints", () => {
  it("places horizontal-only items with smallest dimension as height (Y axis)", () => {
    const box: IBox = { id: "o1", name: "Box", width: 30, height: 30, depth: 30 };
    const products: IProduct[] = [
      { name: "Flat", width: 20, height: 15, depth: 5, orientation: "horizontal" },
    ];
    const result = checkFit(box, products);
    expect(result.fits).toBe(true);

    const item = result.packedItems[0];
    // Height (Y axis) must be the smallest original dimension (5)
    expect(item.height).toBeCloseTo(5, 0);
    // Width and depth should be the remaining two dimensions
    const horizontalDims = [item.width, item.depth].sort((a, b) => a - b);
    expect(horizontalDims[0]).toBeCloseTo(15, 0);
    expect(horizontalDims[1]).toBeCloseTo(20, 0);
  });

  it("places vertical-only items with largest dimension as height (Y axis)", () => {
    const box: IBox = { id: "o2", name: "Box", width: 30, height: 30, depth: 30 };
    const products: IProduct[] = [
      { name: "Tall", width: 5, height: 20, depth: 8, orientation: "vertical" },
    ];
    const result = checkFit(box, products);
    expect(result.fits).toBe(true);

    const item = result.packedItems[0];
    // Height (Y axis) must be the largest original dimension (20)
    expect(item.height).toBeCloseTo(20, 0);
    // Width and depth should be the remaining two
    const horizontalDims = [item.width, item.depth].sort((a, b) => a - b);
    expect(horizontalDims[0]).toBeCloseTo(5, 0);
    expect(horizontalDims[1]).toBeCloseTo(8, 0);
  });

  it("allows free rotation when orientation is any", () => {
    const products: IProduct[] = [
      { name: "Free", width: 10, height: 10, depth: 5, orientation: "any" },
    ];
    const result = checkFit(smallBox, products);
    expect(result.fits).toBe(true);
  });

  it("works with orientation and spacing combined", () => {
    const box: IBox = { id: "o3", name: "Spaced", width: 30, height: 30, depth: 30, spacing: 2 };
    const products: IProduct[] = [
      { name: "Flat", width: 20, height: 15, depth: 5, orientation: "horizontal" },
    ];
    const result = checkFit(box, products);
    expect(result.fits).toBe(true);

    const item = result.packedItems[0];
    // Height must still be the smallest dimension
    expect(item.height).toBeCloseTo(5, 0);
    expect(item.y).toBeGreaterThanOrEqual(2);
  });

  it("enforces orientation even when rotation would improve packing", () => {
    // A tall vertical item in a short-but-wide box should NOT fit
    // because horizontal rotation is forbidden
    const wideBox: IBox = { id: "o4", name: "Wide", width: 50, height: 10, depth: 50 };
    const products: IProduct[] = [
      { name: "Tall", width: 5, height: 25, depth: 5, orientation: "vertical" },
    ];
    const result = checkFit(wideBox, products);
    // Item is 25cm tall but box is only 10cm high — must not fit
    expect(result.fits).toBe(false);
  });
});

describe("combined constraints", () => {
  it("handles canStackOnTop=false with horizontal orientation", () => {
    const box: IBox = { id: "c1", name: "Box", width: 40, height: 30, depth: 40 };
    const products: IProduct[] = [
      { name: "FlatFragile", width: 20, height: 15, depth: 5, canStackOnTop: false, orientation: "horizontal" },
      { name: "Small", width: 8, height: 8, depth: 8 },
    ];
    const result = checkFit(box, products);
    expect(result.fits).toBe(true);

    const flatFragile = result.packedItems.find((p) => p.name.startsWith("FlatFragile"))!;
    // Height must be smallest dim (5) — orientation enforced
    expect(flatFragile.height).toBeCloseTo(5, 0);
  });

  it("handles canStackOnTop=false with vertical orientation", () => {
    const box: IBox = { id: "c2", name: "Box", width: 40, height: 30, depth: 40 };
    const products: IProduct[] = [
      { name: "TallFragile", width: 5, height: 20, depth: 8, canStackOnTop: false, orientation: "vertical" },
      { name: "Small", width: 8, height: 8, depth: 8 },
    ];
    const result = checkFit(box, products);
    expect(result.fits).toBe(true);

    const tallFragile = result.packedItems.find((p) => p.name.startsWith("TallFragile"))!;
    // Height must be largest dim (20) — restored from inflation
    expect(tallFragile.height).toBeCloseTo(20, 0);
  });

  it("handles all constraints with spacing", () => {
    const box: IBox = { id: "c3", name: "Box", width: 40, height: 30, depth: 40, spacing: 1 };
    const products: IProduct[] = [
      {
        name: "Complex",
        width: 15,
        height: 10,
        depth: 5,
        canStackOnTop: false,
        canBePlacedOnTop: false,
        orientation: "horizontal",
      },
    ];
    const result = checkFit(box, products);
    expect(result.fits).toBe(true);

    const item = result.packedItems[0];
    // Horizontal: height = min(15,10,5) = 5
    expect(item.height).toBeCloseTo(5, 0);
    expect(item.y).toBeGreaterThanOrEqual(1);
  });

  it("canBePlacedOnTop=false items can coexist side-by-side with other items", () => {
    // Floor-only items fill the full height column but other items can go beside them
    const box: IBox = { id: "c4", name: "Box", width: 30, height: 30, depth: 30 };
    const products: IProduct[] = [
      { name: "Floor", width: 12, height: 12, depth: 12, canBePlacedOnTop: false, canStackOnTop: true },
      { name: "Other", width: 12, height: 12, depth: 12 },
    ];
    const result = checkFit(box, products);
    expect(result.fits).toBe(true);
    expect(result.packedItems).toHaveLength(2);

    const floor = result.packedItems.find((p) => p.name.startsWith("Floor"))!;
    // Floor item must be at ground level with original height restored
    expect(floor.y).toBe(0);
    expect(floor.height).toBeCloseTo(12, 0);
  });
});
