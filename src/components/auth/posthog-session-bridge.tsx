"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import posthog from "posthog-js";

/**
 * Re-runs `posthog.identify` whenever a session becomes available client-side.
 * Required so users who sign in via Google OAuth (where there is no form
 * submit handler to identify from) get linked to their anonymous PostHog
 * person, preserving first-touch attribution captured on the landing page.
 */
export function PostHogSessionBridge() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;
    const email = session?.user?.email;
    if (!email) return;

    const currentDistinctId =
      typeof posthog.get_distinct_id === "function"
        ? posthog.get_distinct_id()
        : null;
    if (currentDistinctId === email) return;

    posthog.identify(email, { email });
  }, [status, session?.user?.email]);

  return null;
}
