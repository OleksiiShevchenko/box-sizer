import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShipmentTable } from "./shipment-table";

const deleteShipment = jest.fn();

jest.mock("@/actions/shipment-actions", () => ({
  deleteShipment: (...args: unknown[]) => deleteShipment(...args),
}));

const shipments = [
  {
    id: "shipment-1",
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
        width: 28,
        height: 18,
        depth: 2,
        weight: 100,
      },
    ],
    itemCount: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("ShipmentTable", () => {
  beforeEach(() => {
    deleteShipment.mockReset();
  });

  it("renders the shipment columns and tooltip content", () => {
    render(<ShipmentTable shipments={shipments} unitSystem="cm" />);

    expect(screen.getByRole("columnheader", { name: "Shipment" })).toBeInTheDocument();
    expect(screen.getByText("Order 1001")).toBeInTheDocument();
    expect(screen.getByText("Poster")).toBeInTheDocument();
    expect(screen.getByText(/28\.0 x 18\.0 x 2\.0 cm/)).toBeInTheDocument();
  });

  it("opens the delete dialog and confirms deletion", async () => {
    const user = userEvent.setup();
    const onDeleted = jest.fn();
    deleteShipment.mockResolvedValue({ success: true });

    render(<ShipmentTable shipments={shipments} unitSystem="cm" onDeleted={onDeleted} />);

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByRole("heading", { name: "Delete shipment" })).toBeInTheDocument();

    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: /^Delete$/ }));

    await waitFor(() => {
      expect(deleteShipment).toHaveBeenCalledWith("shipment-1");
      expect(onDeleted).toHaveBeenCalledWith("shipment-1");
    });
  });

  it("keeps the delete dialog open and shows the error on failure", async () => {
    const user = userEvent.setup();
    deleteShipment.mockResolvedValue({ error: "Delete failed" });

    render(<ShipmentTable shipments={shipments} unitSystem="cm" />);

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: /^Delete$/ }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Delete failed")).toBeInTheDocument();
    });
  });
});
