"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { IProduct, UnitSystem } from "@/types";
import { inchesToCm } from "@/types";

interface ProductFormProps {
  unit: UnitSystem;
  onAdd: (product: IProduct) => void;
}

export function ProductForm({ unit, onAdd }: ProductFormProps) {
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    let width = parseFloat(formData.get("width") as string);
    let height = parseFloat(formData.get("height") as string);
    let depth = parseFloat(formData.get("depth") as string);
    const weightStr = formData.get("weight") as string;
    const name = (formData.get("name") as string) || "Product";

    if (isNaN(width) || isNaN(height) || isNaN(depth)) {
      setError("Please enter valid dimensions");
      return;
    }

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

    if (weightStr && !isNaN(parseFloat(weightStr))) {
      product.weight = parseFloat(weightStr);
    }

    onAdd(product);
    form.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Input
        id="product-name"
        name="name"
        label="Product Name"
        placeholder="e.g., T-Shirt"
      />

      <div className="grid grid-cols-3 gap-3">
        <Input
          id="product-width"
          name="width"
          type="number"
          step="0.1"
          min="0.1"
          label={`Width (${unit})`}
          required
        />
        <Input
          id="product-height"
          name="height"
          type="number"
          step="0.1"
          min="0.1"
          label={`Height (${unit})`}
          required
        />
        <Input
          id="product-depth"
          name="depth"
          type="number"
          step="0.1"
          min="0.1"
          label={`Depth (${unit})`}
          required
        />
      </div>

      <Input
        id="product-weight"
        name="weight"
        type="number"
        step="0.1"
        min="0"
        label="Weight (g, optional)"
        placeholder="Optional"
      />

      <Button type="submit" variant="secondary">
        Add Product
      </Button>
    </form>
  );
}
