import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";

describe("DeleteConfirmDialog", () => {
  it("closes without confirming when cancel is clicked", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const onConfirm = jest.fn();

    render(
      <DeleteConfirmDialog
        open
        entityName="Packing Plan A"
        onClose={onClose}
        onConfirm={() => {
          onConfirm();
          return true;
        }}
      />
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("calls onConfirm and onClose when delete is confirmed", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const onConfirm = jest.fn().mockResolvedValue(undefined);

    render(
      <DeleteConfirmDialog
        open
        title="Delete packing plan"
        entityName="Packing Plan A"
        onClose={onClose}
        onConfirm={async () => {
          await onConfirm();
          return true;
        }}
      />
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("stays open when confirmation fails", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const onConfirm = jest.fn().mockResolvedValue(false);

    render(
      <DeleteConfirmDialog
        open
        title="Delete packing plan"
        entityName="Packing Plan A"
        error="Deletion failed"
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
      expect(screen.getByText("Deletion failed")).toBeInTheDocument();
    });
  });
});
