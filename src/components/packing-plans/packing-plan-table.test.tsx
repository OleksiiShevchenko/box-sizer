import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PackingPlanTable } from "./packing-plan-table";

const deletePackingPlan = jest.fn();

jest.mock("@/actions/packing-plan-actions", () => ({
  deletePackingPlan: (...args: unknown[]) => deletePackingPlan(...args),
}));

const packingPlans = [
  {
    id: "packingPlan-1",
    name: "Order 1001",
    spacingOverride: null,
    dimensionalWeight: 4,
    box: {
      id: "box-1",
      name: "Mailer",
      width: 30,
      height: 20,
      depth: 10,
      spacing: 0,
      maxWeight: null,
    },
    items: [
      {
        id: "item-1",
        name: "Poster",
        quantity: 3,
        width: 28,
        height: 18,
        depth: 2,
        weight: 100,
      },
    ],
    itemCount: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("PackingPlanTable", () => {
  beforeEach(() => {
    deletePackingPlan.mockReset();
  });

  it("renders the packing plan columns and tooltip content", () => {
    render(<PackingPlanTable packingPlans={packingPlans} unitSystem="cm" />);

    expect(screen.getByRole("columnheader", { name: "Packing plan" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Units" })).toBeInTheDocument();
    expect(screen.getByText("Order 1001")).toBeInTheDocument();
    expect(screen.getByText("Poster x3")).toBeInTheDocument();
    expect(screen.getByText(/28\.0 x 18\.0 x 2\.0 cm/)).toBeInTheDocument();
  });

  it("opens the delete dialog and confirms deletion", async () => {
    const user = userEvent.setup();
    const onDeleted = jest.fn();
    deletePackingPlan.mockResolvedValue({ success: true });

    render(<PackingPlanTable packingPlans={packingPlans} unitSystem="cm" onDeleted={onDeleted} />);

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByRole("heading", { name: "Delete packing plan" })).toBeInTheDocument();

    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: /^Delete$/ }));

    await waitFor(() => {
      expect(deletePackingPlan).toHaveBeenCalledWith("packingPlan-1");
      expect(onDeleted).toHaveBeenCalledWith("packingPlan-1");
    });
  });

  it("keeps the delete dialog open and shows the error on failure", async () => {
    const user = userEvent.setup();
    deletePackingPlan.mockResolvedValue({ error: "Delete failed" });

    render(<PackingPlanTable packingPlans={packingPlans} unitSystem="cm" />);

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: /^Delete$/ }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Delete failed")).toBeInTheDocument();
    });
  });
});
