import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BillingClient } from "./billing-client";

const refresh = jest.fn();
const createBillingPortalSession = jest.fn();
const cancelSubscription = jest.fn();
const resumeSubscription = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh,
  }),
}));

jest.mock("@/actions/subscription-actions", () => ({
  createBillingPortalSession: (...args: unknown[]) => createBillingPortalSession(...args),
  cancelSubscription: (...args: unknown[]) => cancelSubscription(...args),
  resumeSubscription: (...args: unknown[]) => resumeSubscription(...args),
}));

describe("BillingClient", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("renders plan details and banners", () => {
    render(
      <BillingClient
        banner="Checkout completed."
        initialSubscription={{
          tier: "growth",
          planName: "Growth",
          status: "active",
          billingInterval: "monthly",
          usageCount: 12,
          usageLimit: 300,
          hasApiAccess: true,
          currentPeriodStart: null,
          currentPeriodEnd: new Date("2026-04-01T00:00:00.000Z"),
          cancelAtPeriodEnd: false,
          stripeCustomerId: "cus_123",
          stripeSubscriptionId: "sub_123",
        }}
      />
    );

    expect(screen.getByText("Checkout completed.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Growth" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Manage Payment Method" })).toBeInTheDocument();
    expect(screen.getByText("Calculations this billing period")).toBeInTheDocument();
  });

  it("updates local state after canceling a subscription", async () => {
    const user = userEvent.setup();
    cancelSubscription.mockResolvedValue({
      success: true,
      subscription: {
        tier: "growth",
        planName: "Growth",
        status: "active",
        billingInterval: "monthly",
        usageCount: 12,
        usageLimit: 300,
        hasApiAccess: true,
        currentPeriodStart: null,
        currentPeriodEnd: new Date("2026-04-01T00:00:00.000Z"),
        cancelAtPeriodEnd: true,
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_123",
      },
    });

    render(
      <BillingClient
        banner={null}
        initialSubscription={{
          tier: "growth",
          planName: "Growth",
          status: "active",
          billingInterval: "monthly",
          usageCount: 12,
          usageLimit: 300,
          hasApiAccess: true,
          currentPeriodStart: null,
          currentPeriodEnd: new Date("2026-04-01T00:00:00.000Z"),
          cancelAtPeriodEnd: false,
          stripeCustomerId: "cus_123",
          stripeSubscriptionId: "sub_123",
        }}
      />
    );

    await user.click(screen.getByRole("button", { name: "Cancel Subscription" }));

    await waitFor(() => {
      expect(cancelSubscription).toHaveBeenCalled();
      expect(screen.getByRole("button", { name: "Resume Subscription" })).toBeInTheDocument();
      expect(refresh).toHaveBeenCalled();
    });
  });

  it("surfaces billing portal errors", async () => {
    const user = userEvent.setup();
    createBillingPortalSession.mockResolvedValue({ error: "Portal unavailable" });

    render(
      <BillingClient
        banner={null}
        initialSubscription={{
          tier: "growth",
          planName: "Growth",
          status: "active",
          billingInterval: "monthly",
          usageCount: 12,
          usageLimit: 300,
          hasApiAccess: true,
          currentPeriodStart: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
          stripeCustomerId: "cus_123",
          stripeSubscriptionId: "sub_123",
        }}
      />
    );

    await user.click(screen.getByRole("button", { name: "Manage Payment Method" }));

    await waitFor(() => {
      expect(screen.getByText("Portal unavailable")).toBeInTheDocument();
    });
  });

  it("shows a usage reset label for starter plans instead of a renewal label", () => {
    render(
      <BillingClient
        banner={null}
        initialSubscription={{
          tier: "starter",
          planName: "Starter",
          status: "active",
          billingInterval: null,
          usageCount: 3,
          usageLimit: 50,
          hasApiAccess: true,
          currentPeriodStart: new Date("2026-03-01T00:00:00.000Z"),
          currentPeriodEnd: new Date("2026-04-01T12:00:00.000Z"),
          cancelAtPeriodEnd: false,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
        }}
      />
    );

    expect(screen.getByText("Usage period resets on Apr 1, 2026")).toBeInTheDocument();
    expect(screen.queryByText(/Renews on/)).not.toBeInTheDocument();
  });
});
