import { test, expect } from "@playwright/test";

test.describe("Stacking and Orientation", () => {
  test("redirects unauthenticated users to login when accessing shipments", async ({ page }) => {
    await page.goto("/dashboard/shipments/test-id");
    await expect(page).toHaveURL(/\/login/);
  });
});
