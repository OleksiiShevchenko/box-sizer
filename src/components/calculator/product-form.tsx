"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { IProduct, UnitSystem } from "@/types";
import { cmToInches, inchesToCm, ozToGrams, gramsToOz } from "@/types";

interface ProductFormProps {
  unit: UnitSystem;
  onAdd: (product: IProduct) => void;
  initialProduct?: IProduct;
  submitLabel?: string;
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
}: ProductFormProps) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const nextFieldErrors: Record<string, string> = {};

    let width = Number(formData.get("width"));
    let height = Number(formData.get("height"));
    let depth = Number(formData.get("depth"));
    const weightStr = formData.get("weight")?.toString().trim() ?? "";
    const name = (formData.get("name") as string) || "Product";

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
      width,
      height,
      depth,
    };

    if (weightStr) {
      const rawWeight = Number(weightStr);
      product.weight = unit === "in" ? ozToGrams(rawWeight) : rawWeight;
    }

    onAdd(product);
    form.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="product-name"
        name="name"
        label="Product Name"
        placeholder="e.g., T-Shirt"
        defaultValue={initialProduct?.name ?? ""}
      />

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

      <Button type="submit" variant="secondary">
        {submitLabel}
      </Button>
    </form>
  );
}
