"use client";

import { useEffect, useRef } from "react";
import {
  SIGNUP_CONVERSION_CURRENCY,
  SIGNUP_CONVERSION_SEND_TO,
  SIGNUP_CONVERSION_VALUE,
} from "@/lib/google-ads";

declare global {
  interface Window {
    gtag?: (
      command: "event",
      eventName: "conversion",
      params: {
        send_to: string;
        value: number;
        currency: string;
        event_callback?: () => void;
        event_timeout?: number;
      },
    ) => void;
  }
}

interface GoogleAdsSignupConversionProps {
  claimUrl?: string;
  fireConversion?: boolean;
  redirectTo?: string;
}

export function GoogleAdsSignupConversion({
  claimUrl,
  fireConversion = true,
  redirectTo,
}: GoogleAdsSignupConversionProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    let didFinish = false;
    const finish = () => {
      if (didFinish) return;
      didFinish = true;
      if (redirectTo) {
        window.location.assign(redirectTo);
      }
    };

    if (!fireConversion) {
      const timeoutId = window.setTimeout(finish, 1200);
      return () => window.clearTimeout(timeoutId);
    }

    const claimConversion = async () => {
      if (!claimUrl) return true;

      try {
        const response = await fetch(claimUrl, {
          method: "POST",
          credentials: "same-origin",
        });
        if (!response.ok) return false;

        const body = (await response.json()) as { claimed?: boolean };
        return body.claimed === true;
      } catch {
        return false;
      }
    };

    const sendConversion = () => {
      const gtag = window.gtag;
      if (typeof gtag !== "function") {
        finish();
        return;
      }

      gtag("event", "conversion", {
        send_to: SIGNUP_CONVERSION_SEND_TO,
        value: SIGNUP_CONVERSION_VALUE,
        currency: SIGNUP_CONVERSION_CURRENCY,
        event_callback: finish,
        event_timeout: 2000,
      });

      if (!redirectTo) return;
      window.setTimeout(finish, 2200);
    };

    let attempts = 0;
    let intervalId: number | undefined;

    const waitForTag = () => {
      attempts += 1;
      if (typeof window.gtag === "function") {
        window.clearInterval(intervalId);
        sendConversion();
        return;
      }

      if (attempts >= 20) {
        window.clearInterval(intervalId);
        finish();
      }
    };

    claimConversion().then((claimed) => {
      if (!claimed) {
        finish();
        return;
      }

      intervalId = window.setInterval(waitForTag, 100);
    });

    return () => {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
  }, [claimUrl, fireConversion, redirectTo]);

  return null;
}
