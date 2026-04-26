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

  it("redirects authenticated users to the dashboard", async () => {
    mockedAuth.mockResolvedValue({
      user: { id: "user-1" },
      expires: "2099-01-01",
    });

    await Home();

    expect(mockedRedirect).toHaveBeenCalledWith("/dashboard");
  });
});
