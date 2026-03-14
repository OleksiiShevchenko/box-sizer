import {
  cmToInches,
  inchesToCm,
  calculateDimensionalWeight,
} from "./index";

describe("unit conversions", () => {
  it("converts cm to inches", () => {
    expect(cmToInches(2.54)).toBeCloseTo(1);
    expect(cmToInches(25.4)).toBeCloseTo(10);
  });

  it("converts inches to cm", () => {
    expect(inchesToCm(1)).toBeCloseTo(2.54);
    expect(inchesToCm(10)).toBeCloseTo(25.4);
  });
});

describe("calculateDimensionalWeight", () => {
  it("calculates dimensional weight in cm", () => {
    // 30 x 20 x 10 = 6000 / 5000 = 1.2 → ceil = 2
    expect(calculateDimensionalWeight(30, 20, 10, "cm")).toBe(2);
  });

  it("calculates dimensional weight in inches", () => {
    // 12 x 8 x 4 = 384 / 139 = 2.76 → ceil = 3
    expect(calculateDimensionalWeight(12, 8, 4, "in")).toBe(3);
  });
});
