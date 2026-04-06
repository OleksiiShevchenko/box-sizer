import { render, screen } from "@testing-library/react";
import { MarketingPricingSection } from "./marketing-pricing-section";

describe("MarketingPricingSection", () => {
  it("renders the shared subscription catalog on the homepage", () => {
    render(<MarketingPricingSection />);

    expect(screen.getByRole("heading", { name: "Starter" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Growth" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pro" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Scale" })).toBeInTheDocument();
    expect(screen.getByText("$49")).toBeInTheDocument();
    expect(screen.getByText("$149")).toBeInTheDocument();
    expect(screen.getByText("Most popular")).toBeInTheDocument();
    expect(screen.getByText("Contact sales")).toBeInTheDocument();
  });
});
