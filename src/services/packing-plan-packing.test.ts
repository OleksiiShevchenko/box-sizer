import {
  applySpacingOverride,
  calculateIdealBoxPacking,
  calculatePackingPlanPacking,
} from "./packing-plan-packing";
import {
  SPACING_OVERRIDE_CASES,
  cloneBoxes,
  getQaBox,
} from "../../tests/fixtures/packwell-core";

describe("packing-plan-packing", () => {
  it("applies spacing override to every box", () => {
    const overridden = applySpacingOverride(cloneBoxes(), 1.5);

    expect(overridden.every((box) => box.spacing === 1.5)).toBe(true);
  });

  it.each(SPACING_OVERRIDE_CASES)(
    "$id: $description",
    ({ items, spacingOverride, expected }) => {
      const results = calculatePackingPlanPacking(
        cloneBoxes(),
        items,
        spacingOverride
      );

      expect(results.map((result) => result.box.name)).toEqual(expected.boxNames);
    }
  );

  it("returns an ideal-only result for large items with spacing override", () => {
    const ideal = calculateIdealBoxPacking(
      [
        {
          name: "HugeCube",
          width: 30,
          height: 30,
          depth: 30,
          weight: 500,
        },
      ],
      2
    );

    expect(ideal).not.toBeNull();
    expect(ideal?.box.spacing).toBe(2);
  });

  it("keeps non-stackable items away from the walls by at least one spacing unit", () => {
    const results = calculatePackingPlanPacking(
      [getQaBox("QA-05 Spaced 24x15x10")],
      [
        {
          name: "CompactNoStack",
          width: 6,
          height: 6,
          depth: 4,
          weight: 100,
          canStackOnTop: false,
          canBePlacedOnTop: true,
          orientation: "any",
        },
      ],
      null
    );
    const [item] = results[0]?.items ?? [];

    expect(item.height).toBeCloseTo(6, 5);
    expect(item.x).toBeGreaterThanOrEqual(2);
    expect(item.y).toBeGreaterThanOrEqual(2);
    expect(item.z).toBeGreaterThanOrEqual(2);
  });
});
