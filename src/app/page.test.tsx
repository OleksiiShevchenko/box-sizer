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

const mockedAuth = jest.mocked(auth);
const mockedRedirect = jest.mocked(redirect);

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

  it("redirects authenticated users to the dashboard", async () => {
    mockedAuth.mockResolvedValue({
      user: { id: "user-1" },
      expires: "2099-01-01",
    } as never);

    await Home();

    expect(mockedRedirect).toHaveBeenCalledWith("/dashboard");
  });
});
