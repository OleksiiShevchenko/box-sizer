import { render, screen } from "@testing-library/react";
import DemoPage from "./page";
import posthog from "posthog-js";

jest.mock("posthog-js", () => ({
  capture: jest.fn(),
}));

jest.mock("@/components/marketing/demo-booking-button", () => ({
  DemoBookingButton: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));

jest.mock("@/components/layout/packwell-logo", () => ({
  PackwellLogo: () => <span>Packwell</span>,
}));

describe("DemoPage", () => {
  beforeEach(() => {
    jest.mocked(posthog).capture.mockReset();
  });

  it("renders the public demo with the initial scenario-selection step", () => {
    render(<DemoPage />);

    expect(screen.getByText("Try Packwell on a sample order")).toBeInTheDocument();
    expect(screen.getByTestId("demo-step-1")).toBeInTheDocument();
    expect(screen.getByTestId("demo-scenario-selector")).toBeInTheDocument();
  });
});
