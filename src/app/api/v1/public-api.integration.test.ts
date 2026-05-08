import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";
import type { VisualizationUrls } from "@/services/visualization-upload";

process.env.API_JWT_SECRET = "public-api-integration-secret";

const mockAfterCallbacks: Array<() => void | Promise<void>> = [];
const mockReadyVisualizations = new Set<string>();

function mockVisualizationUrls(id: string): VisualizationUrls {
  return {
    perspectiveUrl: `https://blob.test/visualizations/${id}/perspective.png`,
    frontUrl: `https://blob.test/visualizations/${id}/front.png`,
    sideUrl: `https://blob.test/visualizations/${id}/side.png`,
    topUrl: `https://blob.test/visualizations/${id}/top.png`,
  };
}

type RecordBase = {
  id: string;
  publicId?: string;
  createdAt: Date;
  updatedAt: Date;
};

function createInMemoryPrisma() {
  let sequence = 0;
  const state = {
    users: [] as Array<RecordBase & { email: string; unitSystem: string }>,
    apiApps: [] as Array<RecordBase & {
      userId: string;
      name: string;
      clientId: string;
      clientSecretHash: string;
    }>,
    apiTokens: [] as Array<{
      id: string;
      appId: string;
      userId: string;
      tokenHash: string;
      expiresAt: Date;
      createdAt: Date;
    }>,
    boxes: [] as Array<RecordBase & {
      publicId: string;
      userId: string;
      name: string;
      width: number;
      height: number;
      depth: number;
      spacing: number;
      maxWeight: number | null;
    }>,
    packingPlans: [] as Array<RecordBase & {
      publicId: string;
      userId: string;
      name: string;
      spacingOverride: number | null;
      boxId: string | null;
      dimensionalWeight: number | null;
      calculationCount: number;
    }>,
    packingPlanItems: [] as Array<{
      id: string;
      publicId: string;
      packingPlanId: string;
      name: string;
      quantity: number;
      width: number;
      height: number;
      depth: number;
      weight: number | null;
      canStackOnTop: boolean;
      canBePlacedOnTop: boolean;
      orientation: string;
    }>,
    subscriptions: [] as Array<{
      id: string;
      userId: string;
      tier: string;
      status: string;
      stripeCustomerId: string | null;
      stripeSubscriptionId: string | null;
      stripePriceId: string | null;
      billingInterval: string | null;
      currentPeriodStart: Date | null;
      currentPeriodEnd: Date | null;
      cancelAtPeriodEnd: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>,
    calculationUsage: [] as Array<{ id: string; userId: string; createdAt: Date }>,
  };

  const nextId = (prefix: string) => `${prefix}-${++sequence}`;
  const nextPublicId = () =>
    `00000000-0000-4000-8000-${String(++sequence).padStart(12, "0")}`;
  const now = () => new Date("2026-04-27T12:00:00.000Z");

  function withPackingPlanRelations(plan: (typeof state.packingPlans)[number]) {
    return {
      ...plan,
      box: state.boxes.find((box) => box.id === plan.boxId) ?? null,
      items: state.packingPlanItems.filter((item) => item.packingPlanId === plan.id),
    };
  }

  function createPackingPlan(data: {
    userId: string;
    name: string;
    spacingOverride?: number | null;
    boxId?: string | null;
    dimensionalWeight?: number | null;
    calculationCount?: number;
    items?: {
      create?: Array<{
        name: string;
        quantity?: number;
        width: number;
        height: number;
        depth: number;
        weight?: number | null;
        canStackOnTop?: boolean;
        canBePlacedOnTop?: boolean;
        orientation?: string;
      }>;
    };
  }) {
    const timestamp = now();
    const plan = {
      id: nextId("packing-plan"),
      publicId: nextPublicId(),
      userId: data.userId,
      name: data.name,
      spacingOverride: data.spacingOverride ?? null,
      boxId: data.boxId ?? null,
      dimensionalWeight: data.dimensionalWeight ?? null,
      calculationCount: data.calculationCount ?? 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    state.packingPlans.push(plan);

    for (const item of data.items?.create ?? []) {
      state.packingPlanItems.push({
        id: nextId("packing-plan-item"),
        publicId: nextPublicId(),
        packingPlanId: plan.id,
        name: item.name,
        quantity: item.quantity ?? 1,
        width: item.width,
        height: item.height,
        depth: item.depth,
        weight: item.weight ?? null,
        canStackOnTop: item.canStackOnTop ?? true,
        canBePlacedOnTop: item.canBePlacedOnTop ?? true,
        orientation: item.orientation ?? "any",
      });
    }

    return plan;
  }

  const prisma = {
    __state: state,
    __reset() {
      sequence = 0;
      Object.values(state).forEach((records) => records.splice(0));
      mockAfterCallbacks.splice(0);
      mockReadyVisualizations.clear();
    },
    async __seedApiClient(label: string) {
      const timestamp = now();
      const user = {
        id: nextId("user"),
        publicId: nextPublicId(),
        email: `${label}@example.com`,
        unitSystem: "cm",
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      state.users.push(user);
      state.subscriptions.push({
        id: nextId("subscription"),
        userId: user.id,
        tier: "pro",
        status: "active",
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        stripePriceId: null,
        billingInterval: null,
        currentPeriodStart: timestamp,
        currentPeriodEnd: new Date("2026-05-27T12:00:00.000Z"),
        cancelAtPeriodEnd: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      const clientSecret = `secret-${label}`;
      const app = {
        id: nextId("api-app"),
        publicId: nextPublicId(),
        userId: user.id,
        name: `API ${label}`,
        clientId: `client-${label}`,
        clientSecretHash: await bcrypt.hash(clientSecret, 4),
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      state.apiApps.push(app);

      return { user, app, clientSecret };
    },
    async $transaction(run: (tx: unknown) => Promise<unknown>) {
      return run(prisma);
    },
    user: {
      async findUniqueOrThrow({ where }: { where: { id: string } }) {
        const user = state.users.find((candidate) => candidate.id === where.id);
        if (!user) {
          throw new Error("User not found");
        }
        return user;
      },
      async deleteMany() {
        prisma.__reset();
        return { count: 0 };
      },
    },
    subscription: {
      async findUnique({ where }: { where: { userId: string } }) {
        return state.subscriptions.find((subscription) => subscription.userId === where.userId) ?? null;
      },
      async upsert({
        where,
        create,
      }: {
        where: { userId: string };
        create: Omit<(typeof state.subscriptions)[number], "id" | "createdAt" | "updatedAt">;
      }) {
        const existing = state.subscriptions.find(
          (subscription) => subscription.userId === where.userId
        );
        if (existing) {
          return existing;
        }
        const timestamp = now();
        const subscription = {
          ...create,
          id: nextId("subscription"),
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        state.subscriptions.push(subscription);
        return subscription;
      },
      async update({ where, data }: { where: { userId: string }; data: Record<string, unknown> }) {
        const subscription = state.subscriptions.find(
          (candidate) => candidate.userId === where.userId
        );
        if (!subscription) {
          throw new Error("Subscription not found");
        }
        Object.assign(subscription, data, { updatedAt: now() });
        return subscription;
      },
    },
    calculationUsage: {
      async count({ where }: { where: { userId: string } }) {
        return state.calculationUsage.filter((usage) => usage.userId === where.userId).length;
      },
      async create({ data }: { data: { userId: string } }) {
        const usage = {
          id: nextId("usage"),
          userId: data.userId,
          createdAt: now(),
        };
        state.calculationUsage.push(usage);
        return usage;
      },
      async deleteMany() {
        state.calculationUsage.splice(0);
        return { count: 0 };
      },
    },
    apiApp: {
      async findUnique({ where }: { where: { clientId: string } }) {
        return state.apiApps.find((app) => app.clientId === where.clientId) ?? null;
      },
    },
    apiToken: {
      async create({
        data,
      }: {
        data: { appId: string; userId: string; tokenHash: string; expiresAt: Date };
      }) {
        const token = {
          id: nextId("api-token"),
          appId: data.appId,
          userId: data.userId,
          tokenHash: data.tokenHash,
          expiresAt: data.expiresAt,
          createdAt: now(),
        };
        state.apiTokens.push(token);
        return token;
      },
      async findUnique({ where }: { where: { tokenHash: string } }) {
        const token = state.apiTokens.find((candidate) => candidate.tokenHash === where.tokenHash);
        if (!token) {
          return null;
        }
        const user = state.users.find((candidate) => candidate.id === token.userId);
        return {
          ...token,
          user: user ? { unitSystem: user.unitSystem } : null,
        };
      },
    },
    box: {
      async create({
        data,
      }: {
        data: {
          userId: string;
          name: string;
          width: number;
          height: number;
          depth: number;
          spacing: number;
          maxWeight: number | null;
        };
      }) {
        const timestamp = now();
        const box = {
          id: nextId("box"),
          publicId: nextPublicId(),
          userId: data.userId,
          name: data.name,
          width: data.width,
          height: data.height,
          depth: data.depth,
          spacing: data.spacing,
          maxWeight: data.maxWeight,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        state.boxes.push(box);
        return box;
      },
      async findMany({
        where,
        skip = 0,
        take = state.boxes.length,
      }: {
        where: { userId: string };
        skip?: number;
        take?: number;
      }) {
        return state.boxes.filter((box) => box.userId === where.userId).slice(skip, skip + take);
      },
      async count({ where }: { where: { userId: string } }) {
        return state.boxes.filter((box) => box.userId === where.userId).length;
      },
      async findFirst({ where }: { where: { userId: string; publicId: string } }) {
        return (
          state.boxes.find(
            (box) => box.userId === where.userId && box.publicId === where.publicId
          ) ?? null
        );
      },
      async update({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<(typeof state.boxes)[number]>;
      }) {
        const box = state.boxes.find((candidate) => candidate.id === where.id);
        if (!box) {
          throw new Error("Box not found");
        }
        Object.assign(box, data, { updatedAt: now() });
        return box;
      },
      async delete({ where }: { where: { id: string } }) {
        const index = state.boxes.findIndex((candidate) => candidate.id === where.id);
        if (index < 0) {
          throw new Error("Box not found");
        }
        return state.boxes.splice(index, 1)[0]!;
      },
    },
    packingPlan: {
      async create({ data }: { data: Parameters<typeof createPackingPlan>[0] }) {
        return createPackingPlan(data);
      },
      async findMany({
        where,
        skip = 0,
        take = state.packingPlans.length,
      }: {
        where: { userId: string };
        skip?: number;
        take?: number;
      }) {
        return state.packingPlans
          .filter((plan) => plan.userId === where.userId)
          .slice(skip, skip + take)
          .map(withPackingPlanRelations);
      },
      async count({ where }: { where: { userId: string } }) {
        return state.packingPlans.filter((plan) => plan.userId === where.userId).length;
      },
      async findFirst({ where }: { where: { userId: string; publicId: string } }) {
        const plan = state.packingPlans.find(
          (candidate) => candidate.userId === where.userId && candidate.publicId === where.publicId
        );
        return plan ? withPackingPlanRelations(plan) : null;
      },
      async update({
        where,
        data,
      }: {
        where: { id: string };
        data: {
          name: string;
          spacingOverride: number | null;
          boxId: string | null;
          dimensionalWeight: number | null;
          calculationCount?: { increment: number };
          items?: Parameters<typeof createPackingPlan>[0]["items"];
        };
      }) {
        const plan = state.packingPlans.find((candidate) => candidate.id === where.id);
        if (!plan) {
          throw new Error("Packing plan not found");
        }
        Object.assign(plan, {
          name: data.name,
          spacingOverride: data.spacingOverride,
          boxId: data.boxId,
          dimensionalWeight: data.dimensionalWeight,
          calculationCount:
            plan.calculationCount + (data.calculationCount?.increment ?? 0),
          updatedAt: now(),
        });
        for (const item of data.items?.create ?? []) {
          state.packingPlanItems.push({
            id: nextId("packing-plan-item"),
            publicId: nextPublicId(),
            packingPlanId: plan.id,
            name: item.name,
            quantity: item.quantity ?? 1,
            width: item.width,
            height: item.height,
            depth: item.depth,
            weight: item.weight ?? null,
            canStackOnTop: item.canStackOnTop ?? true,
            canBePlacedOnTop: item.canBePlacedOnTop ?? true,
            orientation: item.orientation ?? "any",
          });
        }
        return plan;
      },
    },
    packingPlanItem: {
      async deleteMany({ where }: { where: { packingPlanId: string } }) {
        const before = state.packingPlanItems.length;
        state.packingPlanItems = state.packingPlanItems.filter(
          (item) => item.packingPlanId !== where.packingPlanId
        );
        return { count: before - state.packingPlanItems.length };
      },
    },
  };

  return prisma;
}

function mockGetPrisma() {
  const globalWithPrisma = globalThis as typeof globalThis & {
    __publicApiIntegrationPrisma?: ReturnType<typeof createInMemoryPrisma>;
  };
  globalWithPrisma.__publicApiIntegrationPrisma ??= createInMemoryPrisma();
  return globalWithPrisma.__publicApiIntegrationPrisma;
}

jest.mock("@/lib/prisma", () => ({
  prisma: mockGetPrisma(),
}));

jest.mock("@/lib/api-auth", () => ({
  hashApiToken: jest.fn((token: string) => `hash:${token}`),
  signApiToken: jest.fn(async (userId: string, appId: string) => ({
    token: `token:${userId}:${appId}`,
    expiresAt: new Date("2099-04-27T13:00:00.000Z"),
    expiresIn: 3600,
  })),
  verifyApiToken: jest.fn(async (token: string) => {
    const [, userId, appId] = token.split(":");
    if (!userId || !appId) {
      const { unauthorized } = jest.requireActual("@/lib/api-errors");
      throw unauthorized("Invalid or expired API token", "invalid_token");
    }

    return {
      userId,
      appId,
      expiresAt: new Date("2099-04-27T13:00:00.000Z"),
    };
  }),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/services/email-notifications", () => ({
  notifyQuotaReached: jest.fn(),
}));

jest.mock("next/server", () => {
  const actual = jest.requireActual("next/server");
  return {
    ...actual,
    NextResponse: {
      ...actual.NextResponse,
      json: (data: unknown, init?: ResponseInit) =>
        new Response(JSON.stringify(data), {
          ...init,
          headers: {
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
          },
        }),
    },
    after: jest.fn((callback: () => void | Promise<void>) => {
      mockAfterCallbacks.push(callback);
    }),
  };
});

jest.mock("@/services/visualization-upload", () => ({
  predictVisualizationUrls: jest.fn((id: string) => mockVisualizationUrls(id)),
  getUploadedVisualizationUrls: jest.fn(async (id: string) =>
    mockReadyVisualizations.has(id) ? mockVisualizationUrls(id) : null
  ),
}));

jest.mock("@/services/visualization-renderer", () => ({
  generateAndUploadVisualizations: jest.fn(async (id: string) => {
    mockReadyVisualizations.add(id);
    return mockVisualizationUrls(id);
  }),
}));

import { POST as issueToken } from "./oauth/token/route";
import { GET as listBoxes, POST as createBox } from "./boxes/route";
import {
  DELETE as deleteBox,
  GET as getBox,
  PUT as updateBox,
} from "./boxes/[id]/route";
import { GET as listPackingPlans } from "./packing-plans/route";
import { POST as calculatePackingPlan } from "./packing-plans/calculate/route";
import {
  GET as getPackingPlan,
  PUT as updatePackingPlan,
} from "./packing-plans/[id]/route";

const testPrisma = mockGetPrisma();

function request(url: string, init?: RequestInit): NextRequest {
  const req = new Request(url, init) as NextRequest;
  Object.defineProperty(req, "nextUrl", {
    value: new URL(url),
  });
  return req;
}

function jsonRequest(pathname: string, token: string, body?: unknown): NextRequest {
  return request(`http://localhost${pathname}`, {
    method: body == null ? "GET" : "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body == null ? undefined : JSON.stringify(body),
  });
}

async function body(response: Response) {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function tokenFor(clientId: string, clientSecret: string) {
  const response = await issueToken(
    request("http://localhost/api/v1/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
      }),
    })
  );
  expect(response.status).toBe(200);
  const payload = await body(response);
  expect(payload).toEqual({
    access_token: expect.any(String),
    token_type: "Bearer",
    expires_in: 3600,
  });
  return payload.access_token as string;
}

async function flushAfterCallbacks() {
  const callbacks = mockAfterCallbacks.splice(0);
  await Promise.all(callbacks.map((callback) => callback()));
}

describe("public API integration", () => {
  let primary: Awaited<ReturnType<typeof testPrisma.__seedApiClient>>;
  let secondary: Awaited<ReturnType<typeof testPrisma.__seedApiClient>>;
  let token: string;
  let secondaryToken: string;
  let calculationBoxId: string;
  let packingPlanId: string;

  beforeEach(async () => {
    testPrisma.__reset();
    primary = await testPrisma.__seedApiClient("primary");
    secondary = await testPrisma.__seedApiClient("secondary");
    token = await tokenFor(primary.app.clientId, primary.clientSecret);
    secondaryToken = await tokenFor(secondary.app.clientId, secondary.clientSecret);
  });

  it("authenticates OAuth clients and protects bearer-token routes", async () => {
    const missingToken = await listBoxes(request("http://localhost/api/v1/boxes"));
    expect(missingToken.status).toBe(401);
    await expect(body(missingToken)).resolves.toEqual({
      error: expect.objectContaining({ code: "missing_token" }),
    });

    const invalidClient = await issueToken(
      request("http://localhost/api/v1/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: primary.app.clientId,
          client_secret: "wrong-secret",
        }),
      })
    );
    expect(invalidClient.status).toBe(401);
    await expect(body(invalidClient)).resolves.toEqual({
      error: expect.objectContaining({ code: "invalid_client" }),
    });

    const authorized = await listBoxes(jsonRequest("/api/v1/boxes", token));
    expect(authorized.status).toBe(200);
    await expect(body(authorized)).resolves.toEqual(
      expect.objectContaining({
        data: [],
        measurementUnits: "metric",
        pagination: expect.objectContaining({ total: 0 }),
      })
    );
  });

  it("creates, lists, reads, updates, and deletes boxes", async () => {
    const invalid = await createBox(
      jsonRequest("/api/v1/boxes", token, {
        measurementUnits: "metric",
        name: "",
        width: 10,
        height: 10,
        depth: 10,
        spacing: 0,
      })
    );
    expect(invalid.status).toBe(400);

    const created = await createBox(
      jsonRequest("/api/v1/boxes", token, {
        measurementUnits: "metric",
        name: "Managed Mailer",
        width: 18,
        height: 8,
        depth: 12,
        spacing: 0.5,
        maxWeight: 1500,
      })
    );
    expect(created.status).toBe(201);
    const managedBox = await body(created);
    expect(managedBox).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: "Managed Mailer",
        width: 18,
        height: 8,
        depth: 12,
        spacing: 0.5,
        maxWeight: 1500,
        measurementUnits: "metric",
      })
    );

    const calculationBox = await createBox(
      jsonRequest("/api/v1/boxes", token, {
        measurementUnits: "metric",
        name: "Calculation Cube",
        width: 20,
        height: 20,
        depth: 20,
        spacing: 0,
        maxWeight: 5000,
      })
    );
    calculationBoxId = (await body(calculationBox)).id;

    const list = await listBoxes(request("http://localhost/api/v1/boxes?page=1&pageSize=1", {
      headers: { Authorization: `Bearer ${token}` },
    }) as NextRequest);
    expect(list.status).toBe(200);
    await expect(body(list)).resolves.toEqual(
      expect.objectContaining({
        data: [expect.objectContaining({ id: expect.any(String) })],
        pagination: expect.objectContaining({
          total: 2,
          page: 1,
          pageSize: 1,
          totalPages: 2,
        }),
      })
    );

    const detail = await getBox(jsonRequest(`/api/v1/boxes/${managedBox.id}`, token), {
      params: Promise.resolve({ id: managedBox.id }),
    });
    expect(detail.status).toBe(200);
    await expect(body(detail)).resolves.toEqual(
      expect.objectContaining({ id: managedBox.id, name: "Managed Mailer" })
    );

    const updated = await updateBox(
      jsonRequest(`/api/v1/boxes/${managedBox.id}`, token, {
        measurementUnits: "metric",
        name: "Updated Mailer",
        width: 19,
        height: 9,
        depth: 13,
        spacing: 1,
        maxWeight: null,
      }),
      { params: Promise.resolve({ id: managedBox.id }) }
    );
    expect(updated.status).toBe(200);
    await expect(body(updated)).resolves.toEqual(
      expect.objectContaining({
        id: managedBox.id,
        name: "Updated Mailer",
        maxWeight: null,
      })
    );

    const removed = await deleteBox(jsonRequest(`/api/v1/boxes/${managedBox.id}`, token), {
      params: Promise.resolve({ id: managedBox.id }),
    });
    expect(removed.status).toBe(200);
    await expect(body(removed)).resolves.toEqual({ id: managedBox.id });

    const missing = await getBox(jsonRequest(`/api/v1/boxes/${managedBox.id}`, token), {
      params: Promise.resolve({ id: managedBox.id }),
    });
    expect(missing.status).toBe(404);
  });

  it("calculates, persists, lists, reads, and updates packing plans", async () => {
    const box = await createBox(
      jsonRequest("/api/v1/boxes", token, {
        measurementUnits: "metric",
        name: "Calculation Cube",
        width: 20,
        height: 20,
        depth: 20,
        spacing: 0,
        maxWeight: 5000,
      })
    );
    calculationBoxId = (await body(box)).id;

    const invalid = await calculatePackingPlan(
      jsonRequest("/api/v1/packing-plans/calculate", token, {
        unitSystem: "cm",
        includeIdealBox: true,
        renderVisualization: false,
        items: [],
      })
    );
    expect(invalid.status).toBe(400);

    const calculated = await calculatePackingPlan(
      jsonRequest("/api/v1/packing-plans/calculate", token, {
        unitSystem: "cm",
        spacingOverride: 0.25,
        includeIdealBox: true,
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
            quantity: 2,
            width: 5,
            height: 5,
            depth: 5,
            weight: 120,
            canStackOnTop: false,
            canBePlacedOnTop: true,
            orientation: "horizontal",
          },
        ],
      })
    );
    expect(calculated.status).toBe(200);
    const calculation = await body(calculated);
    packingPlanId = calculation.id;
    expect(calculation.visualization).toBeUndefined();
    expect(calculation.result.boxes).toEqual([
      expect.objectContaining({
        box: expect.objectContaining({
          id: calculationBoxId,
          name: "Calculation Cube",
        }),
      }),
    ]);
    expect(calculation.result.idealBox).toEqual(
      expect.objectContaining({
        box: expect.objectContaining({ name: "Ideal Box" }),
      })
    );

    const plans = await listPackingPlans(
      request("http://localhost/api/v1/packing-plans?page=1&pageSize=10", {
        headers: { Authorization: `Bearer ${token}` },
      }) as NextRequest
    );
    expect(plans.status).toBe(200);
    await expect(body(plans)).resolves.toEqual(
      expect.objectContaining({
        data: [
          expect.objectContaining({
            id: packingPlanId,
            name: "Untitled Packing Plan",
            items: expect.arrayContaining([
              expect.objectContaining({ name: "Item A", quantity: 3 }),
            ]),
          }),
        ],
        pagination: expect.objectContaining({ total: 1 }),
      })
    );

    const detail = await getPackingPlan(
      jsonRequest(`/api/v1/packing-plans/${packingPlanId}`, token),
      { params: Promise.resolve({ id: packingPlanId }) }
    );
    expect(detail.status).toBe(200);
    await expect(body(detail)).resolves.toEqual(
      expect.objectContaining({
        id: packingPlanId,
        name: "Untitled Packing Plan",
        spacingOverride: 0.25,
        box: expect.objectContaining({ id: calculationBoxId }),
      })
    );

    const updated = await updatePackingPlan(
      jsonRequest(`/api/v1/packing-plans/${packingPlanId}`, token, {
        unitSystem: "cm",
        name: "Updated Packing Plan",
        spacingOverride: null,
        renderVisualization: false,
        items: [
          {
            name: "Updated Item",
            quantity: 1,
            width: 10,
            height: 6,
            depth: 10,
            weight: 300,
            canStackOnTop: true,
            canBePlacedOnTop: true,
            orientation: "vertical",
          },
        ],
      }),
      { params: Promise.resolve({ id: packingPlanId }) }
    );
    expect(updated.status).toBe(200);
    await expect(body(updated)).resolves.toEqual(
      expect.objectContaining({
        packingPlan: expect.objectContaining({
          id: packingPlanId,
          name: "Updated Packing Plan",
          items: [
            expect.objectContaining({
              name: "Updated Item",
              quantity: 1,
              orientation: "vertical",
            }),
          ],
        }),
      })
    );

    const otherUserDetail = await getPackingPlan(
      jsonRequest(`/api/v1/packing-plans/${packingPlanId}`, secondaryToken),
      { params: Promise.resolve({ id: packingPlanId }) }
    );
    expect(otherUserDetail.status).toBe(404);
  });

  it("schedules and exposes visualization URLs when renderVisualization is true", async () => {
    const box = await createBox(
      jsonRequest("/api/v1/boxes", token, {
        measurementUnits: "metric",
        name: "Visualization Cube",
        width: 20,
        height: 20,
        depth: 20,
        spacing: 0,
        maxWeight: 5000,
      })
    );
    calculationBoxId = (await body(box)).id;

    const calculated = await calculatePackingPlan(
      jsonRequest("/api/v1/packing-plans/calculate", token, {
        unitSystem: "cm",
        spacingOverride: 0.25,
        includeIdealBox: true,
        renderVisualization: true,
        items: [
          {
            name: "Visual Item A",
            quantity: 2,
            width: 8,
            height: 4,
            depth: 6,
            weight: 250,
            canStackOnTop: true,
            canBePlacedOnTop: true,
            orientation: "any",
          },
          {
            name: "Visual Item B",
            quantity: 1,
            width: 5,
            height: 5,
            depth: 5,
            weight: 120,
            canStackOnTop: false,
            canBePlacedOnTop: true,
            orientation: "horizontal",
          },
        ],
      })
    );
    expect(calculated.status).toBe(200);
    const payload = await body(calculated);
    expect(payload.visualization).toEqual({
      status: "pending",
      ...mockVisualizationUrls(payload.id),
    });

    await flushAfterCallbacks();

    const detail = await getPackingPlan(
      jsonRequest(`/api/v1/packing-plans/${payload.id}`, token),
      { params: Promise.resolve({ id: payload.id }) }
    );
    expect(detail.status).toBe(200);
    await expect(body(detail)).resolves.toEqual(
      expect.objectContaining({
        id: payload.id,
        visualization: {
          status: "ready",
          ...mockVisualizationUrls(payload.id),
        },
      })
    );
  });
});
