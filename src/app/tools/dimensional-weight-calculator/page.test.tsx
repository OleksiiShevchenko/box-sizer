import { render, screen } from "@testing-library/react";
import DimensionalWeightCalculatorPage, { metadata } from "./page";

jest.mock("@/components/marketing/scroll-reveal", () => ({
  ScrollReveal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@/components/layout/packwell-logo", () => ({
  PackwellLogo: () => <span>Packwell</span>,
}));

jest.mock("@/components/layout/instant-scroll-link", () => ({
  InstantScrollLink: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

jest.mock("@/components/marketing/demo-booking-button", () => ({
  DemoBookingButton: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));

jest.mock("@/components/tools/dimensional-weight-calculator", () => ({
  DimensionalWeightCalculator: () => <div data-testid="calculator" />,
}));

jest.mock("@/components/tools/dimensional-weight-demo-link", () => ({
  DimensionalWeightDemoLink: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href="/demo" className={className}>
      {children}
    </a>
  ),
}));

describe("DimensionalWeightCalculatorPage", () => {
  it("exports SEO metadata", () => {
    expect(metadata).toMatchObject({
      title: "Dimensional Weight Calculator | Packwell",
      description:
        "Calculate dimensional weight and estimated billable weight for UPS, FedEx, USPS, and DHL. See how package size affects shipping weight and box selection.",
    });
  });

  it("renders the calculator, CTA, and educational content", () => {
    render(<DimensionalWeightCalculatorPage />);

    expect(
      screen.getByRole("heading", { name: "Dimensional Weight Calculator" })
    ).toBeInTheDocument();
    expect(screen.getByTestId("calculator")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Want to know the right box before checkout?",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "What is dimensional weight?" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "How Packwell helps with box sizing" })
    ).toBeInTheDocument();
  });
});
