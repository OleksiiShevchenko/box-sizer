import bcrypt from "bcryptjs";
import type { Page } from "@playwright/test";
import { prisma } from "../../../src/lib/prisma";
import { QA_BOXES, type SeedBox } from "../../fixtures/packwell-core";

const DEFAULT_PASSWORD = "Packwell123!";

function addUtcMonthsClamped(value: Date, months: number): Date {
  const monthIndex = value.getUTCFullYear() * 12 + value.getUTCMonth() + months;
  const normalizedMonth = ((monthIndex % 12) + 12) % 12;
  const year = (monthIndex - normalizedMonth) / 12;
  const lastDayOfMonth = new Date(Date.UTC(year, normalizedMonth + 1, 0)).getUTCDate();
  const day = Math.min(value.getUTCDate(), lastDayOfMonth);

  return new Date(
    Date.UTC(
      year,
      normalizedMonth,
      day,
      value.getUTCHours(),
      value.getUTCMinutes(),
      value.getUTCSeconds(),
      value.getUTCMilliseconds()
    )
  );
}

function buildUniqueEmail(prefix: string): string {
  const sanitizedPrefix = prefix.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${sanitizedPrefix}-${uniqueSuffix}@example.com`;
}

export async function createIsolatedTestUser(options: {
  prefix: string;
  name?: string;
  boxes?: SeedBox[];
  usageCount?: number;
}) {
  const now = new Date();
  const password = DEFAULT_PASSWORD;
  const email = buildUniqueEmail(options.prefix);
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: options.name ?? options.prefix,
      email,
      emailVerified: now,
      password: passwordHash,
      unitSystem: "cm",
    },
  });

  await prisma.subscription.create({
    data: {
      userId: user.id,
      tier: "starter",
      status: "active",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      stripePriceId: null,
      billingInterval: null,
      currentPeriodStart: now,
      currentPeriodEnd: addUtcMonthsClamped(now, 1),
      cancelAtPeriodEnd: false,
    },
  });

  if ((options.boxes ?? []).length > 0) {
    await prisma.box.createMany({
      data: (options.boxes ?? []).map((box) => ({
        userId: user.id,
        name: box.name,
        width: box.width,
        height: box.height,
        depth: box.depth,
        spacing: box.spacing,
        maxWeight: box.maxWeight,
      })),
    });
  }

  if ((options.usageCount ?? 0) > 0) {
    await prisma.calculationUsage.createMany({
      data: Array.from({ length: options.usageCount ?? 0 }, () => ({
        userId: user.id,
      })),
    });
  }

  return {
    userId: user.id,
    email,
    password,
  };
}

export async function loginAs(page: Page, credentials: { email: string; password: string }) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(credentials.email);
  await page.getByLabel("Password").fill(credentials.password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL("**/dashboard");
}

export { QA_BOXES };
