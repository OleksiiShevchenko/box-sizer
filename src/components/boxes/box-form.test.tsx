import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BoxForm } from "./box-form";
import { createBox, updateBox } from "@/actions/box-actions";
import { inchesToCm } from "@/types";

const refreshMock = jest.fn();

jest.mock("@/actions/box-actions", () => ({
  createBox: jest.fn().mockResolvedValue({ success: true }),
  updateBox: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

const mockedCreateBox = createBox as jest.Mock;
const mockedUpdateBox = updateBox as jest.Mock;

const existingBox = {
  id: "box-1",
  name: "Existing Box",
  width: 30,
  height: 20,
  depth: 10,
  spacing: 2.5,
  maxWeight: 4000,
};

describe("BoxForm", () => {
  beforeEach(() => {
    mockedCreateBox.mockClear();
    mockedUpdateBox.mockClear();
    refreshMock.mockClear();
  });

  it("renders all form fields", () => {
    render(<BoxForm unit="cm" />);
    expect(screen.getByLabelText("Box Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Width (cm)")).toBeInTheDocument();
    expect(screen.getByLabelText("Height (cm)")).toBeInTheDocument();
    expect(screen.getByLabelText("Depth (cm)")).toBeInTheDocument();
    expect(screen.getByLabelText("Item Spacing (cm)")).toBeInTheDocument();
    expect(screen.getByLabelText("Max Weight (g, optional)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Box" })).toBeInTheDocument();
  });

  it("shows inch labels when unit is inches", () => {
    render(<BoxForm unit="in" />);
    expect(screen.getByLabelText("Width (in)")).toBeInTheDocument();
    expect(screen.getByLabelText("Height (in)")).toBeInTheDocument();
    expect(screen.getByLabelText("Depth (in)")).toBeInTheDocument();
    expect(screen.getByLabelText("Item Spacing (in)")).toBeInTheDocument();
  });

  it("submits the form with valid data", async () => {
    const user = userEvent.setup();

    render(<BoxForm unit="cm" />);

    await user.type(screen.getByLabelText("Box Name"), "Test Box");
    await user.type(screen.getByLabelText("Width (cm)"), "30");
    await user.type(screen.getByLabelText("Height (cm)"), "20");
    await user.type(screen.getByLabelText("Depth (cm)"), "15");
    await user.clear(screen.getByLabelText("Item Spacing (cm)"));
    await user.type(screen.getByLabelText("Item Spacing (cm)"), "2");
    await user.click(screen.getByRole("button", { name: "Add Box" }));

    expect(mockedCreateBox).toHaveBeenCalled();
    expect(refreshMock).toHaveBeenCalled();
  });

  it("converts spacing from inches to cm before submitting", async () => {
    const user = userEvent.setup();

    render(<BoxForm unit="in" />);

    await user.type(screen.getByLabelText("Box Name"), "Imperial Box");
    await user.clear(screen.getByLabelText("Width (in)"));
    await user.type(screen.getByLabelText("Width (in)"), "10");
    await user.clear(screen.getByLabelText("Height (in)"));
    await user.type(screen.getByLabelText("Height (in)"), "8");
    await user.clear(screen.getByLabelText("Depth (in)"));
    await user.type(screen.getByLabelText("Depth (in)"), "6");
    await user.clear(screen.getByLabelText("Item Spacing (in)"));
    await user.type(screen.getByLabelText("Item Spacing (in)"), "1");
    await user.click(screen.getByRole("button", { name: "Add Box" }));

    const formData = mockedCreateBox.mock.calls[0][0] as FormData;
    expect(formData.get("spacing")).toBe(inchesToCm(1).toString());
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
    expect(screen.getByDisplayValue("2.5")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save Changes" })).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Box Name"));
    await user.type(screen.getByLabelText("Box Name"), "Updated Box");
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(mockedUpdateBox).toHaveBeenCalledWith(
      "box-1",
      expect.any(FormData)
    );
    expect(refreshMock).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });

  it("submits an empty max weight when edit mode clears the optional field", async () => {
    const user = userEvent.setup();

    render(<BoxForm unit="cm" box={existingBox} />);

    const maxWeightInput = screen.getByLabelText("Max Weight (g, optional)");
    await user.clear(maxWeightInput);
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    const formData = mockedUpdateBox.mock.calls[0][1] as FormData;
    expect(formData.get("maxWeight")).toBe("");
  });
});
