import { render, screen } from "@testing-library/react";
import {
  BoxVisualization3D,
  getAutoRotateSpeedRadians,
} from "./box-visualization-3d";
import type { PackingResult } from "@/types";

jest.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-canvas">{children}</div>
  ),
  useFrame: jest.fn(),
  useThree: () => ({
    camera: {
      lookAt: jest.fn(),
      updateProjectionMatrix: jest.fn(),
    },
  }),
}));

jest.mock("@react-three/drei", () => ({
  Edges: () => <div data-testid="mock-edges" />,
  OrbitControls: () => <div data-testid="mock-orbit-controls" />,
}));

const baseResult: PackingResult = {
  box: {
    id: "box-1",
    name: "Sample Box",
    width: 25.4,
    height: 25.4,
    depth: 25.4,
    maxWeight: null,
  },
  dimensionalWeight: 4,
  items: [
    {
      name: "Item 1_0",
      width: 5.08,
      height: 10.16,
      depth: 10.16,
      x: 0,
      y: 0,
      z: 0,
    },
  ],
};

describe("BoxVisualization3D", () => {
  it("renders the default chrome and meta details", () => {
    render(<BoxVisualization3D result={baseResult} unit="in" />);

    expect(screen.getByText("3D view (width x height x depth)")).toBeInTheDocument();
    expect(screen.getByText("Drag to rotate, scroll to zoom")).toBeInTheDocument();
    expect(screen.getByText("10.0 x 10.0 x 10.0 in")).toBeInTheDocument();
    expect(screen.getByText("1 unit")).toBeInTheDocument();
    expect(screen.getByTestId("mock-orbit-controls")).toBeInTheDocument();
  });

  it("renders the transparent hero variant without meta or controls", () => {
    const { container } = render(
      <BoxVisualization3D
        result={baseResult}
        unit="in"
        size="hero"
        variant="transparent"
        showMeta={false}
        interactive={false}
        autoRotate
      />
    );

    expect(screen.queryByText("3D view (width x height x depth)")).not.toBeInTheDocument();
    expect(screen.queryByText("Drag to rotate, scroll to zoom")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mock-orbit-controls")).not.toBeInTheDocument();
    expect(container.firstChild).toHaveClass("max-w-[625px]");
    expect(container.querySelector(".aspect-\\[625\\/650\\]")).not.toBeNull();
    expect(container.querySelector(".bg-gray-50")).toBeNull();
  });

  it("uses a slow vertical auto-rotation speed", () => {
    expect(getAutoRotateSpeedRadians()).toBeGreaterThan(0.1);
    expect(getAutoRotateSpeedRadians()).toBeLessThan(0.15);
  });
});
