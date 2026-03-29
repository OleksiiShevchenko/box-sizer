import {
  calculatePackingPlanForUser,
  getPackingPlanForUser,
  savePackingPlanCalculation,
} from "@/lib/api-packing-plans";
import { PUT } from "./route";

jest.mock("next/server", () => {
  const actual = jest.requireActual("next/server");
  return {
    ...actual,
    after: jest.fn(),
  };
});

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/api-middleware", () => ({
  withApi:
    (handler: (request: Request, context: unknown) => Promise<Response>) =>
    (request: Request, context: Record<string, unknown> = {}) =>
      handler(request, {
        ...context,
        api: {
          userId: "user-1",
          appId: "app-1",
          tokenHash: "token-hash",
          unitSystem: "cm",
        },
      }),
}));

jest.mock("@/lib/api-response", () => ({
  apiJson: (data: unknown, status = 200, headers?: HeadersInit) =>
    new Response(JSON.stringify(data), {
      status,
      headers: {
        "Content-Type": "application/json",
        ...(headers ?? {}),
      },
    }),
}));

jest.mock("@/lib/api-packing-plans", () => ({
  calculatePackingPlanForUser: jest.fn(),
  getPackingPlanForUser: jest.fn(),
  savePackingPlanCalculation: jest.fn(),
}));

jest.mock("@/services/visualization-renderer", () => ({
  generateAndUploadVisualizations: jest.fn(),
}));

jest.mock("@/services/visualization-upload", () => ({
  getUploadedVisualizationUrls: jest.fn(),
  predictVisualizationUrls: jest.fn(),
}));

const calculatePackingPlanForUserMock = calculatePackingPlanForUser as jest.Mock;
const getPackingPlanForUserMock = getPackingPlanForUser as jest.Mock;
const savePackingPlanCalculationMock = savePackingPlanCalculation as jest.Mock;

describe("PUT /api/v1/packing-plans/[id]", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("returns an ideal-only response when saved boxes do not fit", async () => {
    getPackingPlanForUserMock
      .mockResolvedValueOnce({
        id: "packing-plan-db-id",
        publicId: "packing-plan-public-id",
        userId: "user-1",
        name: "Demo Packing Plan",
        spacingOverride: 0.25,
        dimensionalWeight: null,
        boxId: "box-1",
        box: {
          id: "box-1",
          publicId: "box-public-id",
          userId: "user-1",
          name: "Saved Box",
          width: 12,
          height: 12,
          depth: 12,
          spacing: 0,
          maxWeight: null,
          createdAt: new Date("2026-03-01T00:00:00.000Z"),
          updatedAt: new Date("2026-03-01T00:00:00.000Z"),
        },
        items: [],
        createdAt: new Date("2026-03-01T00:00:00.000Z"),
        updatedAt: new Date("2026-03-01T00:00:00.000Z"),
      })
      .mockResolvedValueOnce({
        id: "packing-plan-db-id",
        publicId: "packing-plan-public-id",
        userId: "user-1",
        name: "Demo Packing Plan",
        spacingOverride: 0.25,
        dimensionalWeight: null,
        boxId: null,
        box: null,
        items: [],
        createdAt: new Date("2026-03-01T00:00:00.000Z"),
        updatedAt: new Date("2026-03-01T00:00:00.000Z"),
      });

    calculatePackingPlanForUserMock.mockResolvedValue({
      results: [],
      idealResult: {
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
      },
    });

    const request = new Request("http://localhost/api/v1/packing-plans/packing-plan-public-id", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        unitSystem: "cm",
        name: "Demo Packing Plan",
        spacingOverride: 0.25,
        renderVisualization: false,
        items: [
          {
            name: "Item A",
            quantity: 3,
            width: 8,
            height: 4,
            depth: 6,
            weight: 250,
            canStackOnTop: true,
            canBePlacedOnTop: true,
            orientation: "any",
          },
          {
            name: "Item B",
            quantity: 1,
            width: 5,
            height: 5,
            depth: 5,
            weight: 120,
            canStackOnTop: false,
            canBePlacedOnTop: true,
            orientation: "vertical",
          },
        ],
      }),
    }) as Request & { nextUrl: URL };
    Object.defineProperty(request, "nextUrl", {
      value: new URL("http://localhost/api/v1/packing-plans/packing-plan-public-id"),
    });

    const response = await PUT(request, {
      params: Promise.resolve({ id: "packing-plan-public-id" }),
    });

    expect(response.status).toBe(200);
    expect(savePackingPlanCalculationMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: "packing-plan-db-id" }),
      expect.objectContaining({
        name: "Demo Packing Plan",
        spacingOverride: 0.25,
      }),
      []
    );

    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        packingPlan: expect.objectContaining({
          id: "packing-plan-public-id",
          box: null,
        }),
        result: expect.objectContaining({
          boxes: [],
          idealBox: expect.objectContaining({
            box: expect.objectContaining({
              id: "ideal",
              name: "Ideal Box",
            }),
          }),
        }),
      })
    );
  });
});
