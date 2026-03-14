import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BoxForm } from "./box-form";
import { createBox } from "@/actions/box-actions";

jest.mock("@/actions/box-actions", () => ({
  createBox: jest.fn().mockResolvedValue({ success: true }),
}));

const mockedCreateBox = createBox as jest.Mock;

describe("BoxForm", () => {
  it("renders all form fields", () => {
    render(<BoxForm unit="cm" />);
    expect(screen.getByLabelText("Box Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Width (cm)")).toBeInTheDocument();
    expect(screen.getByLabelText("Height (cm)")).toBeInTheDocument();
    expect(screen.getByLabelText("Depth (cm)")).toBeInTheDocument();
    expect(screen.getByLabelText("Max Weight (g, optional)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Box" })).toBeInTheDocument();
  });

  it("shows inch labels when unit is inches", () => {
    render(<BoxForm unit="in" />);
    expect(screen.getByLabelText("Width (in)")).toBeInTheDocument();
    expect(screen.getByLabelText("Height (in)")).toBeInTheDocument();
    expect(screen.getByLabelText("Depth (in)")).toBeInTheDocument();
  });

  it("submits the form with valid data", async () => {
    const user = userEvent.setup();

    render(<BoxForm unit="cm" />);

    await user.type(screen.getByLabelText("Box Name"), "Test Box");
    await user.type(screen.getByLabelText("Width (cm)"), "30");
    await user.type(screen.getByLabelText("Height (cm)"), "20");
    await user.type(screen.getByLabelText("Depth (cm)"), "15");
    await user.click(screen.getByRole("button", { name: "Add Box" }));

    expect(mockedCreateBox).toHaveBeenCalled();
  });

  it("shows error when server returns error", async () => {
    const user = userEvent.setup();
    mockedCreateBox.mockResolvedValueOnce({ error: "Something went wrong" });

    render(<BoxForm unit="cm" />);

    await user.type(screen.getByLabelText("Box Name"), "Test");
    await user.type(screen.getByLabelText("Width (cm)"), "30");
    await user.type(screen.getByLabelText("Height (cm)"), "20");
    await user.type(screen.getByLabelText("Depth (cm)"), "15");
    await user.click(screen.getByRole("button", { name: "Add Box" }));

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
  });
});
