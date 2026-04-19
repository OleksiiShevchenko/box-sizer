import { test, expect, type Locator } from "@playwright/test";

test.describe("Interactive demo", () => {
  async function setQuantity(locator: Locator, value: string) {
    await locator.evaluate((input, nextValue) => {
      const element = input as HTMLInputElement;
      element.value = nextValue as string;
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
    }, value);
  }

  test("runs the public demo flow end to end", async ({ page }) => {
    test.slow();
    await page.goto("/");
    const hero = page.getByTestId("home-hero");
    await expect(hero).toBeVisible({ timeout: 30000 });
    await expect(hero.getByRole("link", { name: "Try Interactive Demo" })).toHaveAttribute(
      "href",
      "/demo",
      { timeout: 30000 }
    );

    await page.goto("/demo");
    await expect(page).toHaveURL("/demo", { timeout: 30000 });

    await expect(page.getByTestId("demo-scenario-selector")).toBeVisible({ timeout: 30000 });
    await expect(page.getByAltText("Ecommerce order illustration")).toBeVisible({ timeout: 30000 });
    await expect(page.getByAltText("Gift kit illustration")).toBeVisible({ timeout: 30000 });

    await page.getByTestId("scenario-card-gift-kit").click();
    await expect(page.getByTestId("demo-order-form")).toBeVisible();

    await page.getByRole("button", { name: "Calculate Box" }).click();
    await expect(page.getByText("Best Available Box")).toBeVisible();
    await expect(page.getByText("Ideal Custom Box")).toBeVisible();
    await expect(page.getByText("3D view (width x height x depth)")).toBeVisible();

    await page.goBack();
    await expect(page.getByTestId("demo-order-form")).toBeVisible();
    await expect(page.getByText("No result yet")).toBeVisible();

    await page.goBack();
    await expect(page.getByTestId("demo-scenario-selector")).toBeVisible();

    await page.goto("/demo");
    await expect(page.getByTestId("demo-scenario-selector")).toBeVisible();

    await page.getByTestId("scenario-card-ecommerce-order").click();
    await expect(page.getByTestId("demo-order-form")).toBeVisible();
    await setQuantity(page.getByTestId("demo-item-pair-of-socks").getByLabel("Quantity"), "10");
    await page.getByTestId("demo-item-running-shoes").getByRole("button", { name: "Delete" }).click();
    await expect(page.getByTestId("demo-item-running-shoes")).toHaveCount(0);

    await page.getByRole("button", { name: "Calculate Box" }).click();
    await expect(page.getByText("Best Available Box")).toBeVisible();
    const resultActions = page.getByTestId("demo-result-actions");
    await expect(resultActions.getByRole("link", { name: "Start Free" })).toBeVisible();
    await resultActions.getByRole("link", { name: "Start Free" }).click();
    await expect(page).toHaveURL("/signup");
  });
});
