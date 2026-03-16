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
