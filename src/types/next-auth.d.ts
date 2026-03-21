import type { DefaultSession } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";
import type { SubscriptionTier } from "@/lib/subscription-plans";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      tier: SubscriptionTier;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    tier?: SubscriptionTier;
  }
}
