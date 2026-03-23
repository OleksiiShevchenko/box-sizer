"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { YesNoToggle } from "@/components/ui/yes-no-toggle";
import type { IProduct, Orientation, UnitSystem } from "@/types";
import { cmToInches, inchesToCm, ozToGrams, gramsToOz } from "@/types";

interface ProductFormProps {
  unit: UnitSystem;
  onAdd: (product: IProduct) => void;
  initialProduct?: IProduct;
  submitLabel?: string;
  showQuantity?: boolean;
}

function getDisplayDimension(value: number, unit: UnitSystem): string {
  if (unit === "in") {
    return cmToInches(value).toFixed(1);
  }

  return value.toFixed(1);
}

export function ProductForm({
  unit,
  onAdd,
  initialProduct,
  submitLabel = "Add Product",
  showQuantity = false,
}: ProductFormProps) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [canStackOnTop, setCanStackOnTop] = useState(initialProduct?.canStackOnTop ?? true);
  const [canBePlacedOnTop, setCanBePlacedOnTop] = useState(initialProduct?.canBePlacedOnTop ?? true);
  const [orientation, setOrientation] = useState<Orientation>(initialProduct?.orientation ?? "any");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const nextFieldErrors: Record<string, string> = {};

    let width = Number(formData.get("width"));
    let height = Number(formData.get("height"));
    let depth = Number(formData.get("depth"));
    const quantityValue = showQuantity
      ? Number(formData.get("quantity"))
      : (initialProduct?.quantity ?? 1);
    const weightStr = formData.get("weight")?.toString().trim() ?? "";
    const name = (formData.get("productName") as string) || "Product";

    if (showQuantity) {
      if (!formData.get("quantity")?.toString().trim()) {
        nextFieldErrors.quantity = "Quantity is required";
      } else if (!Number.isInteger(quantityValue) || quantityValue <= 0) {
        nextFieldErrors.quantity = "Quantity must be at least 1";
      }
    }

    if (!formData.get("width")?.toString().trim()) {
      nextFieldErrors.width = "Width is required";
    } else if (Number.isNaN(width) || width <= 0) {
      nextFieldErrors.width = "Width must be positive";
    }

    if (!formData.get("height")?.toString().trim()) {
      nextFieldErrors.height = "Height is required";
    } else if (Number.isNaN(height) || height <= 0) {
      nextFieldErrors.height = "Height must be positive";
    }

    if (!formData.get("depth")?.toString().trim()) {
      nextFieldErrors.depth = "Depth is required";
    } else if (Number.isNaN(depth) || depth <= 0) {
      nextFieldErrors.depth = "Depth must be positive";
    }

    if (weightStr) {
      const weight = Number(weightStr);
      if (Number.isNaN(weight) || weight < 0) {
        nextFieldErrors.weight = "Weight must be non-negative";
      }
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setFieldErrors({});

    // Convert to cm for internal use
    if (unit === "in") {
      width = inchesToCm(width);
      height = inchesToCm(height);
      depth = inchesToCm(depth);
    }

    const product: IProduct = {
      name,
      quantity: quantityValue,
      width,
      height,
      depth,
      canStackOnTop,
      canBePlacedOnTop,
      orientation,
    };

    if (weightStr) {
      const rawWeight = Number(weightStr);
      product.weight = unit === "in" ? ozToGrams(rawWeight) : rawWeight;
    }

    onAdd(product);
    form.reset();
    setCanStackOnTop(true);
    setCanBePlacedOnTop(true);
    setOrientation("any");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="product-name"
        name="productName"
        label="Product Name"
        placeholder="e.g., T-Shirt"
        defaultValue={initialProduct?.name ?? ""}
      />

      {showQuantity ? (
        <Input
          id="product-quantity"
          name="quantity"
          type="number"
          min="1"
          step="1"
          label="How many units"
          defaultValue={String(initialProduct?.quantity ?? 1)}
          error={fieldErrors.quantity}
        />
      ) : null}

      <div className="grid grid-cols-3 gap-3">
        <Input
          id="product-width"
          name="width"
          type="number"
          step="0.1"
          label={`Width (${unit})`}
          defaultValue={
            initialProduct ? getDisplayDimension(initialProduct.width, unit) : ""
          }
          error={fieldErrors.width}
        />
        <Input
          id="product-height"
          name="height"
          type="number"
          step="0.1"
          label={`Height (${unit})`}
          defaultValue={
            initialProduct ? getDisplayDimension(initialProduct.height, unit) : ""
          }
          error={fieldErrors.height}
        />
        <Input
          id="product-depth"
          name="depth"
          type="number"
          step="0.1"
          label={`Depth (${unit})`}
          defaultValue={
            initialProduct ? getDisplayDimension(initialProduct.depth, unit) : ""
          }
          error={fieldErrors.depth}
        />
      </div>

      <Input
        id="product-weight"
        name="weight"
        type="number"
        step="0.1"
        label={`Weight (${unit === "in" ? "oz" : "g"}, optional)`}
        placeholder="Optional"
        defaultValue={
          initialProduct?.weight != null
            ? (unit === "in" ? gramsToOz(initialProduct.weight) : initialProduct.weight).toFixed(1)
            : ""
        }
        error={fieldErrors.weight}
      />

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label htmlFor="canStackOnTop-yes" className="text-sm text-gray-700">
            Can other items be stacked on top of this item?
          </label>
          <YesNoToggle id="canStackOnTop" value={canStackOnTop} onChange={setCanStackOnTop} />
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="canBePlacedOnTop-yes" className="text-sm text-gray-700">
            Can this item be placed on top of other items?
          </label>
          <YesNoToggle id="canBePlacedOnTop" value={canBePlacedOnTop} onChange={setCanBePlacedOnTop} />
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="orientation" className="text-sm text-gray-700">
            How can this item be oriented when packed?
          </label>
          <select
            id="orientation"
            value={orientation}
            onChange={(e) => setOrientation(e.target.value as Orientation)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700"
          >
            <option value="any">Any orientation</option>
            <option value="horizontal">Horizontal only</option>
            <option value="vertical">Vertical only</option>
          </select>
        </div>
      </div>

      <Button type="submit" variant="secondary">
        {submitLabel}
      </Button>
    </form>
  );
}
