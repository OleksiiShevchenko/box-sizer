import { calculatePacking, checkFit, getSmallestSuitableBox } from "./box-packer";
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
