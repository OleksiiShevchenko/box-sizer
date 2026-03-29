import { prisma } from "@/lib/prisma";
import {
  calculateIdealBoxPacking,
  calculatePackingPlanPacking,
} from "@/services/packing-plan-packing";
import { calculatePackingPlanForUser } from "./api-packing-plans";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    box: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock("@/services/packing-plan-packing", () => ({
  calculatePackingPlanPacking: jest.fn(),
  calculateIdealBoxPacking: jest.fn(),
}));

const prismaMock = prisma as jest.Mocked<typeof prisma>;
const calculatePackingPlanPackingMock = calculatePackingPlanPacking as jest.MockedFunction<
  typeof calculatePackingPlanPacking
>;
const calculateIdealBoxPackingMock = calculateIdealBoxPacking as jest.MockedFunction<
  typeof calculateIdealBoxPacking
>;

describe("calculatePackingPlanForUser", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("falls back to an ideal box when saved boxes do not fit and ideal packing is requested", async () => {
    prismaMock.box.findMany.mockResolvedValue([
      {
        id: "box-1",
        publicId: "box-public-1",
        userId: "user-1",
        name: "Existing Box",
        width: 10,
        height: 10,
        depth: 10,
        spacing: 0,
        maxWeight: null,
        createdAt: new Date("2026-03-01T00:00:00.000Z"),
        updatedAt: new Date("2026-03-01T00:00:00.000Z"),
      },
    ]);

    calculatePackingPlanPackingMock.mockImplementation(() => {
      throw new Error("Cannot fit item(s) with the current box spacing: Item A x3, Item B");
    });
    calculateIdealBoxPackingMock.mockReturnValue({
      box: {
        id: "ideal",
        name: "Ideal Box",
        width: 20,
        height: 10,
        depth: 10,
        spacing: 0.25,
      },
      items: [],
      dimensionalWeight: 1,
    });

    await expect(
      calculatePackingPlanForUser("user-1", {
        items: [{ name: "Item A", quantity: 3, width: 8, height: 4, depth: 6 }],
        spacingOverride: 0.25,
        includeIdealBox: true,
      })
    ).resolves.toEqual({
      results: [],
      idealResult: expect.objectContaining({
        box: expect.objectContaining({ id: "ideal", name: "Ideal Box" }),
      }),
    });
  });

  it("still throws when saved boxes do not fit and ideal packing is not requested", async () => {
    prismaMock.box.findMany.mockResolvedValue([
      {
        id: "box-1",
        publicId: "box-public-1",
        userId: "user-1",
        name: "Existing Box",
        width: 10,
        height: 10,
        depth: 10,
        spacing: 0,
        maxWeight: null,
        createdAt: new Date("2026-03-01T00:00:00.000Z"),
        updatedAt: new Date("2026-03-01T00:00:00.000Z"),
      },
    ]);

    calculatePackingPlanPackingMock.mockImplementation(() => {
      throw new Error("Cannot fit item(s) with the current box spacing: Item A x3, Item B");
    });
    calculateIdealBoxPackingMock.mockReturnValue({
      box: {
        id: "ideal",
        name: "Ideal Box",
        width: 20,
        height: 10,
        depth: 10,
        spacing: 0.25,
      },
      items: [],
      dimensionalWeight: 1,
    });

    await expect(
      calculatePackingPlanForUser("user-1", {
        items: [{ name: "Item A", quantity: 3, width: 8, height: 4, depth: 6 }],
        spacingOverride: 0.25,
        includeIdealBox: false,
      })
    ).rejects.toThrow("Cannot fit item(s) with the current box spacing: Item A x3, Item B");
  });
});
