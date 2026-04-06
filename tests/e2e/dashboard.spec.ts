import { test, expect } from "@playwright/test";
import { prisma } from "../../src/lib/prisma";
import { ensurePackwellE2ESeeded } from "../../scripts/seed-packwell-e2e";
import { PACKWELL_E2E_EMAIL, PACKWELL_ITEMS } from "../fixtures/packwell-core";
import { AUTH_STATE_PATH } from "./auth-state";

test.use({ storageState: AUTH_STATE_PATH });
test.describe.configure({ mode: "serial" });

async function getSeededUser() {
  return prisma.user.findUniqueOrThrow({
    where: { email: PACKWELL_E2E_EMAIL },
    include: { boxes: true },
  });
}

async function setupEmptyDashboardState() {
  const { userId } = await ensurePackwellE2ESeeded();

  await prisma.subscription.update({
    where: { userId },
    data: { tier: "starter" },
  });

  await prisma.box.deleteMany({
    where: { userId },
  });
}

async function setupPopulatedDashboardState() {
  const { userId } = await ensurePackwellE2ESeeded();

  await prisma.subscription.update({
    where: { userId },
    data: { tier: "starter" },
  });

  await prisma.calculationUsage.create({
    data: { userId },
  });

  const user = await getSeededUser();
  const defaultBox = user.boxes[1];

  if (!defaultBox) {
    throw new Error("Expected seeded dashboard verification box");
  }

  await Promise.all(
    Array.from({ length: 12 }, (_, index) =>
      prisma.packingPlan.create({
        data: {
          userId,
          name: `Dashboard Plan ${String(index + 1).padStart(2, "0")}`,
          boxId: defaultBox.id,
          dimensionalWeight: 20 + index,
          items: {
            create: [
              {
                ...PACKWELL_ITEMS.base12(),
              },
            ],
          },
        },
      })
    )
  );
}

test("renders the empty packing plans dashboard state", async ({ page }) => {
  await setupEmptyDashboardState();

  await page.goto("/dashboard");

  await expect(page.locator("h1", { hasText: "Packing plans" })).toBeVisible();
  await expect(page.getByText("Current Period Usage")).toBeVisible();
  await expect(page.getByText("0 / 15 calculations used")).toBeVisible();
  await expect(
    page.getByText(
      "Box options are recommended for best-box matching. You can still create packing plans and calculate an ideal custom box."
    )
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Add Boxes" })).toBeVisible();
  await expect(page.getByText("No packing plans yet")).toBeVisible();
  await expect(page.getByRole("button", { name: "New Packing Plan" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "All packing plans" })).toHaveCount(0);
});

test("renders the populated packing plans dashboard state", async ({ page }) => {
  await setupPopulatedDashboardState();

  await page.goto("/dashboard");

  await expect(page.getByText("Current Period Usage")).toBeVisible();
  await expect(page.getByText("1 / 15 calculations used")).toBeVisible();
  await expect(page.getByRole("heading", { name: "All packing plans", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "New Packing Plan" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Packing plan" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Dimensional weight" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Dashboard Plan 12" })).toBeVisible();
  await expect(page.getByText("Showing 1-10 of 12 packing plans")).toBeVisible();
  await expect(page.getByRole("link", { name: "2", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Next", exact: true })).toBeVisible();
});
