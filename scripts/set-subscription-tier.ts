import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { prisma } from "../src/lib/prisma";
import { isSubscriptionTier } from "../src/lib/subscription-plans";

/**
 * Manually set a customer's subscription tier.
 *
 * Primary use: grant a customer the unlimited "enterprise" plan, which has no
 * self-serve Stripe price and can only be assigned out-of-band.
 *
 * Usage:
 *   tsx scripts/set-subscription-tier.ts <email> <tier>
 *   npm run set:tier -- customer@example.com enterprise
 */
async function main() {
  const [email, tier] = process.argv.slice(2);

  if (!email || !tier) {
    console.error("Usage: tsx scripts/set-subscription-tier.ts <email> <tier>");
    process.exit(1);
  }

  if (!isSubscriptionTier(tier)) {
    console.error(`Invalid tier "${tier}". Expected one of: starter, growth, pro, enterprise.`);
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });

  if (!user) {
    console.error(`No user found with email "${email}".`);
    process.exit(1);
  }

  const subscription = await prisma.subscription.upsert({
    where: { userId: user.id },
    update: { tier, status: "active" },
    create: { userId: user.id, tier, status: "active" },
  });

  console.log(`Set ${user.email} to tier "${subscription.tier}" (status: ${subscription.status}).`);
  if (tier === "enterprise") {
    console.log("Enterprise grants unlimited calculations.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
