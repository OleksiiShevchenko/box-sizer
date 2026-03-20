import { describe, expect, it } from "@jest/globals";
import {
  convertBoxInputToStorage,
  convertDimensionalWeightToApi,
  convertShipmentItemInputToStorage,
  getMeasurementUnits,
  normalizeUnitSystem,
} from "@/lib/api-units";

describe("api unit helpers", () => {
  it("normalizes unknown unit systems to metric", () => {
    expect(normalizeUnitSystem(undefined)).toBe("cm");
    expect(normalizeUnitSystem("cm")).toBe("cm");
    expect(normalizeUnitSystem("in")).toBe("in");
    expect(normalizeUnitSystem("other")).toBe("cm");
  });

  it("converts packaging input from imperial to stored metric units", () => {
    const box = convertBoxInputToStorage(
      {
        name: "Mailer",
        width: 10,
        height: 5,
        depth: 2,
        spacing: 0.5,
        maxWeight: 16,
      },
      "in"
    );

    expect(box.width).toBeCloseTo(25.4);
    expect(box.height).toBeCloseTo(12.7);
    expect(box.depth).toBeCloseTo(5.08);
    expect(box.spacing).toBeCloseTo(1.27);
    expect(box.maxWeight).toBeCloseTo(453.592);
  });

  it("converts shipment item input from imperial to stored metric units", () => {
    const item = convertShipmentItemInputToStorage(
      {
        name: "Widget",
        width: 4,
        height: 3,
        depth: 2,
        weight: 8,
        canStackOnTop: false,
      },
      "in"
    );

    expect(item.width).toBeCloseTo(10.16);
    expect(item.height).toBeCloseTo(7.62);
    expect(item.depth).toBeCloseTo(5.08);
    expect(item.weight).toBeCloseTo(226.796);
    expect(item.canStackOnTop).toBe(false);
  });

  it("returns explicit response unit metadata", () => {
    expect(getMeasurementUnits("cm")).toEqual({
      unitSystem: "cm",
      dimension: "cm",
      weight: "g",
      dimensionalWeight: "kg",
    });

    expect(getMeasurementUnits("in")).toEqual({
      unitSystem: "in",
      dimension: "in",
      weight: "oz",
      dimensionalWeight: "lbs",
    });
  });

  it("converts dimensional weight to pounds for imperial responses", () => {
    expect(convertDimensionalWeightToApi(5, "cm")).toBe(5);
    expect(convertDimensionalWeightToApi(5, "in")).toBeCloseTo(11.0231);
  });
});
