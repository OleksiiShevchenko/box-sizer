import {
  calculatePackingPlanForUser,
  getPackingPlanForUser,
  savePackingPlanCalculation,
} from "@/lib/api-packing-plans";
import { inchesToCm, ozToGrams } from "@/types";
import { PUT } from "./route";
import { performMeteredCalculation } from "@/services/subscription";

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

jest.mock("@/lib/api-errors", () => {
  class ApiError extends Error {
    status: number;
    code: string;

    constructor(status: number, code: string, message: string) {
      super(message);
      this.status = status;
      this.code = code;
    }
  }

  return {
    badRequest: (message = "Invalid request body", code = "bad_request") =>
      new ApiError(400, code, message),
    forbidden: (message = "Forbidden", code = "forbidden") =>
      new ApiError(403, code, message),
    apiErrorResponse: (error: { status?: number; code?: string; message?: string }) =>
      new Response(
        JSON.stringify({
          error: {
            code: error.code ?? "internal_error",
            message: error.message ?? "Internal server error",
          },
        }),
        {
          status: error.status ?? 500,
          headers: { "Content-Type": "application/json" },
        }
      ),
  };
});

jest.mock("@/lib/api-packing-plans", () => ({
  calculatePackingPlanForUser: jest.fn(),
  getPackingPlanForUser: jest.fn(),
  savePackingPlanCalculation: jest.fn(),
}));

jest.mock("@/services/subscription", () => ({
  CalculationQuotaExceededError: class CalculationQuotaExceededError extends Error {
    usageLimit: number;

    constructor(usageLimit: number) {
      super(`quota ${usageLimit}`);
      this.usageLimit = usageLimit;
    }
  },
  formatCalculationQuotaExceededMessage: (usageLimit: number) =>
    `You have used all ${usageLimit} calculations for the current billing period. Upgrade your plan to continue.`,
  performMeteredCalculation: jest.fn(),
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
const performMeteredCalculationMock = performMeteredCalculation as jest.Mock;

describe("PUT /api/v1/packing-plans/[id]", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    performMeteredCalculationMock.mockImplementation(
      async (_userId: string, run: (tx: unknown) => Promise<unknown>) => run({})
    );
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
      {},
      "packing-plan-db-id",
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

  it("normalizes imperial item values and persists flags when saving an updated plan", async () => {
    getPackingPlanForUserMock
      .mockResolvedValueOnce({
        id: "packing-plan-db-id",
        publicId: "packing-plan-public-id",
        userId: "user-1",
        name: "Imperial Plan",
        spacingOverride: null,
        dimensionalWeight: 3,
        boxId: "box-1",
        box: {
          id: "box-1",
          publicId: "box-public-id",
          userId: "user-1",
          name: "QA-04 Mailer 24x12x18",
          width: 24,
          height: 12,
          depth: 18,
          spacing: 0,
          maxWeight: 2000,
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
        name: "Imperial Plan",
        spacingOverride: inchesToCm(0.5),
        dimensionalWeight: 3,
        boxId: "box-1",
        box: {
          id: "box-1",
          publicId: "box-public-id",
          userId: "user-1",
          name: "QA-04 Mailer 24x12x18",
          width: 24,
          height: 12,
          depth: 18,
          spacing: 0,
          maxWeight: 2000,
          createdAt: new Date("2026-03-01T00:00:00.000Z"),
          updatedAt: new Date("2026-03-01T00:00:00.000Z"),
        },
        items: [],
        createdAt: new Date("2026-03-01T00:00:00.000Z"),
        updatedAt: new Date("2026-03-01T00:00:00.000Z"),
      });

    calculatePackingPlanForUserMock.mockResolvedValue({
      results: [
        {
          box: {
            id: "box-1",
            name: "QA-04 Mailer 24x12x18",
            width: 24,
            height: 12,
            depth: 18,
            spacing: 0,
            maxWeight: 2000,
          },
          items: [],
          dimensionalWeight: 3,
        },
      ],
      idealResult: null,
    });

    const request = new Request("http://localhost/api/v1/packing-plans/packing-plan-public-id", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        unitSystem: "in",
        name: "Imperial Plan",
        spacingOverride: 0.5,
        renderVisualization: false,
        items: [
          {
            name: "ImperialCube",
            quantity: 2,
            width: 4,
            height: 4,
            depth: 4,
            weight: 8,
            canStackOnTop: false,
            canBePlacedOnTop: false,
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

    expect(calculatePackingPlanForUserMock).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        name: "Imperial Plan",
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
            canBePlacedOnTop: false,
            orientation: "vertical",
          }),
        ],
      })
    );
    expect(savePackingPlanCalculationMock).toHaveBeenCalledWith(
      {},
      "packing-plan-db-id",
      expect.objectContaining({
        name: "Imperial Plan",
        spacingOverride: inchesToCm(0.5),
        items: [
          expect.objectContaining({
            name: "ImperialCube",
            quantity: 2,
            width: inchesToCm(4),
            height: inchesToCm(4),
            depth: inchesToCm(4),
            weight: ozToGrams(8),
            canStackOnTop: false,
            canBePlacedOnTop: false,
            orientation: "vertical",
          }),
        ],
      }),
      expect.any(Array)
    );

    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        units: expect.objectContaining({
          unitSystem: "in",
          dimension: "in",
          weight: "oz",
        }),
      })
    );
  });

  it("returns quota_exceeded when an update exceeds the billing period limit", async () => {
    const { CalculationQuotaExceededError } = jest.requireMock("@/services/subscription");
    getPackingPlanForUserMock.mockResolvedValue({
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
      idealResult: null,
    });
    performMeteredCalculationMock.mockRejectedValue(new CalculationQuotaExceededError(15));

    const request = new Request("http://localhost/api/v1/packing-plans/packing-plan-public-id", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        unitSystem: "cm",
        name: "Demo Packing Plan",
        renderVisualization: false,
        items: [
          {
            name: "Item A",
            quantity: 1,
            width: 10,
            height: 8,
            depth: 6,
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

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "quota_exceeded",
        message:
          "You have used all 50 calculations for the current billing period. Upgrade your plan to continue.",
      },
    });
  });
});
