"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { IProduct, UnitSystem } from "@/types";
import { cmToInches } from "@/types";

interface ProductListProps {
  products: IProduct[];
  unit: UnitSystem;
  onRemove: (index: number) => void;
  onEdit?: (index: number) => void;
  emptyMessage?: string;
}

function displayDim(value: number, unit: UnitSystem): string {
  if (unit === "in") return cmToInches(value).toFixed(1);
  return value.toFixed(1);
}

function ActionIcon({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span aria-hidden="true" className="h-4 w-4">
      {children}
    </span>
  );
}

export function ProductList({
  products,
  unit,
  onRemove,
  onEdit,
  emptyMessage = "No products added yet. Use the form above to add products.",
}: ProductListProps) {
  if (products.length === 0) {
    return (
      <p className="py-4 text-sm text-gray-500">{emptyMessage}</p>
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
          <div className="flex items-center gap-2">
            {onEdit ? (
              <Button
                variant="ghost"
                size="sm"
                aria-label="Edit"
                onClick={() => onEdit(index)}
              >
                <ActionIcon>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9" />
                    <path d="m16.5 3.5 4 4L7 21H3v-4L16.5 3.5Z" />
                  </svg>
                </ActionIcon>
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              aria-label="Delete"
              onClick={() => onRemove(index)}
            >
              <ActionIcon>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6 18 20H6L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
              </ActionIcon>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
