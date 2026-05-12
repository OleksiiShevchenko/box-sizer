import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import posthog from "posthog-js";
import { DimensionalWeightCalculator } from "./dimensional-weight-calculator";

jest.mock("posthog-js", () => ({
  capture: jest.fn(),
}));

const mockedPosthog = jest.mocked(posthog);

function setNavigatorLanguage(language: string) {
  Object.defineProperty(window.navigator, "language", {
    value: language,
    configurable: true,
  });
}

describe("DimensionalWeightCalculator", () => {
  beforeEach(() => {
    mockedPosthog.capture.mockReset();
    setNavigatorLanguage("en-US");
  });

  it("defaults to locale units, calculates carrier billable weights, and tracks analytics", async () => {
    const user = userEvent.setup();

    render(<DimensionalWeightCalculator />);

    await waitFor(() =>
      expect(mockedPosthog.capture).toHaveBeenCalledWith(
        "dimensional_weight_calculator_viewed",
        expect.objectContaining({ unit_system: "in" })
      )
    );

    await user.type(screen.getByLabelText("Actual package weight (lb)"), "2");
    await user.type(screen.getByLabelText("Package length (in)"), "20");
    await user.type(screen.getByLabelText("Package width (in)"), "10");
    await user.type(screen.getByLabelText("Package height (in)"), "10");
    await user.click(screen.getByRole("button", { name: "Calculate" }));

    const upsCard = screen.getByRole("heading", { name: "UPS" }).closest("article");
    expect(upsCard).not.toBeNull();
    expect(within(upsCard!).getAllByText("15 lb")).toHaveLength(2);
    expect(
      within(upsCard!).getByText("UPS divisor: 139 in^3 per lb.", {
        exact: false,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "This package is billed by dimensional weight because it takes up more space than its actual weight suggests."
      )
    ).toBeInTheDocument();

    expect(mockedPosthog.capture).toHaveBeenCalledWith(
      "dimensional_weight_calculated",
      expect.objectContaining({
        unit_system: "in",
        actual_weight: 2,
        package_dimensions: { length: 20, width: 10, height: 10 },
        highest_dimensional_weight: 15,
        highest_billable_weight: 15,
        dimensional_weight_exceeds_actual_weight: true,
      })
    );
  });

  it("converts entered values when switching unit systems", async () => {
    const user = userEvent.setup();

    render(<DimensionalWeightCalculator />);

    await waitFor(() =>
      expect(mockedPosthog.capture).toHaveBeenCalledWith(
        "dimensional_weight_calculator_viewed",
        expect.objectContaining({ unit_system: "in" })
      )
    );

    await user.type(screen.getByLabelText("Actual package weight (lb)"), "2");
    await user.type(screen.getByLabelText("Package length (in)"), "10");
    await user.click(screen.getByRole("button", { name: "Metric" }));

    expect(screen.getByLabelText("Actual package weight (kg)")).toHaveValue(0.91);
    expect(screen.getByLabelText("Package length (cm)")).toHaveValue(25.4);
    expect(mockedPosthog.capture).toHaveBeenCalledWith(
      "dimensional_weight_units_changed",
      expect.objectContaining({ unit_system: "cm" })
    );
  });

  it("shows inline validation and prevents calculation for non-positive values", async () => {
    const user = userEvent.setup();

    render(<DimensionalWeightCalculator />);

    await waitFor(() =>
      expect(screen.getByLabelText("Actual package weight (lb)")).toBeInTheDocument()
    );

    await user.type(screen.getByLabelText("Actual package weight (lb)"), "0");
    await user.tab();

    expect(screen.getByText("Enter a number greater than 0.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Calculate" })).toBeDisabled();
    expect(mockedPosthog.capture).not.toHaveBeenCalledWith(
      "dimensional_weight_calculated",
      expect.anything()
    );
  });
});
