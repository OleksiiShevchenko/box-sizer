import { render, screen } from "@testing-library/react";
import { MarketingPricingSection } from "./marketing-pricing-section";

describe("MarketingPricingSection", () => {
  it("renders the shared subscription catalog on the homepage", () => {
    render(<MarketingPricingSection />);

    expect(screen.getByRole("heading", { name: "Starter" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Growth" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pro" })).toBeInTheDocument();
    expect(screen.getByText("$29.00")).toBeInTheDocument();
    expect(screen.getByText("$99.00")).toBeInTheDocument();
    expect(screen.getByText("Most popular")).toBeInTheDocument();
  });
});
