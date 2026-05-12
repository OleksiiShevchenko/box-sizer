import { calculateCarrierDimensionalWeights, DIMENSIONAL_WEIGHT_DIVISORS } from "./dimensional-weight";

describe("calculateCarrierDimensionalWeights", () => {
  it("calculates imperial carrier estimates with configurable divisors", () => {
    const results = calculateCarrierDimensionalWeights({
      unitSystem: "in",
      actualWeight: 2,
      length: 20,
      width: 10,
      height: 10,
    });

    expect(DIMENSIONAL_WEIGHT_DIVISORS.UPS.imperialDivisor).toBe(139);
    expect(results).toEqual([
      {
        carrier: "UPS",
        actualWeight: 2,
        dimensionalWeight: 15,
        billableWeight: 15,
        divisor: 139,
        roundedDimensions: { length: 20, width: 10, height: 10 },
        appliesDimensionalWeight: true,
      },
      {
        carrier: "FedEx",
        actualWeight: 2,
        dimensionalWeight: 15,
        billableWeight: 15,
        divisor: 139,
        roundedDimensions: { length: 20, width: 10, height: 10 },
        appliesDimensionalWeight: true,
      },
      {
        carrier: "USPS",
        actualWeight: 2,
        dimensionalWeight: 13,
        billableWeight: 13,
        divisor: 166,
        roundedDimensions: { length: 20, width: 10, height: 10 },
        appliesDimensionalWeight: true,
      },
      {
        carrier: "DHL",
        actualWeight: 2,
        dimensionalWeight: 15,
        billableWeight: 15,
        divisor: 139,
        roundedDimensions: { length: 20, width: 10, height: 10 },
        appliesDimensionalWeight: true,
      },
    ]);
  });

  it("calculates metric estimates and keeps actual weight when it is higher", () => {
    const results = calculateCarrierDimensionalWeights({
      unitSystem: "cm",
      actualWeight: 20,
      length: 30,
      width: 20,
      height: 10,
    });

    expect(results.map((result) => result.billableWeight)).toEqual([20, 20, 20, 20]);
    expect(results.map((result) => result.dimensionalWeight)).toEqual([2, 2, 0, 2]);
    expect(results.find((result) => result.carrier === "USPS")).toMatchObject({
      appliesDimensionalWeight: false,
      divisor: 6000,
    });
  });

  it("rounds dimensions to the nearest whole unit before calculating", () => {
    const [ups] = calculateCarrierDimensionalWeights({
      unitSystem: "in",
      actualWeight: 1,
      length: 10.4,
      width: 10.5,
      height: 10.6,
    });

    expect(ups).toMatchObject({
      carrier: "UPS",
      dimensionalWeight: 9,
      roundedDimensions: { length: 10, width: 11, height: 11 },
    });
  });
});
