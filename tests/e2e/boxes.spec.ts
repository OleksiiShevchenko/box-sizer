import { test, expect } from "@playwright/test";
import { prisma } from "../../src/lib/prisma";
import { createIsolatedTestUser, loginAs, QA_BOXES } from "./helpers/test-user";

test.describe("Box Settings", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/settings/boxes");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Box Settings / Authenticated", () => {
  async function getSeededBox(userId: string, name: string) {
    const box = await prisma.box.findFirst({
      where: { userId, name },
      select: { id: true, maxWeight: true },
    });

    if (!box) {
      throw new Error(`Expected seeded box ${name}`);
    }

    return box;
  }

  test("allows editing an existing box", async ({ page }) => {
    const boxName = "QA-04 Mailer 24x12x18";
    const updatedBoxName = `${boxName} Updated`;
    const credentials = await createIsolatedTestUser({
      prefix: "boxes-authenticated",
      boxes: QA_BOXES,
    });

    const seededBox = await getSeededBox(credentials.userId, boxName);
    expect(seededBox.maxWeight).not.toBeNull();

    await loginAs(page, credentials);
    await page.goto("/settings/boxes");

    const boxHeading = page.getByRole("heading", { name: boxName, exact: true });
    const boxRow = boxHeading
      .locator("xpath=ancestor::div[contains(@class, 'justify-between')][1]");
    await boxRow.getByRole("button", { name: "Edit" }).click();

    const dialog = page.getByRole("dialog", { name: `Edit ${boxName}` });
    await expect(dialog).toBeVisible();
    const boxNameInput = dialog.getByLabel("Box Name");
    await boxNameInput.fill(updatedBoxName);
    await expect(boxNameInput).toHaveValue(updatedBoxName);
    await dialog.getByRole("button", { name: "Save Changes" }).click();

    await expect(dialog).not.toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name: updatedBoxName, exact: true })).toBeVisible();

    const updatedBox = await prisma.box.findUniqueOrThrow({
      where: { id: seededBox.id },
      select: { name: true },
    });
    expect(updatedBox.name).toBe(updatedBoxName);
  });
});
