import { test, expect } from "@playwright/test";
import { prisma } from "../../src/lib/prisma";
import { PACKWELL_ITEMS } from "../fixtures/packwell-core";
import { createIsolatedTestUser, loginAs, QA_BOXES } from "./helpers/test-user";
test.describe.configure({ mode: "serial" });

test("renders the empty packing plans dashboard state", async ({ page }) => {
  const credentials = await createIsolatedTestUser({
    prefix: "dashboard-empty",
    boxes: [],
  });

  await loginAs(page, credentials);

  await expect(page.locator("h1", { hasText: "Packing plans" })).toBeVisible();
  await expect(page.getByText("Current Period Usage")).toBeVisible();
  await expect(page.getByText("0 / 50 calculations used")).toBeVisible();
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
  const credentials = await createIsolatedTestUser({
    prefix: "dashboard-populated",
    boxes: [QA_BOXES[1]!],
    usageCount: 1,
  });
  const defaultBox = await prisma.box.findFirstOrThrow({
    where: { userId: credentials.userId, name: QA_BOXES[1]!.name },
  });

  for (let index = 0; index < 12; index += 1) {
    await prisma.packingPlan.create({
      data: {
        userId: credentials.userId,
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
    });
  }

  await loginAs(page, credentials);

  await expect(page.getByText("Current Period Usage")).toBeVisible();
  await expect(page.getByText("1 / 50 calculations used")).toBeVisible();
  await expect(page.getByRole("heading", { name: "All packing plans", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "New Packing Plan" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Packing plan" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Dimensional weight" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Dashboard Plan \d{2}/ })).toHaveCount(10);
  await expect(page.getByText("Showing 1-10 of 12 packing plans")).toBeVisible();
  await expect(page.getByRole("link", { name: "2", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Next", exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Next", exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.getByRole("link", { name: /Dashboard Plan \d{2}/ })).toHaveCount(2);
  await expect(page.getByText("Showing 11-12 of 12 packing plans")).toBeVisible();
});
