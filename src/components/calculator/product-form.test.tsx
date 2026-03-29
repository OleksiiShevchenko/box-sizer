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

  it("renders and validates the quantity field when enabled", async () => {
    const user = userEvent.setup();
    const onAdd = jest.fn();

    render(<ProductForm unit="cm" onAdd={onAdd} showQuantity />);

    expect(screen.getByLabelText("How many units")).toHaveValue(1);

    await user.clear(screen.getByLabelText("How many units"));
    await user.click(screen.getByRole("button", { name: "Add Product" }));

    expect(await screen.findByText("Quantity is required")).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("includes quantity when the packingPlan form enables it", async () => {
    const user = userEvent.setup();
    const onAdd = jest.fn();

    render(<ProductForm unit="cm" onAdd={onAdd} showQuantity />);

    await user.type(screen.getByLabelText("Product Name"), "Bottle");
    await user.clear(screen.getByLabelText("How many units"));
    await user.type(screen.getByLabelText("How many units"), "3");
    await user.type(screen.getByLabelText("Width (cm)"), "10");
    await user.type(screen.getByLabelText("Height (cm)"), "20");
    await user.type(screen.getByLabelText("Depth (cm)"), "10");
    await user.click(screen.getByRole("button", { name: "Add Product" }));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Bottle",
        quantity: 3,
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

  it("renders stacking toggles and orientation dropdown", () => {
    render(<ProductForm unit="cm" onAdd={jest.fn()} />);
    expect(screen.getByText("Can other items be stacked on top of this item?")).toBeInTheDocument();
    expect(screen.getByText("Can this item be placed on top of other items?")).toBeInTheDocument();
    expect(screen.getByText("How can this item be oriented when packed?")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Any orientation")).toBeInTheDocument();
  });

  it("defaults stacking to Yes and orientation to Any", async () => {
    const user = userEvent.setup();
    const onAdd = jest.fn();

    render(<ProductForm unit="cm" onAdd={onAdd} />);

    await user.type(screen.getByLabelText("Width (cm)"), "10");
    await user.type(screen.getByLabelText("Height (cm)"), "10");
    await user.type(screen.getByLabelText("Depth (cm)"), "5");
    await user.click(screen.getByRole("button", { name: "Add Product" }));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        canStackOnTop: true,
        canBePlacedOnTop: true,
        orientation: "any",
      })
    );
  });

  it("resets constraint state after submission", async () => {
    const user = userEvent.setup();
    const onAdd = jest.fn();

    render(<ProductForm unit="cm" onAdd={onAdd} />);

    // First submission: change constraints
    await user.type(screen.getByLabelText("Width (cm)"), "10");
    await user.type(screen.getByLabelText("Height (cm)"), "10");
    await user.type(screen.getByLabelText("Depth (cm)"), "5");
    const noButtons = screen.getAllByRole("button", { name: "No" });
    await user.click(noButtons[0]); // canStackOnTop = false
    await user.selectOptions(screen.getByDisplayValue("Any orientation"), "vertical");
    await user.click(screen.getByRole("button", { name: "Add Product" }));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ canStackOnTop: false, orientation: "vertical" })
    );

    // Second submission: don't touch constraints — they should be back to defaults
    await user.type(screen.getByLabelText("Width (cm)"), "8");
    await user.type(screen.getByLabelText("Height (cm)"), "8");
    await user.type(screen.getByLabelText("Depth (cm)"), "4");
    await user.click(screen.getByRole("button", { name: "Add Product" }));

    expect(onAdd).toHaveBeenLastCalledWith(
      expect.objectContaining({
        canStackOnTop: true,
        canBePlacedOnTop: true,
        orientation: "any",
      })
    );
  });

  it("submits with changed stacking values", async () => {
    const user = userEvent.setup();
    const onAdd = jest.fn();

    render(<ProductForm unit="cm" onAdd={onAdd} />);

    await user.type(screen.getByLabelText("Width (cm)"), "10");
    await user.type(screen.getByLabelText("Height (cm)"), "10");
    await user.type(screen.getByLabelText("Depth (cm)"), "5");

    const noButtons = screen.getAllByRole("button", { name: "No" });
    await user.click(noButtons[0]);

    await user.click(screen.getByRole("button", { name: "Add Product" }));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        canStackOnTop: false,
        canBePlacedOnTop: true,
      })
    );
  });

  it("submits with changed orientation", async () => {
    const user = userEvent.setup();
    const onAdd = jest.fn();

    render(<ProductForm unit="cm" onAdd={onAdd} />);

    await user.type(screen.getByLabelText("Width (cm)"), "10");
    await user.type(screen.getByLabelText("Height (cm)"), "10");
    await user.type(screen.getByLabelText("Depth (cm)"), "5");
    await user.selectOptions(screen.getByDisplayValue("Any orientation"), "horizontal");
    await user.click(screen.getByRole("button", { name: "Add Product" }));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        orientation: "horizontal",
      })
    );
  });

  it("loads initial constraint values in edit mode", () => {
    render(
      <ProductForm
        unit="cm"
        onAdd={jest.fn()}
        initialProduct={{
          name: "Item",
          width: 10,
          height: 10,
          depth: 5,
          canStackOnTop: false,
          canBePlacedOnTop: true,
          orientation: "vertical",
        }}
      />
    );
    expect(screen.getByDisplayValue("Vertical only")).toBeInTheDocument();
  });
});
