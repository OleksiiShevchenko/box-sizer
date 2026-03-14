import { test, expect } from "@playwright/test";

// These tests require authentication - they test the UI structure
// For full E2E with auth, a test user or auth bypass would be needed

test.describe("Packaging Settings", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/settings/packaging");
    await expect(page).toHaveURL(/\/login/);
  });
});
