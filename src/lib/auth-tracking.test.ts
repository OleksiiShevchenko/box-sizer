const mockCapture = jest.fn();
const mockIdentify = jest.fn();
const mockCookies = jest.fn();

jest.mock("@/lib/posthog-server", () => ({
  getPostHogClient: () => ({
    capture: mockCapture,
    identify: mockIdentify,
  }),
}));

jest.mock("next/headers", () => ({
  cookies: () => mockCookies(),
}));

import { trackUserLogin, trackUserRegistered } from "./auth-tracking";

function makeCookieStore(cookies: { name: string; value: string }[]) {
  return {
    getAll: () => cookies,
  };
}

describe("auth-tracking", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCookies.mockResolvedValue(makeCookieStore([]));
  });

  describe("trackUserRegistered", () => {
    it("identifies and captures signup_completed, user_registered and free_subscription_started for Google OAuth", async () => {
      await trackUserRegistered({
        user: { id: "user-1", email: "alice@example.com" },
        method: "google",
        provider: "google",
        tier: "starter",
      });

      expect(mockIdentify).toHaveBeenCalledWith({
        distinctId: "alice@example.com",
        properties: expect.objectContaining({
          email: "alice@example.com",
          user_id: "user-1",
        }),
      });

      const events = mockCapture.mock.calls.map(([call]) => call.event);
      expect(events).toEqual([
        "signup_completed",
        "user_registered",
        "free_subscription_started",
      ]);

      for (const [call] of mockCapture.mock.calls) {
        expect(call.distinctId).toBe("alice@example.com");
        expect(call.properties).toEqual(
          expect.objectContaining({
            email: "alice@example.com",
            user_id: "user-1",
            method: "google",
            provider: "google",
          }),
        );
      }
    });

    it("skips signup_completed when captureSignupCompleted is false (email flow)", async () => {
      await trackUserRegistered({
        user: { id: "user-2", email: "bob@example.com" },
        method: "email",
        provider: "email",
        captureSignupCompleted: false,
      });

      const events = mockCapture.mock.calls.map(([call]) => call.event);
      expect(events).toEqual(["user_registered", "free_subscription_started"]);
    });

    it("preserves attribution properties read from PostHog cookies", async () => {
      // Real posthog-js cookie shape: $initial_person_info.u is the initial
      // landing URL with attribution params in its query string.
      const initialUrl =
        "https://packwell.io/?utm_source=google&utm_medium=cpc" +
        "&utm_campaign=search-home-page&utm_term=best+box+size+shipping" +
        "&utm_content=ad-1&gclid=abc123&gad_source=1&gbraid=br1";
      const phPayload = encodeURIComponent(
        JSON.stringify({
          $initial_person_info: {
            u: initialUrl,
            r: "https://www.google.com/",
          },
        }),
      );

      mockCookies.mockResolvedValue(
        makeCookieStore([
          { name: "ph_phc_token_posthog", value: phPayload },
        ]),
      );

      await trackUserRegistered({
        user: { id: "user-3", email: "carol@example.com" },
        method: "google",
        provider: "google",
      });

      const userRegisteredCall = mockCapture.mock.calls.find(
        ([c]) => c.event === "user_registered",
      );
      expect(userRegisteredCall?.[0].properties).toEqual(
        expect.objectContaining({
          gclid: "abc123",
          gad_source: "1",
          gbraid: "br1",
          utm_source: "google",
          utm_medium: "cpc",
          utm_campaign: "search-home-page",
          utm_term: "best box size shipping",
          utm_content: "ad-1",
        }),
      );

      expect(mockIdentify.mock.calls[0][0].properties).toEqual(
        expect.objectContaining({
          gclid: "abc123",
          utm_source: "google",
          utm_campaign: "search-home-page",
        }),
      );
    });

    it("returns no attribution when the PostHog cookie has no initial URL", async () => {
      const phPayload = encodeURIComponent(
        JSON.stringify({
          $initial_person_info: { r: "https://www.google.com/" },
          distinct_id: "anon-xyz",
        }),
      );

      mockCookies.mockResolvedValue(
        makeCookieStore([{ name: "ph_phc_token_posthog", value: phPayload }]),
      );

      await trackUserRegistered({
        user: { id: "user-5", email: "no-utm@example.com" },
        method: "google",
        provider: "google",
      });

      const userRegisteredCall = mockCapture.mock.calls.find(
        ([c]) => c.event === "user_registered",
      );
      const props = userRegisteredCall?.[0].properties as Record<string, unknown>;
      expect(props.gclid).toBeUndefined();
      expect(props.utm_source).toBeUndefined();
    });
  });

  describe("trackUserLogin", () => {
    it("identifies and captures login_completed with method google", async () => {
      await trackUserLogin({
        user: { id: "user-4", email: "dave@example.com" },
        method: "google",
        provider: "google",
      });

      expect(mockIdentify).toHaveBeenCalledWith({
        distinctId: "dave@example.com",
        properties: expect.objectContaining({
          email: "dave@example.com",
          user_id: "user-4",
        }),
      });

      expect(mockCapture).toHaveBeenCalledTimes(1);
      const [call] = mockCapture.mock.calls[0];
      expect(call).toEqual({
        distinctId: "dave@example.com",
        event: "login_completed",
        properties: expect.objectContaining({
          email: "dave@example.com",
          user_id: "user-4",
          method: "google",
          provider: "google",
        }),
      });
    });
  });
});
