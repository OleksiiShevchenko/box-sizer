"use client";

import { useState, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { CALENDLY_DEMO_URL } from "@/lib/calendly";

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string }) => void;
    };
  }
}

const CALENDLY_WIDGET_SCRIPT_ID = "calendly-widget-script";
const CALENDLY_WIDGET_STYLES_ID = "calendly-widget-styles";
const CALENDLY_WIDGET_SCRIPT_SRC = "https://calendly.com/assets/external/widget.js";
const CALENDLY_WIDGET_STYLES_HREF = "https://calendly.com/assets/external/widget.css";

let calendlyAssetsPromise: Promise<void> | null = null;
let calendlyPopupActive = false;
let calendlyMessageListenerInstalled = false;

export function resetDemoBookingButtonStateForTests() {
  calendlyAssetsPromise = null;
  calendlyPopupActive = false;
  calendlyMessageListenerInstalled = false;
}

function ensureCalendlyMessageListener() {
  if (typeof window === "undefined" || calendlyMessageListenerInstalled) {
    return;
  }

  window.addEventListener("message", (event: MessageEvent<{ event?: string }>) => {
    if (!event.origin.includes("calendly.com")) {
      return;
    }

    const eventName = event.data?.event;
    if (
      eventName === "calendly.popup_closed" ||
      eventName === "calendly.event_scheduled"
    ) {
      calendlyPopupActive = false;
    }
  });

  calendlyMessageListenerInstalled = true;
}

function ensureCalendlyAssets(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (!document.getElementById(CALENDLY_WIDGET_STYLES_ID)) {
    const stylesheet = document.createElement("link");
    stylesheet.id = CALENDLY_WIDGET_STYLES_ID;
    stylesheet.rel = "stylesheet";
    stylesheet.href = CALENDLY_WIDGET_STYLES_HREF;
    document.head.appendChild(stylesheet);
  }

  if (window.Calendly?.initPopupWidget) {
    return Promise.resolve();
  }

  if (calendlyAssetsPromise) {
    return calendlyAssetsPromise;
  }

  calendlyAssetsPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(CALENDLY_WIDGET_SCRIPT_ID) as
      | HTMLScriptElement
      | null;

    const handleLoad = () => resolve();
    const handleError = () => {
      calendlyAssetsPromise = null;
      reject(new Error("Failed to load Calendly widget"));
    };

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad, { once: true });
      existingScript.addEventListener("error", handleError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = CALENDLY_WIDGET_SCRIPT_ID;
    script.src = CALENDLY_WIDGET_SCRIPT_SRC;
    script.async = true;
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    document.body.appendChild(script);
  });

  return calendlyAssetsPromise;
}

interface DemoBookingButtonProps {
  children: ReactNode;
  className?: string;
}

export function DemoBookingButton({
  children,
  className = "",
  onClick,
  ...props
}: DemoBookingButtonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  const [loading, setLoading] = useState(false);

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }

    if (calendlyPopupActive && document.querySelector(".calendly-overlay")) {
      return;
    }

    setLoading(true);

    try {
      ensureCalendlyMessageListener();
      await ensureCalendlyAssets();
      if (window.Calendly?.initPopupWidget) {
        calendlyPopupActive = true;
        window.Calendly.initPopupWidget({ url: CALENDLY_DEMO_URL });
        return;
      }
    } catch {
      // Fall through to opening the booking page directly.
    } finally {
      setLoading(false);
    }

    calendlyPopupActive = false;
    window.open(CALENDLY_DEMO_URL, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      type="button"
      className={className}
      aria-busy={loading}
      disabled={loading}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}
