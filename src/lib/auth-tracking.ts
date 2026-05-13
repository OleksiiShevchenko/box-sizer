import { cookies } from "next/headers";
import { getPostHogClient } from "@/lib/posthog-server";

const POSTHOG_COOKIE_PREFIX = "ph_";
const POSTHOG_COOKIE_SUFFIX = "_posthog";

export interface AttributionContext {
  gclid?: string;
  gad_source?: string;
  gbraid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

const ATTRIBUTION_KEYS: (keyof AttributionContext)[] = [
  "gclid",
  "gad_source",
  "gbraid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
];

export async function readAttributionFromCookies(): Promise<AttributionContext> {
  try {
    const store = await cookies();
    const phCookie = store
      .getAll()
      .find(
        (c) =>
          c.name.startsWith(POSTHOG_COOKIE_PREFIX) &&
          c.name.endsWith(POSTHOG_COOKIE_SUFFIX),
      );

    if (!phCookie) return {};

    const parsed = JSON.parse(decodeURIComponent(phCookie.value)) as Record<
      string,
      unknown
    >;

    // posthog-js writes the first-touch context as
    //   $initial_person_info: { u: <initial URL>, r: <referrer> }
    // The UTM/click-id values live in `u`'s query string, not as a parsed map.
    const personInfo = parsed["$initial_person_info"] as
      | { u?: string; r?: string }
      | undefined;
    const initialUrl = personInfo?.u;
    if (typeof initialUrl !== "string" || initialUrl.length === 0) {
      return {};
    }

    let params: URLSearchParams;
    try {
      params = new URL(initialUrl).searchParams;
    } catch {
      return {};
    }

    const result: AttributionContext = {};
    for (const key of ATTRIBUTION_KEYS) {
      const value = params.get(key);
      if (value) result[key] = value;
    }
    return result;
  } catch {
    return {};
  }
}

interface AuthTrackingUser {
  id: string;
  email: string;
}

interface SignupArgs {
  user: AuthTrackingUser;
  method: "google" | "email";
  provider: "google" | "email";
  tier?: string;
  attribution?: AttributionContext;
  /**
   * Whether to capture `signup_completed`.
   * The email/password flow captures `signup_submitted` client-side, so
   * this is set to `false` there to avoid double-counting the funnel step.
   */
  captureSignupCompleted?: boolean;
}

export async function trackUserRegistered(args: SignupArgs): Promise<void> {
  const attribution = args.attribution ?? (await readAttributionFromCookies());
  const tier = args.tier ?? "starter";
  const client = getPostHogClient();

  client.identify({
    distinctId: args.user.email,
    properties: {
      email: args.user.email,
      user_id: args.user.id,
      ...attribution,
    },
  });

  const baseProps = {
    email: args.user.email,
    user_id: args.user.id,
    method: args.method,
    provider: args.provider,
    tier,
    ...attribution,
  };

  if (args.captureSignupCompleted !== false) {
    client.capture({
      distinctId: args.user.email,
      event: "signup_completed",
      properties: baseProps,
    });
  }

  client.capture({
    distinctId: args.user.email,
    event: "user_registered",
    properties: baseProps,
  });

  client.capture({
    distinctId: args.user.email,
    event: "free_subscription_started",
    properties: {
      ...baseProps,
      plan: tier,
    },
  });
}

interface LoginArgs {
  user: AuthTrackingUser;
  method: "google" | "email";
  provider: "google" | "email";
  attribution?: AttributionContext;
}

export async function trackUserLogin(args: LoginArgs): Promise<void> {
  const attribution = args.attribution ?? (await readAttributionFromCookies());
  const client = getPostHogClient();

  client.identify({
    distinctId: args.user.email,
    properties: {
      email: args.user.email,
      user_id: args.user.id,
      ...attribution,
    },
  });

  client.capture({
    distinctId: args.user.email,
    event: "login_completed",
    properties: {
      email: args.user.email,
      user_id: args.user.id,
      method: args.method,
      provider: args.provider,
      ...attribution,
    },
  });
}
