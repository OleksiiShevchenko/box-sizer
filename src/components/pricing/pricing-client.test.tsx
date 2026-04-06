import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PricingClient } from "./pricing-client";

const push = jest.fn();
const createCheckoutSession = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

jest.mock("@/actions/subscription-actions", () => ({
  createCheckoutSession: (...args: unknown[]) => createCheckoutSession(...args),
}));

describe("PricingClient", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("shows the current starter plan state", () => {
    render(
      <PricingClient currentInterval={null} currentTier="starter" isAuthenticated={true} />
    );

    expect(screen.getByRole("button", { name: "Current Plan" })).toBeDisabled();
    expect(screen.getAllByText("15 calculations per month")).toHaveLength(2);
  });

  it("sends guests to signup for paid tiers", async () => {
    const user = userEvent.setup();

    render(
      <PricingClient currentInterval={null} currentTier={null} isAuthenticated={false} />
    );

    await user.click(screen.getAllByRole("button", { name: "Sign Up" })[0]);

    expect(push).toHaveBeenCalledWith("/signup");
    expect(createCheckoutSession).not.toHaveBeenCalled();
  });

  it("starts checkout for authenticated users", async () => {
    const user = userEvent.setup();
    createCheckoutSession.mockResolvedValue({ error: "Stripe unavailable" });

    render(
      <PricingClient currentInterval="monthly" currentTier="starter" isAuthenticated={true} />
    );

    await user.click(screen.getAllByRole("button", { name: "Select Plan" })[0]);

    await waitFor(() => {
      expect(createCheckoutSession).toHaveBeenCalledWith("growth", "monthly");
      expect(screen.getByText("Stripe unavailable")).toBeInTheDocument();
    });
  });
});
