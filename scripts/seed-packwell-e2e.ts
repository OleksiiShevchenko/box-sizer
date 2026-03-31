import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import {
  PACKWELL_E2E_EMAIL,
  PACKWELL_E2E_PASSWORD,
  QA_BOXES,
} from "../tests/fixtures/packwell-core";

export function getPackwellE2ECredentials() {
  return {
    email: PACKWELL_E2E_EMAIL,
    password: PACKWELL_E2E_PASSWORD,
  };
}

export async function ensurePackwellE2ESeeded() {
  const { email, password } = getPackwellE2ECredentials();
  const passwordHash = await bcrypt.hash(password, 10);
  const verifiedAt = new Date("2026-03-30T00:00:00.000Z");

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: "Packwell E2E",
      emailVerified: verifiedAt,
      password: passwordHash,
      unitSystem: "cm",
    },
    create: {
      name: "Packwell E2E",
      email,
      emailVerified: verifiedAt,
      password: passwordHash,
      unitSystem: "cm",
    },
  });

  await prisma.$transaction(async (tx) => {
    await tx.packingPlan.deleteMany({
      where: { userId: user.id },
    });
    await tx.calculationUsage.deleteMany({
      where: { userId: user.id },
    });
    await tx.box.deleteMany({
      where: { userId: user.id },
    });
    await tx.box.createMany({
      data: QA_BOXES.map((box) => ({
        userId: user.id,
        name: box.name,
        width: box.width,
        height: box.height,
        depth: box.depth,
        spacing: box.spacing,
        maxWeight: box.maxWeight,
      })),
    });
  });

  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {
      stripeCustomerId: `e2e-customer-${user.id}`,
      tier: "business",
      status: "active",
      stripeSubscriptionId: null,
      stripePriceId: null,
      billingInterval: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    },
    create: {
      userId: user.id,
      stripeCustomerId: `e2e-customer-${user.id}`,
      tier: "business",
      status: "active",
      stripeSubscriptionId: null,
      stripePriceId: null,
      billingInterval: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    },
  });

  return {
    userId: user.id,
    email,
    password,
  };
}

async function main() {
  const seed = await ensurePackwellE2ESeeded();
  console.log(`Seeded Packwell E2E user ${seed.email} with ${QA_BOXES.length} boxes.`);
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
