import { render, screen } from "@testing-library/react";
import { BoxList } from "./box-list";

jest.mock("@/actions/box-actions", () => ({
  deleteBox: jest.fn().mockResolvedValue({ success: true }),
}));

const mockBoxes = [
  { id: "1", name: "Small", width: 20, height: 15, depth: 10, maxWeight: null },
  { id: "2", name: "Medium", width: 30, height: 25, depth: 20, maxWeight: 5000 },
];

describe("BoxList", () => {
  it("renders boxes", () => {
    render(<BoxList boxes={mockBoxes} unit="cm" />);
    expect(screen.getByText("Small")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
  });

  it("shows empty state when no boxes", () => {
    render(<BoxList boxes={[]} unit="cm" />);
    expect(screen.getByText("No boxes added yet")).toBeInTheDocument();
  });

  it("shows delete buttons for each box", () => {
    render(<BoxList boxes={mockBoxes} unit="cm" />);
    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    expect(deleteButtons.length).toBe(2);
  });

  it("shows dimensions in cm", () => {
    render(<BoxList boxes={[mockBoxes[0]]} unit="cm" />);
    expect(screen.getByText(/20\.0 x 15\.0 x 10\.0 cm/)).toBeInTheDocument();
  });

  it("shows dimensions in inches when unit is in", () => {
    render(<BoxList boxes={[mockBoxes[0]]} unit="in" />);
    expect(screen.getByText(/7\.9 x 5\.9 x 3\.9 in/)).toBeInTheDocument();
  });
});
