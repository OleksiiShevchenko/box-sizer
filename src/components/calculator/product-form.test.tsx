import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductForm } from "./product-form";

describe("ProductForm", () => {
  it("renders all fields", () => {
    render(<ProductForm unit="cm" onAdd={jest.fn()} />);
    expect(screen.getByLabelText("Product Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Width (cm)")).toBeInTheDocument();
    expect(screen.getByLabelText("Height (cm)")).toBeInTheDocument();
    expect(screen.getByLabelText("Depth (cm)")).toBeInTheDocument();
    expect(screen.getByLabelText("Weight (g, optional)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Product" })).toBeInTheDocument();
  });

  it("shows inch labels in inch mode", () => {
    render(<ProductForm unit="in" onAdd={jest.fn()} />);
    expect(screen.getByLabelText("Width (in)")).toBeInTheDocument();
  });

  it("calls onAdd with product data when submitted", async () => {
    const user = userEvent.setup();
    const onAdd = jest.fn();

    render(<ProductForm unit="cm" onAdd={onAdd} />);

    await user.type(screen.getByLabelText("Product Name"), "Shirt");
    await user.type(screen.getByLabelText("Width (cm)"), "30");
    await user.type(screen.getByLabelText("Height (cm)"), "20");
    await user.type(screen.getByLabelText("Depth (cm)"), "5");
    await user.click(screen.getByRole("button", { name: "Add Product" }));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Shirt",
        width: 30,
        height: 20,
        depth: 5,
      })
    );
  });

  it("shows field-level validation errors for empty dimensions", async () => {
    const user = userEvent.setup();
    const onAdd = jest.fn();

    render(<ProductForm unit="cm" onAdd={onAdd} />);

    await user.click(screen.getByRole("button", { name: "Add Product" }));

    expect(await screen.findByText("Width is required")).toBeInTheDocument();
    expect(screen.getByText("Height is required")).toBeInTheDocument();
    expect(screen.getByText("Depth is required")).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("shows an error for negative weight", async () => {
    const user = userEvent.setup();
    const onAdd = jest.fn();

    render(<ProductForm unit="cm" onAdd={onAdd} />);

    await user.type(screen.getByLabelText("Width (cm)"), "30");
    await user.type(screen.getByLabelText("Height (cm)"), "20");
    await user.type(screen.getByLabelText("Depth (cm)"), "5");
    await user.type(screen.getByLabelText("Weight (g, optional)"), "-1");
    await user.click(screen.getByRole("button", { name: "Add Product" }));

    expect(await screen.findByText("Weight must be non-negative")).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("converts inches to cm before calling onAdd", async () => {
    const user = userEvent.setup();
    const onAdd = jest.fn();

    render(<ProductForm unit="in" onAdd={onAdd} />);

    await user.type(screen.getByLabelText("Product Name"), "Item");
    await user.type(screen.getByLabelText("Width (in)"), "10");
    await user.type(screen.getByLabelText("Height (in)"), "10");
    await user.type(screen.getByLabelText("Depth (in)"), "10");
    await user.click(screen.getByRole("button", { name: "Add Product" }));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        width: expect.closeTo(25.4, 0),
        height: expect.closeTo(25.4, 0),
        depth: expect.closeTo(25.4, 0),
      })
    );
  });
});
