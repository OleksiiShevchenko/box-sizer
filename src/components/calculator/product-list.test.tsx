import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductList } from "./product-list";

const products = [
  {
    name: "Poster",
    width: 30,
    height: 20,
    depth: 2,
    weight: 250,
  },
];

describe("ProductList", () => {
  it("renders edit and delete buttons when onEdit is provided", () => {
    render(
      <ProductList products={products} unit="cm" onEdit={jest.fn()} onRemove={jest.fn()} />
    );

    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("calls onEdit with the selected item index", async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();

    render(<ProductList products={products} unit="cm" onEdit={onEdit} onRemove={jest.fn()} />);

    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(onEdit).toHaveBeenCalledWith(0);
  });

  it("calls onRemove with the selected item index", async () => {
    const user = userEvent.setup();
    const onRemove = jest.fn();

    render(<ProductList products={products} unit="cm" onRemove={onRemove} />);

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onRemove).toHaveBeenCalledWith(0);
  });

  it("shows constraint badges for non-default values", () => {
    render(
      <ProductList
        products={[
          {
            name: "Fragile",
            quantity: 2,
            width: 10,
            height: 10,
            depth: 5,
            canStackOnTop: false,
            canBePlacedOnTop: false,
            orientation: "horizontal",
          },
        ]}
        unit="cm"
        onRemove={jest.fn()}
      />
    );
    expect(screen.getByText("x2")).toBeInTheDocument();
    expect(screen.getByText("No stacking on top")).toBeInTheDocument();
    expect(screen.getByText("Floor only")).toBeInTheDocument();
    expect(screen.getByText("Horizontal")).toBeInTheDocument();
  });

  it("hides badges when all constraints are default", () => {
    render(
      <ProductList products={products} unit="cm" onRemove={jest.fn()} />
    );
    expect(screen.queryByText("No stacking on top")).not.toBeInTheDocument();
    expect(screen.queryByText("Floor only")).not.toBeInTheDocument();
    expect(screen.queryByText("Horizontal")).not.toBeInTheDocument();
    expect(screen.queryByText("Vertical")).not.toBeInTheDocument();
  });
});
