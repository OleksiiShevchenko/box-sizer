"use client";

import { Button } from "@/components/ui/button";
import type { IProduct, UnitSystem } from "@/types";
import { cmToInches } from "@/types";

interface ProductListProps {
  products: IProduct[];
  unit: UnitSystem;
  onRemove: (index: number) => void;
}

function displayDim(value: number, unit: UnitSystem): string {
  if (unit === "in") return cmToInches(value).toFixed(1);
  return value.toFixed(1);
}

export function ProductList({ products, unit, onRemove }: ProductListProps) {
  if (products.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-4">
        No products added yet. Use the form above to add products.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {products.map((product, index) => (
        <div
          key={index}
          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
        >
          <div>
            <span className="font-medium text-gray-900">
              {product.name || `Product ${index + 1}`}
            </span>
            <span className="ml-2 text-sm text-gray-500">
              {displayDim(product.width, unit)} x {displayDim(product.height, unit)} x{" "}
              {displayDim(product.depth, unit)} {unit}
              {product.weight != null && ` | ${product.weight}g`}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onRemove(index)}>
            Remove
          </Button>
        </div>
      ))}
    </div>
  );
}
