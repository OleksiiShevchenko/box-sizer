import { act, render } from "@testing-library/react";
import { GoogleAdsSignupConversion } from "./google-ads-signup-conversion";
import {
  SIGNUP_CONVERSION_CURRENCY,
  SIGNUP_CONVERSION_SEND_TO,
  SIGNUP_CONVERSION_VALUE,
} from "@/lib/google-ads";

describe("GoogleAdsSignupConversion", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    window.gtag = jest.fn();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
    delete window.gtag;
    jest.restoreAllMocks();
  });

  it("fires the configured Google Ads signup conversion once", async () => {
    render(<GoogleAdsSignupConversion />);

    await act(async () => {
      await Promise.resolve();
    });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(window.gtag).toHaveBeenCalledTimes(1);
    expect(window.gtag).toHaveBeenCalledWith("event", "conversion", {
      send_to: SIGNUP_CONVERSION_SEND_TO,
      value: SIGNUP_CONVERSION_VALUE,
      currency: SIGNUP_CONVERSION_CURRENCY,
      event_callback: expect.any(Function),
      event_timeout: 2000,
    });
  });

  it("does not fire when a conversion claim is rejected", async () => {
    jest.mocked(fetch).mockResolvedValue(
      Response.json({ claimed: false }, { status: 409 }),
    );

    render(<GoogleAdsSignupConversion claimUrl="/api/claim" />);

    await act(async () => {
      await Promise.resolve();
    });
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(fetch).toHaveBeenCalledWith("/api/claim", {
      method: "POST",
      credentials: "same-origin",
    });
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it("skips claims and gtag when conversion firing is disabled", async () => {
    render(
      <GoogleAdsSignupConversion claimUrl="/api/claim" fireConversion={false} />,
    );

    await act(async () => {
      await Promise.resolve();
    });
    act(() => {
      jest.advanceTimersByTime(1200);
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it("fires after a conversion claim succeeds", async () => {
    jest.mocked(fetch).mockResolvedValue(Response.json({ claimed: true }));

    render(<GoogleAdsSignupConversion claimUrl="/api/claim" />);

    await act(async () => {
      await Promise.resolve();
    });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(window.gtag).toHaveBeenCalledTimes(1);
  });
});
