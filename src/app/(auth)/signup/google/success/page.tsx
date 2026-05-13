import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { GoogleAdsSignupConversion } from "@/components/marketing/google-ads-signup-conversion";
import { isProductionDeployment } from "@/lib/vercel-env";

const GOOGLE_SIGNUP_CONVERSION_WINDOW_MS = 10 * 60 * 1000;
const GOOGLE_SIGNUP_CONVERSION_CLAIM_URL =
  "/api/marketing/google-signup-conversion/claim";

async function findRecentGoogleSignup(userId: string) {
  const cutoff = new Date(Date.now() - GOOGLE_SIGNUP_CONVERSION_WINDOW_MS);

  return prisma.user.findFirst({
    where: {
      id: userId,
      createdAt: { gte: cutoff },
      accounts: {
        some: { provider: "google" },
      },
    },
    select: { id: true },
  });
}

export default async function GoogleSignupSuccessPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/signup");
  }

  const shouldFireConversion = isProductionDeployment();

  // The DB lookup only guards a paid conversion fire — skip it on
  // non-production deployments where we won't fire anything.
  if (shouldFireConversion) {
    const recentGoogleSignup = await findRecentGoogleSignup(userId);
    if (!recentGoogleSignup) {
      redirect("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <GoogleAdsSignupConversion
        claimUrl={
          shouldFireConversion ? GOOGLE_SIGNUP_CONVERSION_CLAIM_URL : undefined
        }
        fireConversion={shouldFireConversion}
        redirectTo="/dashboard"
      />
      <Card className="w-full max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold mb-2">Completing sign up</h1>
        <p className="text-gray-600">
          Your account is ready. Redirecting to your dashboard...
        </p>
      </Card>
    </div>
  );
}
