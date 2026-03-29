import { test, expect } from "@playwright/test";

test.describe("Stacking and Orientation", () => {
  test("redirects unauthenticated users to login when accessing packing plans", async ({ page }) => {
    await page.goto("/dashboard/packing-plans/test-id");
    await expect(page).toHaveURL(/\/login/);
  });
});
