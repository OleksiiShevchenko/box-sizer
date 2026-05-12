import { render, screen } from "@testing-library/react";
import { PackingPlanResultPanel } from "./packing-plan-result-panel";

jest.mock("@/components/calculator/box-visualization-3d", () => ({
  BoxVisualization3D: () => <div data-testid="box-visualization-3d" />,
}));

const result = {
  box: {
    id: "box-1",
    name: "Mailer",
    width: 50,
    height: 40,
    depth: 30,
    spacing: 0,
    maxWeight: null,
  },
  items: [
    {
      name: "Poster",
      width: 20,
      height: 10,
      depth: 5,
      x: 0,
      y: 0,
      z: 0,
    },
  ],
  dimensionalWeight: 12,
};

describe("PackingPlanResultPanel", () => {
  it("shows carrier dimensional weights with divisor tooltips", () => {
    render(
      <PackingPlanResultPanel
        results={[result]}
        idealResult={null}
        unitSystem="cm"
      />
    );

    expect(
      screen.getByRole("heading", { name: "Recommended Box: Mailer" })
    ).toBeInTheDocument();
    expect(screen.getByText("Carrier dimensional weight")).toBeInTheDocument();
    expect(screen.getByText("UPS")).toBeInTheDocument();
    expect(screen.getByText("FedEx")).toBeInTheDocument();
    expect(screen.getByText("USPS")).toBeInTheDocument();
    expect(screen.getByText("DHL")).toBeInTheDocument();
    expect(screen.getAllByText("12 kg")).toHaveLength(3);
    expect(screen.getByText("10 kg")).toBeInTheDocument();
    expect(
      screen.getByText("USPS divisor: 6000 cm^3 per kg.", { exact: false })
    ).toBeInTheDocument();
  });
});
