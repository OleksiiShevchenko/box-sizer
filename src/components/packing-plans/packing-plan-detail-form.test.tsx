import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PackingPlanDetailForm } from "./packing-plan-detail-form";

const calculateAndSavePackingPlan = jest.fn();

jest.mock("@/actions/packing-plan-actions", () => ({
  calculateAndSavePackingPlan: (...args: unknown[]) => calculateAndSavePackingPlan(...args),
}));

const packingPlan = {
  id: "packingPlan-1",
  name: "Sample Packing Plan",
  spacingOverride: 1.5,
  dimensionalWeight: 3,
  box: null,
  items: [
    {
      id: "item-1",
      name: "Shirt",
      quantity: 1,
      width: 30,
      height: 20,
      depth: 5,
      weight: 200,
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("PackingPlanDetailForm", () => {
  beforeEach(() => {
    calculateAndSavePackingPlan.mockReset();
  });

  it("loads existing packing plan data into form fields", () => {
    render(
      <PackingPlanDetailForm
        packingPlan={packingPlan}
        hasBoxes={true}
        unitSystem="cm"
        onCalculated={jest.fn()}
        onNameChange={jest.fn()}
      />
    );

    expect(screen.getByLabelText("Packing Plan Name")).toHaveValue("Sample Packing Plan");
    expect(screen.getByLabelText("Spacing Override (cm, optional)")).toHaveValue(1.5);
    expect(screen.getByText("Shirt")).toBeInTheDocument();
    expect(screen.getByText("1 unit across 1 item type")).toBeInTheDocument();
  });

  it("shows the ideal-box action when no box options exist", () => {
    render(
      <PackingPlanDetailForm
        packingPlan={packingPlan}
        hasBoxes={false}
        unitSystem="cm"
        onCalculated={jest.fn()}
        onNameChange={jest.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Calculate Ideal Box" })).toBeEnabled();
  });

  it("adds, edits, and deletes local items", async () => {
    const user = userEvent.setup();

    render(
      <PackingPlanDetailForm
        packingPlan={{ ...packingPlan, items: [] }}
        hasBoxes={true}
        unitSystem="cm"
        onCalculated={jest.fn()}
        onNameChange={jest.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Calculate Best Box" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "+ Add Item" }));
    await user.type(screen.getByLabelText("Product Name"), "Poster");
    await user.clear(screen.getByLabelText("How many units"));
    await user.type(screen.getByLabelText("How many units"), "3");
    await user.type(screen.getByLabelText("Width (cm)"), "40");
    await user.type(screen.getByLabelText("Height (cm)"), "20");
    await user.type(screen.getByLabelText("Depth (cm)"), "2");
    await user.click(screen.getByRole("button", { name: "Add Product" }));

    expect(screen.getByText("Poster")).toBeInTheDocument();
    expect(screen.getByText("x3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Calculate Best Box" })).not.toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Edit" }));
    const nameInput = screen.getByLabelText("Product Name");
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Poster");
    await user.click(screen.getByRole("button", { name: "Save Product" }));

    expect(screen.getByText("Updated Poster")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.queryByText("Updated Poster")).not.toBeInTheDocument();
  });

  it("calls calculateAndSavePackingPlan with the current local state", async () => {
    const user = userEvent.setup();
    const onCalculated = jest.fn();
    calculateAndSavePackingPlan.mockResolvedValue({
      results: [
        {
          box: {
            id: "box-1",
            name: "Mailer",
            width: 30,
            height: 20,
            depth: 10,
            spacing: 0,
            maxWeight: null,
          },
          items: [],
          dimensionalWeight: 3,
        },
      ],
      idealResult: null,
    });

    render(
      <PackingPlanDetailForm
        packingPlan={packingPlan}
        hasBoxes={true}
        unitSystem="cm"
        onCalculated={onCalculated}
        onNameChange={jest.fn()}
      />
    );

    await user.clear(screen.getByLabelText("Packing Plan Name"));
    await user.type(screen.getByLabelText("Packing Plan Name"), "Renamed Packing Plan");
    await user.clear(screen.getByLabelText("Spacing Override (cm, optional)"));
    await user.type(screen.getByLabelText("Spacing Override (cm, optional)"), "2.5");
    await user.click(screen.getByRole("button", { name: "Calculate Best Box" }));

    await waitFor(() => {
      expect(calculateAndSavePackingPlan).toHaveBeenCalledWith("packingPlan-1", {
        name: "Renamed Packing Plan",
        items: [
          {
            id: "item-1",
            name: "Shirt",
            quantity: 1,
            width: 30,
            height: 20,
            depth: 5,
            weight: 200,
          },
        ],
        spacingOverride: 2.5,
      });
      expect(onCalculated).toHaveBeenCalledWith(
        "Renamed Packing Plan",
        expect.any(Array),
        null
      );
    });
  });

  it("renders the quota upgrade error with a link to pricing", async () => {
    const user = userEvent.setup();
    calculateAndSavePackingPlan.mockResolvedValue({
      error: "You have used all 15 calculations for this month. Upgrade your plan to continue.",
    });

    render(
      <PackingPlanDetailForm
        packingPlan={packingPlan}
        hasBoxes={true}
        unitSystem="cm"
        onCalculated={jest.fn()}
        onNameChange={jest.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Calculate Best Box" }));

    const upgradeLink = await screen.findByRole("link", { name: "Upgrade" });
    expect(upgradeLink).toHaveAttribute("href", "/pricing");
    expect(
      screen.getByText("You have used all 15 calculations for this month.", { exact: false })
    ).toBeInTheDocument();
    expect(screen.getByText("your plan to continue.", { exact: false })).toBeInTheDocument();
  });
});
