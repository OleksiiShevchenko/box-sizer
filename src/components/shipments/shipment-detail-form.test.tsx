import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShipmentDetailForm } from "./shipment-detail-form";

const calculateAndSaveShipment = jest.fn();

jest.mock("@/actions/shipment-actions", () => ({
  calculateAndSaveShipment: (...args: unknown[]) => calculateAndSaveShipment(...args),
}));

const shipment = {
  id: "shipment-1",
  name: "Sample Shipment",
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

describe("ShipmentDetailForm", () => {
  beforeEach(() => {
    calculateAndSaveShipment.mockReset();
  });

  it("loads existing shipment data into form fields", () => {
    render(
      <ShipmentDetailForm
        shipment={shipment}
        hasBoxes={true}
        unitSystem="cm"
        onCalculated={jest.fn()}
        onNameChange={jest.fn()}
      />
    );

    expect(screen.getByLabelText("Shipment Name")).toHaveValue("Sample Shipment");
    expect(screen.getByLabelText("Spacing Override (cm, optional)")).toHaveValue(1.5);
    expect(screen.getByText("Shirt")).toBeInTheDocument();
    expect(screen.getByText("1 unit across 1 item type")).toBeInTheDocument();
  });

  it("shows the ideal-box action when no packaging options exist", () => {
    render(
      <ShipmentDetailForm
        shipment={shipment}
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
      <ShipmentDetailForm
        shipment={{ ...shipment, items: [] }}
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

  it("calls calculateAndSaveShipment with the current local state", async () => {
    const user = userEvent.setup();
    const onCalculated = jest.fn();
    calculateAndSaveShipment.mockResolvedValue({
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
      <ShipmentDetailForm
        shipment={shipment}
        hasBoxes={true}
        unitSystem="cm"
        onCalculated={onCalculated}
        onNameChange={jest.fn()}
      />
    );

    await user.clear(screen.getByLabelText("Shipment Name"));
    await user.type(screen.getByLabelText("Shipment Name"), "Renamed Shipment");
    await user.clear(screen.getByLabelText("Spacing Override (cm, optional)"));
    await user.type(screen.getByLabelText("Spacing Override (cm, optional)"), "2.5");
    await user.click(screen.getByRole("button", { name: "Calculate Best Box" }));

    await waitFor(() => {
      expect(calculateAndSaveShipment).toHaveBeenCalledWith("shipment-1", {
        name: "Renamed Shipment",
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
        "Renamed Shipment",
        expect.any(Array),
        null
      );
    });
  });
});
