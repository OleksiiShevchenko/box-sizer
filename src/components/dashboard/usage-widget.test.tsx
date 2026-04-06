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
          usageLimit: 50,
          hasApiAccess: true,
          currentPeriodStart: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
        }}
      />
    );

    expect(screen.getByText("6 / 50 calculations used")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Current period usage" })).toHaveAttribute(
      "aria-valuenow",
      "12"
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
          tier: "pro",
          planName: "Pro",
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
