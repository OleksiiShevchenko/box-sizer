import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { expect, test, type APIRequestContext } from "@playwright/test";
import { prisma } from "../../src/lib/prisma";

test.describe.configure({ mode: "serial" });

type ApiFixture = {
  userId: string;
  email: string;
  clientId: string;
  clientSecret: string;
};

const suiteId = randomUUID();
let primary: ApiFixture;
let secondary: ApiFixture;
let accessToken = "";
let secondaryAccessToken = "";
let calculationBoxId = "";
let packingPlanId = "";

function expectUuid(value: unknown) {
  expect(value).toEqual(expect.stringMatching(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  ));
}

async function createApiFixture(label: string): Promise<ApiFixture> {
  const email = `public-api-${label}-${suiteId}@example.com`;
  const clientId = `public_api_${label}_${suiteId}`;
  const clientSecret = `secret_${label}_${suiteId}`;
  const now = new Date();
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const user = await prisma.user.create({
    data: {
      name: `Public API ${label}`,
      email,
      emailVerified: now,
      unitSystem: "cm",
      subscription: {
        create: {
          tier: "pro",
          status: "active",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
        },
      },
      apiApps: {
        create: {
          name: `Public API ${label}`,
          clientId,
          clientSecretHash: await bcrypt.hash(clientSecret, 10),
        },
      },
    },
    include: {
      apiApps: true,
    },
  });

  return {
    userId: user.id,
    email,
    clientId: user.apiApps[0]!.clientId,
    clientSecret,
  };
}

async function getAccessToken(request: APIRequestContext, fixture: ApiFixture) {
  const response = await request.post("/api/v1/oauth/token", {
    form: {
      client_id: fixture.clientId,
      client_secret: fixture.clientSecret,
    },
  });
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body).toEqual({
    access_token: expect.any(String),
    token_type: "Bearer",
    expires_in: 3600,
  });

  return body.access_token as string;
}

async function apiGet(request: APIRequestContext, path: string, token = accessToken) {
  return request.get(path, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

async function apiPost(
  request: APIRequestContext,
  path: string,
  data: unknown,
  token = accessToken
) {
  return request.post(path, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data,
  });
}

async function apiPut(
  request: APIRequestContext,
  path: string,
  data: unknown,
  token = accessToken
) {
  return request.put(path, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data,
  });
}

async function apiDelete(request: APIRequestContext, path: string, token = accessToken) {
  return request.delete(path, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

async function expectError(response: Awaited<ReturnType<APIRequestContext["get"]>>, status: number, code: string) {
  expect(response.status()).toBe(status);
  await expect(response.json()).resolves.toEqual({
    error: expect.objectContaining({ code }),
  });
}

async function waitForPng(request: APIRequestContext, url: string) {
  await expect
    .poll(
      async () => {
        const response = await request.get(url, { failOnStatusCode: false });
        if (response.status() !== 200) {
          return {
            status: response.status(),
            contentType: response.headers()["content-type"] ?? "",
            hasBytes: false,
          };
        }

        const body = await response.body();
        return {
          status: response.status(),
          contentType: response.headers()["content-type"] ?? "",
          hasBytes: body.length > 0,
        };
      },
      {
        intervals: [1_000, 2_000, 5_000],
        timeout: 90_000,
      }
    )
    .toEqual({
      status: 200,
      contentType: expect.stringContaining("image/png"),
      hasBytes: true,
    });
}

test.beforeAll(async () => {
  primary = await createApiFixture("primary");
  secondary = await createApiFixture("secondary");
});

test.afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [primary?.email, secondary?.email].filter(Boolean),
      },
    },
  });
  await prisma.$disconnect();
});

test("authenticates OAuth clients and rejects unauthenticated public API requests", async ({
  request,
}) => {
  await expectError(await request.get("/api/v1/boxes"), 401, "missing_token");
  await expectError(
    await request.get("/api/v1/boxes", {
      headers: {
        Authorization: "Bearer not-a-valid-token",
      },
    }),
    401,
    "invalid_token"
  );

  const invalidClient = await request.post("/api/v1/oauth/token", {
    data: {
      client_id: primary.clientId,
      client_secret: "wrong-secret",
    },
  });
  await expectError(invalidClient, 401, "invalid_client");

  accessToken = await getAccessToken(request, primary);
  secondaryAccessToken = await getAccessToken(request, secondary);

  const authorized = await apiGet(request, "/api/v1/boxes");
  expect(authorized.status()).toBe(200);
  await expect(authorized.json()).resolves.toEqual(
    expect.objectContaining({
      data: [],
      measurementUnits: "metric",
      pagination: expect.objectContaining({
        total: 0,
      }),
    })
  );
});

test("manages boxes through the public API", async ({ request }) => {
  const invalidBox = await apiPost(request, "/api/v1/boxes", {
    measurementUnits: "metric",
    name: "",
    width: 10,
    height: 10,
    depth: 10,
    spacing: 0,
  });
  await expectError(invalidBox, 400, "bad_request");

  const createManaged = await apiPost(request, "/api/v1/boxes", {
    measurementUnits: "metric",
    name: "API Managed Mailer",
    width: 18,
    height: 8,
    depth: 12,
    spacing: 0.5,
    maxWeight: 1500,
  });
  expect(createManaged.status()).toBe(201);
  const managedBox = await createManaged.json();
  expectUuid(managedBox.id);
  expect(managedBox).toEqual(
    expect.objectContaining({
      name: "API Managed Mailer",
      width: 18,
      height: 8,
      depth: 12,
      spacing: 0.5,
      maxWeight: 1500,
      measurementUnits: "metric",
    })
  );

  const createCalculation = await apiPost(request, "/api/v1/boxes", {
    measurementUnits: "metric",
    name: "API Calculation Cube",
    width: 20,
    height: 20,
    depth: 20,
    spacing: 0,
    maxWeight: 5000,
  });
  expect(createCalculation.status()).toBe(201);
  calculationBoxId = (await createCalculation.json()).id;

  const list = await apiGet(request, "/api/v1/boxes?page=1&pageSize=1");
  expect(list.status()).toBe(200);
  await expect(list.json()).resolves.toEqual(
    expect.objectContaining({
      data: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
        }),
      ]),
      pagination: expect.objectContaining({
        total: 2,
        page: 1,
        pageSize: 1,
        totalPages: 2,
      }),
    })
  );

  const getManaged = await apiGet(request, `/api/v1/boxes/${managedBox.id}`);
  expect(getManaged.status()).toBe(200);
  await expect(getManaged.json()).resolves.toEqual(
    expect.objectContaining({
      id: managedBox.id,
      name: "API Managed Mailer",
    })
  );

  const updateManaged = await apiPut(request, `/api/v1/boxes/${managedBox.id}`, {
    measurementUnits: "metric",
    name: "API Updated Mailer",
    width: 19,
    height: 9,
    depth: 13,
    spacing: 1,
    maxWeight: null,
  });
  expect(updateManaged.status()).toBe(200);
  await expect(updateManaged.json()).resolves.toEqual(
    expect.objectContaining({
      id: managedBox.id,
      name: "API Updated Mailer",
      width: 19,
      height: 9,
      depth: 13,
      spacing: 1,
      maxWeight: null,
    })
  );

  const removeManaged = await apiDelete(request, `/api/v1/boxes/${managedBox.id}`);
  expect(removeManaged.status()).toBe(200);
  await expect(removeManaged.json()).resolves.toEqual({ id: managedBox.id });

  await expectError(await apiGet(request, `/api/v1/boxes/${managedBox.id}`), 404, "not_found");
});

test("calculates, lists, reads, and updates packing plans through the public API", async ({
  request,
}) => {
  expect(calculationBoxId).toBeTruthy();

  const invalidCalculation = await apiPost(request, "/api/v1/packing-plans/calculate", {
    unitSystem: "cm",
    includeIdealBox: true,
    renderVisualization: false,
    items: [],
  });
  await expectError(invalidCalculation, 400, "bad_request");

  const calculate = await apiPost(request, "/api/v1/packing-plans/calculate", {
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
  });
  expect(calculate.status()).toBe(200);
  const calculated = await calculate.json();
  expectUuid(calculated.id);
  packingPlanId = calculated.id;
  expect(calculated).toEqual(
    expect.objectContaining({
      units: expect.objectContaining({
        unitSystem: "cm",
        dimension: "cm",
        weight: "g",
        dimensionalWeight: "kg",
      }),
      result: expect.objectContaining({
        boxes: [
          expect.objectContaining({
            box: expect.objectContaining({
              id: calculationBoxId,
              name: "API Calculation Cube",
            }),
            items: expect.arrayContaining([
              expect.objectContaining({ name: expect.stringContaining("Item A") }),
              expect.objectContaining({ name: expect.stringContaining("Item B") }),
            ]),
          }),
        ],
        idealBox: expect.objectContaining({
          box: expect.objectContaining({ name: "Ideal Box" }),
        }),
      }),
    })
  );
  expect(calculated.visualization).toBeUndefined();

  const list = await apiGet(request, "/api/v1/packing-plans?page=1&pageSize=10");
  expect(list.status()).toBe(200);
  await expect(list.json()).resolves.toEqual(
    expect.objectContaining({
      data: expect.arrayContaining([
        expect.objectContaining({
          id: packingPlanId,
          name: "Untitled Packing Plan",
          items: expect.arrayContaining([
            expect.objectContaining({ name: "Item A", quantity: 3 }),
            expect.objectContaining({ name: "Item B", quantity: 2 }),
          ]),
        }),
      ]),
      pagination: expect.objectContaining({
        total: 1,
      }),
    })
  );

  const detail = await apiGet(request, `/api/v1/packing-plans/${packingPlanId}`);
  expect(detail.status()).toBe(200);
  await expect(detail.json()).resolves.toEqual(
    expect.objectContaining({
      id: packingPlanId,
      name: "Untitled Packing Plan",
      spacingOverride: 0.25,
      box: expect.objectContaining({
        id: calculationBoxId,
        name: "API Calculation Cube",
      }),
      items: expect.arrayContaining([
        expect.objectContaining({ name: "Item A", quantity: 3 }),
        expect.objectContaining({ name: "Item B", quantity: 2 }),
      ]),
    })
  );

  const update = await apiPut(request, `/api/v1/packing-plans/${packingPlanId}`, {
    unitSystem: "cm",
    name: "API Updated Packing Plan",
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
  });
  expect(update.status()).toBe(200);
  await expect(update.json()).resolves.toEqual(
    expect.objectContaining({
      packingPlan: expect.objectContaining({
        id: packingPlanId,
        name: "API Updated Packing Plan",
        items: [
          expect.objectContaining({
            name: "Updated Item",
            quantity: 1,
            orientation: "vertical",
          }),
        ],
      }),
      result: expect.objectContaining({
        boxes: [
          expect.objectContaining({
            box: expect.objectContaining({
              id: calculationBoxId,
              name: "API Calculation Cube",
            }),
          }),
        ],
      }),
    })
  );

  await expectError(
    await apiGet(request, `/api/v1/packing-plans/${packingPlanId}`, secondaryAccessToken),
    404,
    "not_found"
  );
});

test("generates visualization images when renderVisualization is true", async ({
  request,
}) => {
  test.skip(
    !process.env.BLOB_READ_WRITE_TOKEN,
    "BLOB_READ_WRITE_TOKEN is required to verify uploaded public API visualization images."
  );
  expect(calculationBoxId).toBeTruthy();

  const response = await apiPost(request, "/api/v1/packing-plans/calculate", {
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
  });
  expect(response.status()).toBe(200);
  const body = await response.json();
  expectUuid(body.id);
  expect(body.visualization).toEqual({
    status: "pending",
    perspectiveUrl: expect.stringContaining(`/visualizations/${body.id}/perspective.png`),
    frontUrl: expect.stringContaining(`/visualizations/${body.id}/front.png`),
    sideUrl: expect.stringContaining(`/visualizations/${body.id}/side.png`),
    topUrl: expect.stringContaining(`/visualizations/${body.id}/top.png`),
  });

  await Promise.all([
    waitForPng(request, body.visualization.perspectiveUrl),
    waitForPng(request, body.visualization.frontUrl),
    waitForPng(request, body.visualization.sideUrl),
    waitForPng(request, body.visualization.topUrl),
  ]);

  const detail = await apiGet(request, `/api/v1/packing-plans/${body.id}`);
  expect(detail.status()).toBe(200);
  await expect(detail.json()).resolves.toEqual(
    expect.objectContaining({
      id: body.id,
      visualization: expect.objectContaining({
        status: "ready",
        perspectiveUrl: body.visualization.perspectiveUrl,
        frontUrl: body.visualization.frontUrl,
        sideUrl: body.visualization.sideUrl,
        topUrl: body.visualization.topUrl,
      }),
    })
  );
});
