import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BoxCard } from "./box-card";

const deleteBox = jest.fn();

jest.mock("@/actions/box-actions", () => ({
  deleteBox: (...args: unknown[]) => deleteBox(...args),
}));

describe("BoxCard", () => {
  beforeEach(() => {
    deleteBox.mockReset();
    deleteBox.mockResolvedValue({ success: true });
  });

  it("asks for confirmation before deleting box", async () => {
    const user = userEvent.setup();

    render(
      <BoxCard
        id="box-1"
        name="Mailer"
        width={25}
        height={18}
        depth={12}
        spacing={1.5}
        maxWeight={null}
        unit="cm"
      />
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(deleteBox).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Delete box" })).toBeInTheDocument();
    expect(screen.getByText('This will permanently delete "Mailer".')).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "Delete" })[1]);

    await waitFor(() => {
      expect(deleteBox).toHaveBeenCalledWith("box-1");
    });
  });
});
