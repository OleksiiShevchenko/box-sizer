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
    const widget = page.getByTestId("hero-packing-visualization").first();
    const legendCard = page.getByTestId("hero-legend-card");
    const savingsLine = page.getByTestId("hero-savings-line");

    await expect(hero).toBeVisible({ timeout: 30000 });
    await expect(widget).toBeVisible({ timeout: 30000 });
    await expect(widget.locator("canvas")).toBeVisible({ timeout: 30000 });
    await expect(legendCard).toBeVisible({ timeout: 30000 });
    await expect(hero.getByTestId("hero-recommendation-card")).toHaveCount(0);
    await expect(
      legendCard.getByRole("heading", {
        name: "Optimal Recommendation: Medium box",
      })
    ).toBeVisible();
    await expect(savingsLine.getByText("Shipping Savings:")).toBeVisible();
    await expect(savingsLine.getByText("$4.22")).toBeVisible();
    await expect(legendCard.getByText("Dimensions: 10.0 x 10.0 x 10.0 in")).toBeVisible();
    await expect(legendCard.getByText("10 units")).toBeVisible();
    await expect(legendCard.locator("span.text-gray-600").first()).toHaveText("Item 1");
    await expect(legendCard.locator("span.text-gray-600").last()).toHaveText("Item 7");
    await expect(hero.getByText("Fill Saved")).toHaveCount(0);
    await expect(hero.locator('img[src="/hero-box.png"]')).toHaveCount(0);

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

    const widget = page.getByTestId("hero-packing-visualization").first();
    const legendCard = page.getByTestId("hero-legend-card");
    const savingsLine = page.getByTestId("hero-savings-line");

    await expect(widget).toBeVisible({ timeout: 30000 });
    await expect(widget.locator("canvas")).toBeVisible({ timeout: 30000 });
    await legendCard.scrollIntoViewIfNeeded();
    await expect(legendCard).toBeVisible();
    await expect(savingsLine).toBeVisible();
  });
});
