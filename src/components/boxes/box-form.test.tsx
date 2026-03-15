import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BoxForm } from "./box-form";
import { createBox, updateBox } from "@/actions/box-actions";

jest.mock("@/actions/box-actions", () => ({
  createBox: jest.fn().mockResolvedValue({ success: true }),
  updateBox: jest.fn().mockResolvedValue({ success: true }),
}));

const mockedCreateBox = createBox as jest.Mock;
const mockedUpdateBox = updateBox as jest.Mock;

const existingBox = {
  id: "box-1",
  name: "Existing Box",
  width: 30,
  height: 20,
  depth: 10,
  maxWeight: 4000,
};

describe("BoxForm", () => {
  beforeEach(() => {
    mockedCreateBox.mockClear();
    mockedUpdateBox.mockClear();
  });

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

  it("shows client-side field validation errors", async () => {
    const user = userEvent.setup();

    render(<BoxForm unit="cm" />);

    await user.click(screen.getByRole("button", { name: "Add Box" }));

    expect(await screen.findByText("Name is required")).toBeInTheDocument();
    expect(screen.getByText("Width is required")).toBeInTheDocument();
    expect(screen.getByText("Height is required")).toBeInTheDocument();
    expect(screen.getByText("Depth is required")).toBeInTheDocument();
    expect(mockedCreateBox).not.toHaveBeenCalled();
  });

  it("shows server field errors under inputs", async () => {
    const user = userEvent.setup();
    mockedCreateBox.mockResolvedValueOnce({
      fieldErrors: { width: "Width must be positive" },
    });

    render(<BoxForm unit="cm" />);

    await user.type(screen.getByLabelText("Box Name"), "Test");
    await user.type(screen.getByLabelText("Width (cm)"), "30");
    await user.type(screen.getByLabelText("Height (cm)"), "20");
    await user.type(screen.getByLabelText("Depth (cm)"), "15");
    await user.click(screen.getByRole("button", { name: "Add Box" }));

    expect(await screen.findByText("Width must be positive")).toBeInTheDocument();
  });

  it("supports edit mode and calls updateBox", async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();

    render(<BoxForm unit="cm" box={existingBox} onSuccess={onSuccess} />);

    expect(screen.getByDisplayValue("Existing Box")).toBeInTheDocument();
    expect(screen.getByDisplayValue("30.0")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save Changes" })).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Box Name"));
    await user.type(screen.getByLabelText("Box Name"), "Updated Box");
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(mockedUpdateBox).toHaveBeenCalledWith(
      "box-1",
      expect.any(FormData)
    );
    expect(onSuccess).toHaveBeenCalled();
  });
});
