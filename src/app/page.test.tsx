import { render, screen, within } from "@testing-library/react";
import Home from "./page";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/components/marketing/scroll-reveal", () => ({
  ScrollReveal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@/components/marketing/hero-packing-visualization", () => ({
  HeroPackingVisualization: () => <div data-testid="hero-visualization" />,
}));

jest.mock("@/components/pricing/marketing-pricing-section", () => ({
  MarketingPricingSection: () => <div data-testid="pricing-section" />,
}));

jest.mock("@/components/marketing/demo-booking-button", () => ({
  DemoBookingButton: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
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

const mockedAuth = auth as jest.Mock;
const mockedRedirect = redirect as unknown as jest.Mock;

describe("Home page", () => {
  beforeEach(() => {
    mockedAuth.mockReset();
    mockedRedirect.mockReset();
  });

  it("shows the hero interactive-demo and signup CTAs for unauthenticated users", async () => {
    mockedAuth.mockResolvedValue(null);

    render(await Home());

    const hero = screen.getByTestId("home-hero");
    expect(within(hero).getByRole("link", { name: "Try Interactive Demo" })).toHaveAttribute("href", "/demo");
    expect(within(hero).getByRole("link", { name: "Start Free" })).toHaveAttribute("href", "/signup");
  });

  it("shows homepage navigation links in the requested order", async () => {
    mockedAuth.mockResolvedValue(null);

    render(await Home());

    const nav = screen.getByRole("navigation");
    const productLink = within(nav).getByRole("link", { name: "Product" });
    const howItWorksLink = within(nav).getByRole("link", { name: "How it works" });
    const useCasesLink = within(nav).getByRole("link", { name: "Use cases" });
    const pricingLink = within(nav).getByRole("link", { name: "Pricing" });
    const apiDocsLink = within(nav).getByRole("link", { name: "API Docs" });

    expect(productLink).toHaveAttribute("href", "#features");
    expect(howItWorksLink).toHaveAttribute("href", "#how-it-works");
    expect(useCasesLink).toHaveAttribute("href", "#use-cases");
    expect(pricingLink).toHaveAttribute("href", "#pricing");
    expect(apiDocsLink).toHaveAttribute(
      "href",
      "/api/v1/docs#description/introduction"
    );
    expect(
      productLink.compareDocumentPosition(howItWorksLink) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      howItWorksLink.compareDocumentPosition(useCasesLink) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      useCasesLink.compareDocumentPosition(pricingLink) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      pricingLink.compareDocumentPosition(apiDocsLink) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it("shows the checkout versus carrier pricing example", async () => {
    mockedAuth.mockResolvedValue(null);

    render(await Home());

    expect(
      screen.getByRole("heading", {
        name: "A Typical Shipping Scenario",
      })
    ).toBeVisible();
    expect(
      screen.getByText("Why shipping quotes don't match what you're actually charged")
    ).toBeVisible();
    expect(
      screen.queryByText(
        "A single mixed order can look lightweight at checkout, then price like a much larger package once the carrier applies dimensional weight."
      )
    ).not.toBeInTheDocument();
    expect(screen.getByText("Backpack + Mug + Notebook")).toBeVisible();
    expect(screen.getByText("13 x 8 x 14 in")).toBeVisible();
    expect(screen.getByText("Based on real weight of products")).toBeVisible();
    expect(
      screen.getByText("Based on real and volumetric weight")
    ).toBeVisible();
    expect(screen.getByText("$23.63")).toBeVisible();
    expect(screen.getByText("$53.28")).toBeVisible();
    expect(screen.getByText("Loss on one order: $29.65")).toBeVisible();
  });

  it("shows the features section between the shipping scenario and How Packwell works", async () => {
    mockedAuth.mockResolvedValue(null);

    render(await Home());

    const scenarioHeading = screen.getByRole("heading", {
      name: "A Typical Shipping Scenario",
    });
    const featuresHeading = screen.getByRole("heading", {
      name: "What you get for every shipment",
    });
    const howItWorksHeading = screen.getByRole("heading", {
      name: "How Packwell works",
    });
    const useCasesHeading = screen.getByRole("heading", {
      name: "Built for teams that ship complex orders",
    });
    const ctaHeading = screen.getByRole("heading", {
      name: "Start packing smarter today.",
    });

    expect(screen.queryByText("Stop undercharging for shipping")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /Turn packaging into\s+a cost advantage/ })
    ).not.toBeInTheDocument();
    expect(
      scenarioHeading.compareDocumentPosition(featuresHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      featuresHeading.compareDocumentPosition(howItWorksHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(featuresHeading.closest("section")).toHaveClass("bg-surface-container-low");
    expect(
      screen.getByText(
        "Turn item dimensions, weights, available boxes, and packing rules into the outputs your team needs: the recommended box, accurate carrier quote inputs, and a clear 3D packing plan."
      )
    ).toBeVisible();
    expect(howItWorksHeading.closest("section")).toHaveClass("bg-surface-container-lowest");
    expect(useCasesHeading.closest("section")).toHaveClass("bg-surface-container-low");
    expect(ctaHeading.closest("section")).toHaveClass("bg-surface-container-low");
    const useCaseCard = screen.getByText("Ecommerce Brands").closest("div");
    expect(useCaseCard).toHaveClass("bg-white", "border", "border-outline-variant/40");
    expect(useCaseCard).not.toHaveClass("hover:shadow-lg", "transition-shadow");
    expect(screen.getAllByText("Recommended box")).toHaveLength(2);
    expect(
      screen.getByText(
        "Match each shipment to the best available box using item dimensions, weight, quantity, available packaging, and packing rules."
      )
    ).toBeVisible();
    expect(screen.getByText("Accurate carrier quotes")).toBeVisible();
    expect(
      screen.getByText(
        "Use the recommended box, actual weight, and dimensional weight to calculate shipping cost before the order ships."
      )
    ).toBeVisible();
    expect(screen.getAllByText("3D packing plan")).toHaveLength(2);
    expect(
      screen.getByText(
        "Give your team a visual packing layout showing how items should fit inside the selected box."
      )
    ).toBeVisible();
    expect(screen.getByText("UI and API access")).toBeVisible();
    expect(
      screen.getByText(
        "Run calculations in the Packwell web app or connect the API to checkout, order management, warehouse, or shipping workflows."
      )
    ).toBeVisible();
    const productDiagram = screen.getByTestId("packwell-product-diagram");

    expect(within(productDiagram).getByText("Dimensions & weights")).toBeVisible();
    expect(within(productDiagram).getByText("Quantities")).toBeVisible();
    expect(within(productDiagram).getByText("Available boxes")).toBeVisible();
    expect(within(productDiagram).getByText("Products to ship")).toBeVisible();
    expect(within(productDiagram).getByText("Packing rules")).toBeVisible();
    expect(within(productDiagram).getByText("Packwell calculation")).toBeVisible();
    expect(within(productDiagram).getByTestId("packwell-calculation-icon")).toHaveAttribute(
      "src",
      expect.stringContaining("/marketing/packwell-calculation-icon.svg")
    );
    expect(within(productDiagram).getByText("Quote-ready package data")).toBeVisible();
    expect(
      screen.queryByText("POST /api/v1/packing-plans/calculate")
    ).not.toBeInTheDocument();
    expect(screen.getByText("Step 1")).toBeVisible();
    expect(screen.getByText("Define your packaging options")).toBeVisible();
    expect(screen.getByText("Step 5")).toBeVisible();
    expect(screen.getByText("Pack exactly as planned")).toBeVisible();
    expect(
      screen.getByText(/Use the Packwell UI or REST API to integrate precise box selection/)
    ).toBeVisible();
    expect(
      screen.getByAltText("Packwell box catalog UI showing available shipping boxes")
    ).toBeVisible();
    expect(
      screen.getByAltText("Packing instruction visualization with 3D, front, side, and top views")
    ).toBeVisible();
    const howItWorksSection = screen.getByTestId("how-packwell-section");

    expect(
      within(howItWorksSection).getByText(/Run a sample order through Packwell/)
    ).toBeVisible();
    expect(
      within(howItWorksSection).getByRole("link", { name: "in the interactive demo" })
    ).toHaveAttribute("href", "/demo");
  });

  it("redirects authenticated users to the dashboard", async () => {
    mockedAuth.mockResolvedValue({
      user: { id: "user-1" },
      expires: "2099-01-01",
    });

    await Home();

    expect(mockedRedirect).toHaveBeenCalledWith("/dashboard");
  });
});
