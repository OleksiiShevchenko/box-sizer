import fs from "fs/promises";
import path from "path";
import { chromium, type FullConfig } from "@playwright/test";
import { ensurePackwellE2ESeeded, getPackwellE2ECredentials } from "../../scripts/seed-packwell-e2e";
import { AUTH_STATE_PATH } from "./auth-state";

export default async function globalSetup(config: FullConfig) {
  await ensurePackwellE2ESeeded();

  const browser = await chromium.launch();
  const page = await browser.newPage({
    baseURL: config.projects[0]?.use?.baseURL as string | undefined,
  });
  const { email, password } = getPackwellE2ECredentials();

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL("**/dashboard");

  await fs.mkdir(path.dirname(AUTH_STATE_PATH), { recursive: true });
  await page.context().storageState({ path: AUTH_STATE_PATH });
  await browser.close();
}
