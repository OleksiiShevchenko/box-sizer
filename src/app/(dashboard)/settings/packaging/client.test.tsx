import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PackagingSettingsClient } from "./client";

jest.mock("@/actions/box-actions", () => ({
  createBox: jest.fn().mockResolvedValue({ success: true }),
  updateBox: jest.fn().mockResolvedValue({ success: true }),
  deleteBox: jest.fn().mockResolvedValue({ success: true }),
}));

const boxes = [
  {
    id: "box-1",
    name: "Mailer",
    width: 25,
    height: 18,
    depth: 12,
    spacing: 1.5,
    maxWeight: null,
  },
];

describe("PackagingSettingsClient", () => {
  it("opens and closes the add dialog", async () => {
    const user = userEvent.setup();

    render(<PackagingSettingsClient boxes={boxes} unitSystem="cm" />);

    await user.click(screen.getByRole("button", { name: "Add New Box" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Add New Box" })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
