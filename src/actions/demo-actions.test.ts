import { calculateDemoPacking } from "./demo-actions";
import { calculateIdealBoxPacking, calculatePackingPlanPacking } from "@/services/packing-plan-packing";

jest.mock("@/services/packing-plan-packing", () => ({
  calculatePackingPlanPacking: jest.fn(),
  calculateIdealBoxPacking: jest.fn(),
}));

const mockedCalculatePackingPlanPacking = jest.mocked(calculatePackingPlanPacking);
const mockedCalculateIdealBoxPacking = jest.mocked(calculateIdealBoxPacking);

describe("calculateDemoPacking", () => {
  beforeEach(() => {
    mockedCalculatePackingPlanPacking.mockReset();
    mockedCalculateIdealBoxPacking.mockReset();
  });

  it("returns recommended and ideal results for the ecommerce scenario with zero spacing override", async () => {
    mockedCalculatePackingPlanPacking.mockReturnValue([
      {
        box: {
          id: "demo-medium-mailer",
          name: "Medium Mailer",
          width: 10,
          height: 10,
          depth: 10,
          spacing: 0,
          maxWeight: null,
        },
        items: [],
        dimensionalWeight: 4,
      },
    ]);
    mockedCalculateIdealBoxPacking.mockReturnValue({
      box: {
        id: "ideal-box",
        name: "Ideal Box",
        width: 9,
        height: 9,
        depth: 9,
        spacing: 0,
        maxWeight: null,
      },
      items: [],
      dimensionalWeight: 3,
    });

    const result = await calculateDemoPacking({
      scenarioId: "ecommerce-order",
      quantities: {
        "running-shoes": 1,
        "folded-tshirt": 1,
        "pair-of-socks": 3,
      },
    });

    expect(result.error).toBeUndefined();
    expect(result.results).toHaveLength(1);
    expect(result.idealResult?.box.name).toBe("Ideal Box");
    expect(mockedCalculatePackingPlanPacking).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Small Mailer",
          spacing: 0,
        }),
      ]),
      expect.arrayContaining([
        expect.objectContaining({
          name: "Running shoes",
          quantity: 1,
          canStackOnTop: true,
          canBePlacedOnTop: true,
          orientation: "any",
        }),
        expect.objectContaining({
          name: "Pair of socks",
          quantity: 3,
        }),
      ]),
      0
    );
    expect(mockedCalculateIdealBoxPacking).toHaveBeenCalledWith(
      expect.any(Array),
      0
    );
  });

  it("reconstructs gift-kit items with spacing, non-stackable constraints, and notebook orientation", async () => {
    mockedCalculatePackingPlanPacking.mockReturnValue([]);
    mockedCalculateIdealBoxPacking.mockReturnValue({
      box: {
        id: "ideal-gift",
        name: "Ideal Gift Box",
        width: 8,
        height: 8,
        depth: 8,
        spacing: 0,
        maxWeight: null,
      },
      items: [],
      dimensionalWeight: 5,
    });

    await calculateDemoPacking({
      scenarioId: "gift-kit",
      quantities: {
        "ceramic-mug": 2,
        notebook: 1,
      },
    });

    expect(mockedCalculatePackingPlanPacking).toHaveBeenCalledWith(
      expect.any(Array),
      [
        expect.objectContaining({
          name: "Ceramic mug",
          quantity: 2,
          canStackOnTop: false,
          canBePlacedOnTop: false,
          orientation: "any",
        }),
        expect.objectContaining({
          name: "Notebook",
          quantity: 1,
          canStackOnTop: false,
          canBePlacedOnTop: false,
          orientation: "horizontal",
        }),
      ],
      expect.closeTo(0.635, 3)
    );
    expect(mockedCalculateIdealBoxPacking).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Notebook",
          orientation: "horizontal",
        }),
      ]),
      expect.closeTo(0.635, 3)
    );
  });

  it("rejects quantities below one", async () => {
    const result = await calculateDemoPacking({
      scenarioId: "ecommerce-order",
      quantities: {
        "running-shoes": 0,
      },
    });

    expect(result.error).toMatch(/>=1|at least 1|too small/i);
    expect(mockedCalculatePackingPlanPacking).not.toHaveBeenCalled();
  });

  it("rejects quantities above the per-item demo cap", async () => {
    const result = await calculateDemoPacking({
      scenarioId: "ecommerce-order",
      quantities: {
        "running-shoes": 51,
      },
    });

    expect(result.error).toMatch(/too big|at most|less than or equal|50/i);
    expect(mockedCalculatePackingPlanPacking).not.toHaveBeenCalled();
  });

  it("rejects requests above the total demo unit cap", async () => {
    const result = await calculateDemoPacking({
      scenarioId: "ecommerce-order",
      quantities: {
        "running-shoes": 50,
        "folded-tshirt": 50,
        "pair-of-socks": 21,
      },
    });

    expect(result).toEqual({
      results: [],
      idealResult: null,
      error: "Demo requests are limited to 120 total units.",
    });
    expect(mockedCalculatePackingPlanPacking).not.toHaveBeenCalled();
  });

  it("returns a validation error when all items were deleted", async () => {
    const result = await calculateDemoPacking({
      scenarioId: "gift-kit",
      quantities: {},
    });

    expect(result).toEqual({
      results: [],
      idealResult: null,
      error: "Select at least one item to continue.",
    });
  });

  it("ignores deleted items that are omitted from the quantity map", async () => {
    mockedCalculatePackingPlanPacking.mockReturnValue([]);
    mockedCalculateIdealBoxPacking.mockReturnValue({
      box: {
        id: "ideal-box",
        name: "Ideal Box",
        width: 1,
        height: 1,
        depth: 1,
        spacing: 0,
        maxWeight: null,
      },
      items: [],
      dimensionalWeight: 1,
    });

    await calculateDemoPacking({
      scenarioId: "gift-kit",
      quantities: {
        notebook: 1,
      },
    });

    const products = mockedCalculatePackingPlanPacking.mock.calls[0]?.[1] ?? [];
    expect(products).toHaveLength(1);
    expect(products[0]).toEqual(
      expect.objectContaining({
        name: "Notebook",
      })
    );
  });

  it("returns ideal-only fallback when available-box packing fails", async () => {
    mockedCalculatePackingPlanPacking.mockImplementation(() => {
      throw new Error("No available box");
    });
    mockedCalculateIdealBoxPacking.mockReturnValue({
      box: {
        id: "ideal-box",
        name: "Ideal Box",
        width: 1,
        height: 1,
        depth: 1,
        spacing: 0,
        maxWeight: null,
      },
      items: [],
      dimensionalWeight: 1,
    });

    const result = await calculateDemoPacking({
      scenarioId: "ecommerce-order",
      quantities: {
        "running-shoes": 1,
      },
    });

    expect(result.results).toEqual([]);
    expect(result.idealResult?.box.name).toBe("Ideal Box");
    expect(result.error).toBeUndefined();
  });
});
