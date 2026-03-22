import { render, screen } from "@testing-library/react";
import { UsageWidget } from "./usage-widget";

describe("UsageWidget", () => {
  it("renders progress for capped tiers", () => {
    render(
      <UsageWidget
        subscriptionInfo={{
          tier: "starter",
          planName: "Starter",
          status: "active",
          billingInterval: null,
          usageCount: 6,
          usageLimit: 15,
          hasApiAccess: false,
          currentPeriodStart: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
        }}
      />
    );

    expect(screen.getByText("6 / 15 calculations used")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Monthly usage" })).toHaveAttribute(
      "aria-valuenow",
      "40"
    );
    expect(screen.getByRole("link", { name: "Upgrade Plan" })).toHaveAttribute(
      "href",
      "/pricing"
    );
  });

  it("hides itself for unlimited plans", () => {
    const { container } = render(
      <UsageWidget
        subscriptionInfo={{
          tier: "business",
          planName: "Business",
          status: "active",
          billingInterval: "annual",
          usageCount: 42,
          usageLimit: null,
          hasApiAccess: true,
          currentPeriodStart: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
          stripeCustomerId: "cus_123",
          stripeSubscriptionId: "sub_123",
        }}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
