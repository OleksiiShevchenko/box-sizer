import { calculatePacking, checkFit, findIdealBox } from "./box-packer";
import {
  CORE_SELECTION_CASES,
  PACKWELL_ITEMS,
  cloneBoxes,
  createUnlimitedWeightBox,
  getQaBox,
} from "../../tests/fixtures/packwell-core";
import type { PackingResult } from "@/types";

function getPackedItems(results: PackingResult[]) {
  return results.flatMap((result) => result.items);
}

describe("Packwell core selection matrix", () => {
  it.each(CORE_SELECTION_CASES)("$id: $description", ({ items, expected }) => {
    const results = calculatePacking(cloneBoxes(), items);

    expect(results.map((result) => result.box.name)).toEqual(expected.boxNames);

    const packedItems = getPackedItems(results);

    for (const itemName of expected.floorItemNames ?? []) {
      expect(
        packedItems.find((item) => item.name.startsWith(itemName))?.y
      ).toBe(0);
    }

    for (const [itemName, height] of Object.entries(
      expected.preservedHeights ?? {}
    )) {
      expect(
        packedItems.find((item) => item.name.startsWith(itemName))?.height
      ).toBeCloseTo(height, 5);
    }
  });

  it("returns an ideal custom box when saved boxes do not fit", () => {
    const ideal = findIdealBox([
      {
        name: "HugeCube",
        width: 34,
        height: 34,
        depth: 34,
        weight: 500,
      },
    ]);

    expect(ideal).not.toBeNull();
    expect(ideal?.box.id).toBe("ideal");
    expect(ideal?.box.name).toBe("Ideal Box");
  });

  it("normalizes quantity and expanded items to the same result", () => {
    const quantityResults = calculatePacking(cloneBoxes(), [
      PACKWELL_ITEMS.cube10({ quantity: 3 }),
    ]);
    const expandedResults = calculatePacking(cloneBoxes(), [
      PACKWELL_ITEMS.cube10({ name: "Cube10-A" }),
      PACKWELL_ITEMS.cube10({ name: "Cube10-B" }),
      PACKWELL_ITEMS.cube10({ name: "Cube10-C" }),
    ]);

    expect(quantityResults.map((result) => result.box.name)).toEqual(
      expandedResults.map((result) => result.box.name)
    );
    expect(getPackedItems(quantityResults)).toHaveLength(getPackedItems(expandedResults).length);
  });

  it("uses user-facing names when spacing prevents a fit", () => {
    const spacedOnly = [getQaBox("QA-05 Spaced 24x15x10")];

    expect(() =>
      calculatePacking(spacedOnly, [
        { name: "Speaker", width: 20, height: 10, depth: 8 },
        { name: "Speaker", width: 20, height: 10, depth: 8 },
      ])
    ).toThrow("Cannot fit item(s) with the current box spacing: Speaker x2");
  });

  it("supports unlimited-weight boxes with synthetic fixtures", () => {
    const unlimitedBox = createUnlimitedWeightBox({
      width: 12,
      height: 12,
      depth: 12,
    });

    const results = calculatePacking([unlimitedBox], [PACKWELL_ITEMS.denseCube()]);

    expect(results).toHaveLength(1);
    expect(results[0]?.box.name).toBe("Synthetic Unlimited");
  });

  it("fails a specific box when combined item weight exceeds its limit", () => {
    const limitedBox = getQaBox("QA-06 Limited 22x22x22");
    const lowWeightPair = [
      { name: "WeightA", width: 10, height: 10, depth: 10, weight: 300 },
      { name: "WeightB", width: 10, height: 10, depth: 10, weight: 300 },
    ];
    const highWeightPair = [
      { name: "WeightA", width: 10, height: 10, depth: 10, weight: 450 },
      { name: "WeightB", width: 10, height: 10, depth: 10, weight: 450 },
    ];

    expect(checkFit(limitedBox, lowWeightPair).fits).toBe(true);
    expect(checkFit(limitedBox, highWeightPair).fits).toBe(false);
  });

  it("is deterministic across repeated runs", () => {
    const snapshots = Array.from({ length: 3 }, () =>
      calculatePacking(cloneBoxes(), [
        PACKWELL_ITEMS.base12({ canStackOnTop: false }),
        PACKWELL_ITEMS.top10(),
      ]).map((result) => ({
        box: result.box.name,
        items: result.items.map((item) => ({
          name: item.name,
          x: item.x,
          y: item.y,
          z: item.z,
          width: item.width,
          height: item.height,
          depth: item.depth,
        })),
      }))
    );

    expect(snapshots[1]).toEqual(snapshots[0]);
    expect(snapshots[2]).toEqual(snapshots[0]);
  });
});
