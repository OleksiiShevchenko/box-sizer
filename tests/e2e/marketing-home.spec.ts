import { test, expect } from "@playwright/test";

test.describe("Marketing homepage hero", () => {
  test("replaces the top hero card with a rotating 3D widget", async ({ page }) => {
    test.slow();

    const imageRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/hero-box.png")) {
        imageRequests.push(request.url());
      }
    });

    await page.goto("/");

    const hero = page.getByTestId("home-hero");
    const widget = page.getByTestId("hero-packing-visualization");
    const legendCard = page.getByTestId("hero-legend-card");
    const savingsLine = page.getByTestId("hero-savings-line");

    await expect(hero).toBeVisible({ timeout: 15000 });
    await expect(widget).toBeVisible({ timeout: 15000 });
    await expect(widget.locator("canvas")).toBeVisible({ timeout: 15000 });
    await expect(legendCard).toBeVisible({ timeout: 15000 });
    await expect(hero.getByTestId("hero-recommendation-card")).toHaveCount(0, { timeout: 15000 });
    await expect(
      legendCard.getByRole("heading", {
        name: "Optimal Recommendation: Medium box",
      })
    ).toBeVisible({ timeout: 15000 });
    await expect(savingsLine).toContainText("Shipping Savings:", { timeout: 15000 });
    await expect(savingsLine).toContainText("$4.22", { timeout: 15000 });
    await expect(legendCard.getByText("Dimensions: 10.0 x 10.0 x 10.0 in")).toBeVisible({
      timeout: 15000,
    });
    await expect(legendCard).toContainText("10 units", { timeout: 15000 });
    await expect(legendCard).toContainText("Item 1", { timeout: 15000 });
    await expect(legendCard).toContainText("Item 7", { timeout: 15000 });
    await expect(hero.getByText("Fill Saved")).toHaveCount(0, { timeout: 15000 });

    const angleBefore = await widget.getAttribute("data-rotation-angle");
    await page.waitForTimeout(3500);
    const angleAfter = await widget.getAttribute("data-rotation-angle");

    expect(angleBefore).not.toBeNull();
    expect(angleAfter).not.toBeNull();
    expect(angleAfter).not.toBe(angleBefore);
    expect(imageRequests).toHaveLength(0);

    await expect(page.getByText("Recommended Box", { exact: true }).last()).toBeVisible();
  });

  test("stacks the hero widget below the copy on mobile", async ({ page }) => {
    test.slow();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const widget = page.getByTestId("hero-packing-visualization");
    const legendCard = page.getByTestId("hero-legend-card");
    const savingsLine = page.getByTestId("hero-savings-line");

    await expect(widget).toBeVisible({ timeout: 15000 });
    await expect(widget.locator("canvas")).toBeVisible({ timeout: 15000 });
    await expect(legendCard).toBeVisible({ timeout: 15000 });
    await expect(savingsLine).toBeVisible({ timeout: 15000 });
  });
});
