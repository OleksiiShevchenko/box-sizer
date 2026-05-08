import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DemoBookingButton,
  resetDemoBookingButtonStateForTests,
} from "./demo-booking-button";
import { CALENDLY_DEMO_URL } from "@/lib/calendly";

describe("DemoBookingButton", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    document.body.innerHTML = "";
    delete window.Calendly;
    jest.restoreAllMocks();
    resetDemoBookingButtonStateForTests();
  });

  it("loads Calendly assets and opens the popup widget", async () => {
    const user = userEvent.setup();
    const initPopupWidget = jest.fn();

    window.Calendly = { initPopupWidget };

    render(
      <DemoBookingButton className="demo-trigger">
        Book a Demo
      </DemoBookingButton>
    );

    await user.click(screen.getByRole("button", { name: "Book a Demo" }));

    await waitFor(() => {
      expect(initPopupWidget).toHaveBeenCalledWith({ url: CALENDLY_DEMO_URL });
    });

    expect(document.getElementById("calendly-widget-styles")).toHaveAttribute(
      "href",
      "https://calendly.com/assets/external/widget.css"
    );
  });

  it("does not initialize the popup twice while one is already active", async () => {
    const user = userEvent.setup();
    const overlay = document.createElement("div");
    overlay.className = "calendly-overlay";
    const initPopupWidget = jest.fn(() => {
      document.body.appendChild(overlay);
    });

    window.Calendly = { initPopupWidget };

    render(
      <DemoBookingButton className="demo-trigger">
        Book a Demo
      </DemoBookingButton>
    );

    const button = screen.getByRole("button", { name: "Book a Demo" });
    await user.click(button);
    await user.click(button);

    await waitFor(() => {
      expect(initPopupWidget).toHaveBeenCalledTimes(1);
    });

    overlay.remove();
    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "https://calendly.com",
        data: { event: "calendly.popup_closed" },
      })
    );

    await user.click(button);

    await waitFor(() => {
      expect(initPopupWidget).toHaveBeenCalledTimes(2);
    });
  });

  it("falls back to a new tab if the Calendly popup cannot initialize", async () => {
    const user = userEvent.setup();
    const open = jest.spyOn(window, "open").mockImplementation(() => null);

    render(
      <DemoBookingButton className="demo-trigger">
        Book a Demo
      </DemoBookingButton>
    );

    const button = screen.getByRole("button", { name: "Book a Demo" });
    await user.click(button);

    const script = document.getElementById("calendly-widget-script");
    expect(script).not.toBeNull();
    script?.dispatchEvent(new Event("error"));

    await waitFor(() => {
      expect(open).toHaveBeenCalledWith(CALENDLY_DEMO_URL, "_blank", "noopener,noreferrer");
    });
    expect(button).not.toBeDisabled();
  });

  it("reuses an existing script element if one is already loading", async () => {
    const user = userEvent.setup();
    const initPopupWidget = jest.fn();

    const existingScript = document.createElement("script");
    existingScript.id = "calendly-widget-script";
    document.body.appendChild(existingScript);

    render(
      <DemoBookingButton className="demo-trigger">
        Book a Demo
      </DemoBookingButton>
    );

    const clickPromise = user.click(screen.getByRole("button", { name: "Book a Demo" }));
    window.Calendly = { initPopupWidget };
    existingScript.dispatchEvent(new Event("load"));
    await clickPromise;

    await waitFor(() => {
      expect(initPopupWidget).toHaveBeenCalledWith({ url: CALENDLY_DEMO_URL });
    });
  });

  it("calls the provided onClick handler before opening Calendly", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    const initPopupWidget = jest.fn();

    window.Calendly = { initPopupWidget };

    render(
      <DemoBookingButton className="demo-trigger" onClick={onClick}>
        Book a Demo
      </DemoBookingButton>
    );

    await user.click(screen.getByRole("button", { name: "Book a Demo" }));

    expect(onClick).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(initPopupWidget).toHaveBeenCalledWith({ url: CALENDLY_DEMO_URL });
    });
  });
});
