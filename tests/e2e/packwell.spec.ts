import { test, expect, type Page } from "@playwright/test";
import { ensurePackwellE2ESeeded } from "../../scripts/seed-packwell-e2e";
import { AUTH_STATE_PATH } from "./auth-state";

test.use({ storageState: AUTH_STATE_PATH });
test.describe.configure({ mode: "serial" });

type ProductInput = {
  name: string;
  quantity?: number;
  width: number;
  height: number;
  depth: number;
  weight?: number;
  orientation?: "any" | "horizontal" | "vertical";
  canStackOnTop?: boolean;
  canBePlacedOnTop?: boolean;
};

async function openNewPackingPlan(page: Page) {
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "New Packing Plan" }).click();
  await expect(
    page.getByRole("heading", { name: "Packing plan details" })
  ).toBeVisible();
}

async function addProduct(page: Page, product: ProductInput) {
  await page.getByRole("button", { name: /Add Item/ }).click();
  await expect(page.getByRole("dialog", { name: /Add Item|Edit Item/ })).toBeVisible();

  await page.getByLabel("Product Name").fill(product.name);
  await page.getByLabel("How many units").fill(String(product.quantity ?? 1));
  await page.getByLabel(/Width/).fill(String(product.width));
  await page.getByLabel(/Height/).fill(String(product.height));
  await page.getByLabel(/Depth/).fill(String(product.depth));

  if (product.weight != null) {
    await page.getByLabel(/Weight/).fill(String(product.weight));
  }

  if (product.orientation && product.orientation !== "any") {
    await page
      .locator("#orientation")
      .selectOption(product.orientation);
  }

  if (product.canStackOnTop === false) {
    await page.locator("#canStackOnTop-no").click();
  }

  if (product.canBePlacedOnTop === false) {
    await page.locator("#canBePlacedOnTop-no").click();
  }

  await page.getByRole("button", { name: "Add Product" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
}

async function calculate(page: Page) {
  await page.getByRole("button", { name: /Calculate/ }).click();
}

test.describe("Packwell authenticated flows", () => {
  test.beforeEach(async () => {
    await ensurePackwellE2ESeeded();
  });

  test("shows the seeded QA boxes for the dedicated account", async ({ page }) => {
    await page.goto("/settings/boxes");

    await expect(page.getByRole("heading", { name: "Box Settings" })).toBeVisible();
    await expect(page.getByText("QA-01 Flat 16x6x16")).toBeVisible();
    await expect(page.getByText("QA-05 Spaced 24x15x10")).toBeVisible();
    await expect(page.getByText("QA-09 Cube 32x32x32")).toBeVisible();
  });

  test("creates a packing plan and returns the seeded best available box", async ({
    page,
  }) => {
    await openNewPackingPlan(page);
    await addProduct(page, {
      name: "Base12",
      quantity: 1,
      width: 12,
      height: 10,
      depth: 12,
      weight: 200,
    });
    await addProduct(page, {
      name: "Top10",
      quantity: 1,
      width: 10,
      height: 5,
      depth: 10,
      weight: 150,
    });

    await calculate(page);

    await expect(
      page.getByRole("heading", {
        name: "Recommended Box: QA-02 Cube 16x16x16",
      })
    ).toBeVisible();
  });

  test("editing spacing override recalculates the saved plan into a different box", async ({
    page,
  }) => {
    await openNewPackingPlan(page);
    await addProduct(page, {
      name: "WeightedSpaced",
      quantity: 2,
      width: 11,
      height: 12,
      depth: 9,
      weight: 450,
    });

    await calculate(page);
    await expect(
      page.getByRole("heading", {
        name: "Recommended Box: QA-04 Mailer 24x12x18",
      })
    ).toBeVisible();

    await page.getByLabel(/Spacing Override/).fill("0");
    await calculate(page);

    await expect(
      page.getByRole("heading", {
        name: "Recommended Box: QA-05 Spaced 24x15x10",
      })
    ).toBeVisible();
  });
});
