import { render, screen, within } from "@testing-library/react";
import {
  HERO_PACKING_RESULT,
  HERO_RECOMMENDED_BOX,
} from "./hero-packing-visualization-data";

let capturedProps: Record<string, unknown> | null = null;

jest.mock("next/dynamic", () => ({
  __esModule: true,
  default: () => {
    return function MockDynamicComponent(props: Record<string, unknown>) {
      capturedProps = props;
      return <div data-testid="mock-hero-scene" />;
    };
  },
}));

import { HeroPackingVisualization } from "./hero-packing-visualization";

describe("HeroPackingVisualization", () => {
  beforeEach(() => {
    capturedProps = null;
  });

  it("renders the wrapper and passes the expected visualization props", () => {
    render(<HeroPackingVisualization />);

    const legendCard = screen.getByTestId("hero-legend-card");
    const savingsLine = screen.getByTestId("hero-savings-line");

    expect(screen.queryByTestId("hero-recommendation-card")).not.toBeInTheDocument();
    expect(
      within(legendCard).getByText(`Optimal Recommendation: ${HERO_RECOMMENDED_BOX.name}`)
    ).toBeInTheDocument();
    expect(savingsLine).toBeInTheDocument();
    expect(within(savingsLine).getByText("Shipping Savings:")).toBeInTheDocument();
    expect(within(savingsLine).getByText(`$${HERO_RECOMMENDED_BOX.shippingSavingsUsd.toFixed(2)}`)).toBeInTheDocument();
    expect(legendCard).toBeInTheDocument();
    expect(
      within(legendCard).getByText(
        `Dimensions: ${HERO_RECOMMENDED_BOX.widthIn.toFixed(1)} x ${HERO_RECOMMENDED_BOX.heightIn.toFixed(1)} x ${HERO_RECOMMENDED_BOX.depthIn.toFixed(1)} in`
      )
    ).toBeInTheDocument();
    expect(within(legendCard).getByText(`${HERO_PACKING_RESULT.items.length} units`)).toBeInTheDocument();
    const legendLabels = within(legendCard)
      .getAllByText(/^Item \d+$/)
      .map((node) => node.textContent);
    expect(legendLabels).toEqual([
      "Item 1",
      "Item 2",
      "Item 2",
      "Item 3",
      "Item 4",
      "Item 5",
      "Item 5",
      "Item 6",
      "Item 6",
      "Item 7",
    ]);
    expect(
      screen.getByLabelText("Medium box packing visualization")
    ).toHaveAttribute("data-testid", "hero-packing-visualization");
    expect(screen.getByTestId("mock-hero-scene")).toBeInTheDocument();
    expect(capturedProps).toEqual(
      expect.objectContaining({
        result: HERO_PACKING_RESULT,
        unit: "in",
        size: "hero",
        variant: "transparent",
        showMeta: false,
        interactive: false,
        autoRotate: true,
        rotationAngle: expect.any(Number),
        onAutoRotateFrame: expect.any(Function),
        cameraView: "perspective",
      })
    );
  });
});
