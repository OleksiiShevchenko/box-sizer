import { calculatePackingPlanForUser, createPackingPlanCalculationForUser } from "@/lib/api-packing-plans";
import { inchesToCm, ozToGrams } from "@/types";
import { POST } from "./route";

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
  createPackingPlanCalculationForUser: jest.fn(),
}));

jest.mock("@/services/visualization-renderer", () => ({
  generateAndUploadVisualizations: jest.fn(),
}));

jest.mock("@/services/visualization-upload", () => ({
  predictVisualizationUrls: jest.fn(),
}));

const calculatePackingPlanForUserMock = calculatePackingPlanForUser as jest.Mock;
const createPackingPlanCalculationForUserMock = createPackingPlanCalculationForUser as jest.Mock;

describe("POST /api/v1/packing-plans/calculate", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("creates a packing plan record and returns its public id", async () => {
    calculatePackingPlanForUserMock.mockResolvedValue({
      results: [
        {
          box: {
            id: "box-1",
            publicId: "box-public-1",
            name: "Mailer",
            width: 10,
            height: 8,
            depth: 6,
            spacing: 0,
            maxWeight: 1000,
          },
          items: [],
          dimensionalWeight: 2,
        },
      ],
      idealResult: null,
    });
    createPackingPlanCalculationForUserMock.mockResolvedValue({
      id: "packingPlan-db-id",
      publicId: "packingPlan-public-id",
    });

    const request = new Request("http://localhost/api/v1/packing-plans/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        unitSystem: "cm",
        renderVisualization: false,
        includeIdealBox: false,
        items: [
          {
            name: "Item A",
            quantity: 1,
            width: 10,
            height: 8,
            depth: 6,
            weight: 250,
            canStackOnTop: true,
            canBePlacedOnTop: true,
            orientation: "any",
          },
        ],
      }),
    }) as Request & { nextUrl: URL };
    Object.defineProperty(request, "nextUrl", {
      value: new URL("http://localhost/api/v1/packing-plans/calculate"),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(createPackingPlanCalculationForUserMock).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        name: "Untitled Packing Plan",
        spacingOverride: null,
        items: [
          expect.objectContaining({
            name: "Item A",
            width: 10,
            height: 8,
            depth: 6,
            weight: 250,
          }),
        ],
      }),
      expect.any(Array)
    );

    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        id: "packingPlan-public-id",
      })
    );
  });

  it("normalizes imperial input before invoking the packing calculation", async () => {
    calculatePackingPlanForUserMock.mockResolvedValue({
      results: [],
      idealResult: {
        box: {
          id: "ideal",
          name: "Ideal Box",
          width: inchesToCm(16),
          height: inchesToCm(6),
          depth: inchesToCm(16),
          spacing: 0,
          maxWeight: null,
        },
        items: [],
        dimensionalWeight: 3,
      },
    });
    createPackingPlanCalculationForUserMock.mockResolvedValue({
      id: "packingPlan-db-id",
      publicId: "packingPlan-public-id",
    });

    const request = new Request("http://localhost/api/v1/packing-plans/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        unitSystem: "in",
        spacingOverride: 0.5,
        renderVisualization: false,
        includeIdealBox: true,
        items: [
          {
            name: "ImperialCube",
            quantity: 2,
            width: 4,
            height: 4,
            depth: 4,
            weight: 8,
            canStackOnTop: false,
            canBePlacedOnTop: true,
            orientation: "horizontal",
          },
        ],
      }),
    }) as Request & { nextUrl: URL };
    Object.defineProperty(request, "nextUrl", {
      value: new URL("http://localhost/api/v1/packing-plans/calculate"),
    });

    const response = await POST(request);

    expect(calculatePackingPlanForUserMock).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        spacingOverride: inchesToCm(0.5),
        includeIdealBox: true,
        items: [
          expect.objectContaining({
            name: "ImperialCube",
            quantity: 2,
            width: inchesToCm(4),
            height: inchesToCm(4),
            depth: inchesToCm(4),
            weight: ozToGrams(8),
            canStackOnTop: false,
            canBePlacedOnTop: true,
            orientation: "horizontal",
          }),
        ],
      })
    );

    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        units: expect.objectContaining({
          unitSystem: "in",
          dimension: "in",
          weight: "oz",
        }),
        result: expect.objectContaining({
          idealBox: expect.objectContaining({
            box: expect.objectContaining({
              name: "Ideal Box",
            }),
          }),
        }),
      })
    );
  });
});
