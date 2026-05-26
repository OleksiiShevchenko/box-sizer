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

jest.mock("@/components/marketing/typical-shipping-scenario-section", () => ({
  TypicalShippingScenarioSection: () => (
    <div data-testid="typical-shipping-scenario-section" />
  ),
}));

jest.mock("@/components/marketing/how-packwell-works-section", () => ({
  HowPackwellWorksSection: () => (
    <div data-testid="how-packwell-works-section" />
  ),
}));

jest.mock("@/components/marketing/use-cases-section", () => ({
  UseCasesSection: () => <div data-testid="use-cases-section" />,
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

  it("renders the calculator at the top followed by the educational, scenario, how-it-works, use-cases, and CTA sections", () => {
    render(<DimensionalWeightCalculatorPage />);

    const calculatorHeading = screen.getByRole("heading", {
      name: "Dimensional Weight Calculator",
    });
    expect(calculatorHeading).toBeInTheDocument();
    expect(screen.getByTestId("calculator")).toBeInTheDocument();

    const educationalHeading = screen.getByRole("heading", {
      name: "Understanding dimensional weight",
    });
    const scenarioSection = screen.getByTestId(
      "typical-shipping-scenario-section",
    );
    const howItWorksSection = screen.getByTestId("how-packwell-works-section");
    const useCasesSection = screen.getByTestId("use-cases-section");
    const ctaHeading = screen.getByRole("heading", {
      name: /Stop guessing which box to use\./,
    });

    expect(
      calculatorHeading.compareDocumentPosition(educationalHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      educationalHeading.compareDocumentPosition(scenarioSection) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      scenarioSection.compareDocumentPosition(howItWorksSection) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      howItWorksSection.compareDocumentPosition(useCasesSection) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      useCasesSection.compareDocumentPosition(ctaHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("renders the reduced educational cards", () => {
    render(<DimensionalWeightCalculatorPage />);

    expect(
      screen.getByRole("heading", { name: "What is dimensional weight?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Why carriers use dimensional weight" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Why ecommerce stores undercharge for shipping",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "How box size affects billable weight" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "How to reduce dimensional weight" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "How Packwell helps with box sizing" }),
    ).not.toBeInTheDocument();
  });

  it("renders the redesigned dark CTA with stat, sub-CTA, and carrier badges", () => {
    render(<DimensionalWeightCalculatorPage />);

    expect(
      screen.getByRole("heading", { name: /Stop guessing which box to use\./ }),
    ).toBeInTheDocument();
    expect(screen.getByText("Get started")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Packwell reduces dimensional weight charges by selecting the right packaging before checkout and fulfillment/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /See Box Optimization Demo/ }),
    ).toHaveAttribute("href", "/demo");
    expect(
      screen.getByRole("button", { name: "Talk to sales" }),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("cta-recommended-box-card"),
    ).toBeInTheDocument();
    expect(screen.getByText("Recommended Box")).toBeInTheDocument();
    expect(screen.getByText(/Medium/)).toBeInTheDocument();
    expect(screen.getByText("Calculated instantly")).toBeInTheDocument();
    expect(screen.queryByText(/−32%/)).not.toBeInTheDocument();
    expect(
      screen.queryByText("Average customer result"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Calibrated for")).toBeInTheDocument();
    expect(screen.getByText("UPS")).toBeInTheDocument();
    expect(screen.getByText("FedEx")).toBeInTheDocument();
    expect(screen.getByText("USPS")).toBeInTheDocument();
    expect(screen.getByText("DHL")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        name: "Want to know the right box before checkout?",
      }),
    ).not.toBeInTheDocument();
  });
});
