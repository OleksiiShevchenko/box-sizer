import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("landing page shows login and signup links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Log In" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign Up" })).toBeVisible();
  });

  test("login page renders correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Log In" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Continue with Google" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  });

  test("signup page renders correctly", async ({ page }) => {
    await page.goto("/signup");
    await expect(
      page.getByRole("heading", { name: "Create Account" })
    ).toBeVisible();
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Create Account" })
    ).toBeVisible();
  });

  test("protected routes redirect to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("settings page redirects to login when not authenticated", async ({
    page,
  }) => {
    await page.goto("/settings/packaging");
    await expect(page).toHaveURL(/\/login/);
  });

  test("navigate between login and signup", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Sign up" }).click();
    await expect(page).toHaveURL("/signup");

    await page.getByRole("link", { name: "Log in" }).click();
    await expect(page).toHaveURL("/login");
  });

  test("verify-email page shows confirmation message", async ({ page }) => {
    await page.goto("/verify-email");
    await expect(page.getByText("Check your email")).toBeVisible();
  });
});
