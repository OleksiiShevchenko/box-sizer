import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DemoPageClient } from "./demo-page-client";
import { calculateDemoPacking } from "@/actions/demo-actions";
import posthog from "posthog-js";

jest.mock("@/actions/demo-actions", () => ({
  calculateDemoPacking: jest.fn(),
}));

jest.mock("posthog-js", () => ({
  capture: jest.fn(),
}));

jest.mock("@/components/packing-plans/packing-plan-result-panel", () => ({
  PackingPlanResultPanel: ({
    results,
    idealResult,
  }: {
    results: Array<{ box: { name: string } }> | null;
    idealResult: { box: { name: string } } | null;
  }) => (
    <div data-testid="mock-result-panel">
      <span>Best Available Box</span>
      <span>Ideal Custom Box</span>
      <span>3D visualization</span>
      <span>{results?.[0]?.box.name ?? idealResult?.box.name ?? "No result yet"}</span>
    </div>
  ),
}));

jest.mock("@/components/marketing/demo-booking-button", () => ({
  DemoBookingButton: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <button type="button" className={className} onClick={onClick}>
      {children}
    </button>
  ),
}));

const mockedCalculateDemoPacking = jest.mocked(calculateDemoPacking);
const mockedPosthog = jest.mocked(posthog);

describe("DemoPageClient", () => {
  beforeEach(() => {
    mockedCalculateDemoPacking.mockReset();
    mockedPosthog.capture.mockReset();
    window.history.replaceState(null, "", "/demo");
  });

  it("renders the intro copy and scenario cards with images", () => {
    render(<DemoPageClient />);

    expect(screen.getByText("Try Packwell on a sample order")).toBeInTheDocument();
    expect(
      screen.getByText(
        "You provide item dimensions. Packwell returns the best box, dimensional weight, and a 3D packing plan."
      )
    ).toBeInTheDocument();
    expect(screen.getByAltText("Ecommerce order illustration")).toBeInTheDocument();
    expect(screen.getByAltText("Gift kit illustration")).toBeInTheDocument();
    expect(mockedPosthog.capture).toHaveBeenCalledWith("demo_started");
  });

  it("selects a scenario, validates quantities, calculates results, and supports reset actions", async () => {
    const user = userEvent.setup();
    mockedCalculateDemoPacking.mockResolvedValue({
      results: [
        {
          box: {
            id: "demo-large-shipper",
            name: "Large Shipper",
            width: 1,
            height: 1,
            depth: 1,
            spacing: 0,
            maxWeight: null,
          },
          items: [],
          dimensionalWeight: 4,
        },
      ],
      idealResult: {
        box: {
          id: "ideal-box",
          name: "Ideal Box",
          width: 1,
          height: 1,
          depth: 1,
          spacing: 0,
          maxWeight: null,
        },
        items: [],
        dimensionalWeight: 3,
      },
    });

    render(<DemoPageClient />);

    await user.click(screen.getByTestId("scenario-card-gift-kit"));

    expect(mockedPosthog.capture).toHaveBeenCalledWith("preset_selected", {
      preset_id: "gift-kit",
      preset_name: "Gift kit",
    });

    expect(screen.getByTestId("demo-order-form")).toBeInTheDocument();
    expect(screen.queryByText("How can this item be oriented when packed?")).not.toBeInTheDocument();
    expect(screen.queryByText("Can other items be stacked on top of this item?")).not.toBeInTheDocument();

    const soyCandleQuantity = within(screen.getByTestId("demo-item-soy-candle")).getByLabelText("Quantity");
    await user.clear(soyCandleQuantity);
    await user.type(soyCandleQuantity, "12");
    await user.click(
      within(screen.getByTestId("demo-item-ceramic-mug")).getByRole("button", { name: "Delete" })
    );
    expect(screen.queryByTestId("demo-item-ceramic-mug")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Calculate Box" }));

    await waitFor(() => {
      expect(mockedCalculateDemoPacking).toHaveBeenCalledWith({
        scenarioId: "gift-kit",
        quantities: {
          "soy-candle": 12,
          notebook: 1,
        },
      });
    });

    expect(await screen.findByTestId("mock-result-panel")).toBeInTheDocument();
    expect(screen.getByText("Large Shipper")).toBeInTheDocument();
    expect(mockedPosthog.capture).toHaveBeenCalledWith("demo_result_viewed", {
      preset_id: "gift-kit",
      preset_name: "Gift kit",
      results_count: 1,
      recommended_box_name: "Large Shipper",
    });

    await user.click(
      within(screen.getByTestId("demo-step-2")).getByRole("button", { name: "Edit quantities" })
    );
    expect(screen.getByTestId("demo-order-form")).toBeInTheDocument();
    expect(screen.queryByTestId("demo-result-actions")).not.toBeInTheDocument();
    expect(screen.getByText("No result yet")).toBeInTheDocument();

    await user.click(
      within(screen.getByTestId("demo-step-1")).getByRole("button", { name: "Select scenario" })
    );
    expect(screen.getByTestId("demo-scenario-selector")).toBeInTheDocument();

    await user.click(screen.getByTestId("scenario-card-gift-kit"));
    expect(screen.getByTestId("demo-order-form")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Calculate Box" }));
    expect(await screen.findByTestId("demo-result-actions")).toBeInTheDocument();

    await user.click(
      within(screen.getByTestId("demo-result-actions")).getByRole("link", { name: "Start Free" })
    );
    expect(mockedPosthog.capture).toHaveBeenCalledWith("signup_clicked_after_demo", {
      preset_id: "gift-kit",
      preset_name: "Gift kit",
    });

    await user.click(screen.getByRole("button", { name: "Book a Demo" }));
    expect(mockedPosthog.capture).toHaveBeenCalledWith("book_demo_clicked_after_demo", {
      preset_id: "gift-kit",
      preset_name: "Gift kit",
    });

    await user.click(screen.getAllByRole("button", { name: "Start over" }).at(-1)!);
    expect(screen.getByTestId("demo-scenario-selector")).toBeInTheDocument();
  });

  it("shows an error when every item has been removed", async () => {
    const user = userEvent.setup();

    render(<DemoPageClient />);
    await user.click(screen.getByTestId("scenario-card-ecommerce-order"));

    while (screen.queryAllByRole("button", { name: "Delete" }).length > 0) {
      await user.click(screen.getAllByRole("button", { name: "Delete" })[0]!);
    }

    expect(screen.getByRole("button", { name: "Calculate Box" })).toBeDisabled();
    expect(screen.getByTestId("demo-order-form")).toBeInTheDocument();
    expect(screen.getByText("A typical online order with shoes, apparel, and accessories.")).toBeInTheDocument();
  });

  it("shows a validation error before submitting quantities above the total demo cap", async () => {
    const user = userEvent.setup();

    render(<DemoPageClient />);
    await user.click(screen.getByTestId("scenario-card-ecommerce-order"));

    await user.clear(within(screen.getByTestId("demo-item-running-shoes")).getByLabelText("Quantity"));
    await user.type(within(screen.getByTestId("demo-item-running-shoes")).getByLabelText("Quantity"), "50");
    await user.clear(within(screen.getByTestId("demo-item-folded-tshirt")).getByLabelText("Quantity"));
    await user.type(within(screen.getByTestId("demo-item-folded-tshirt")).getByLabelText("Quantity"), "50");
    await user.clear(within(screen.getByTestId("demo-item-pair-of-socks")).getByLabelText("Quantity"));
    await user.type(within(screen.getByTestId("demo-item-pair-of-socks")).getByLabelText("Quantity"), "21");

    await user.click(screen.getByRole("button", { name: "Calculate Box" }));

    expect(mockedCalculateDemoPacking).not.toHaveBeenCalled();
    expect(screen.getByText("Demo requests are limited to 120 total units.")).toBeInTheDocument();
  });

  it("restores previous demo steps from browser history state", async () => {
    const user = userEvent.setup();
    mockedCalculateDemoPacking.mockResolvedValue({
      results: [
        {
          box: {
            id: "demo-gift-set-box",
            name: "Gift Set Box",
            width: 1,
            height: 1,
            depth: 1,
            spacing: 0,
            maxWeight: null,
          },
          items: [],
          dimensionalWeight: 4,
        },
      ],
      idealResult: {
        box: {
          id: "ideal-box",
          name: "Ideal Box",
          width: 1,
          height: 1,
          depth: 1,
          spacing: 0,
          maxWeight: null,
        },
        items: [],
        dimensionalWeight: 3,
      },
    });

    render(<DemoPageClient />);

    await user.click(screen.getByTestId("scenario-card-gift-kit"));
    const stepTwoState = window.history.state;

    await user.click(screen.getByRole("button", { name: "Calculate Box" }));
    expect(await screen.findByText("Gift Set Box")).toBeInTheDocument();

    await act(async () => {
      window.dispatchEvent(new PopStateEvent("popstate", { state: stepTwoState }));
    });

    await waitFor(() => {
      expect(screen.getByTestId("demo-order-form")).toBeInTheDocument();
      expect(screen.queryByTestId("demo-result-actions")).not.toBeInTheDocument();
      expect(screen.getByText("No result yet")).toBeInTheDocument();
    });
  });
});
