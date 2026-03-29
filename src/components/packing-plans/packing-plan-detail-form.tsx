"use client";

import { useState } from "react";
import Link from "next/link";
import { calculateAndSavePackingPlan } from "@/actions/packing-plan-actions";
import { ProductForm } from "@/components/calculator/product-form";
import { ProductList } from "@/components/calculator/product-list";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { IProduct, IPackingPlan, PackingResult, UnitSystem } from "@/types";
import { cmToInches, getTotalProductUnits, inchesToCm } from "@/types";

const QUOTA_UPGRADE_SUFFIX = "Upgrade your plan to continue.";

interface PackingPlanDetailFormProps {
  packingPlan: IPackingPlan;
  hasBoxes: boolean;
  unitSystem: UnitSystem;
  onCalculated: (
    name: string,
    results: PackingResult[],
    idealResult: PackingResult | null
  ) => void;
  onNameChange: (name: string) => void;
}

export function PackingPlanDetailForm({
  packingPlan,
  hasBoxes,
  unitSystem,
  onCalculated,
  onNameChange,
}: PackingPlanDetailFormProps) {
  const [name, setName] = useState(packingPlan.name);
  const [spacingOverride, setSpacingOverride] = useState(
    packingPlan.spacingOverride != null
      ? (unitSystem === "in" ? cmToInches(packingPlan.spacingOverride) : packingPlan.spacingOverride).toFixed(1)
      : ""
  );
  const [items, setItems] = useState<IProduct[]>(packingPlan.items);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleNameChange(value: string) {
    setName(value);
    onNameChange(value);
  }

  function handleUpsertItem(item: IProduct) {
    setItems((currentItems) => {
      if (editingIndex == null) {
        return [...currentItems, item];
      }

      return currentItems.map((currentItem, index) =>
        index === editingIndex ? item : currentItem
      );
    });
    setIsDialogOpen(false);
    setEditingIndex(null);
    setError("");
  }

  function handleRemoveItem(index: number) {
    setItems((currentItems) => currentItems.filter((_, currentIndex) => currentIndex !== index));
    setError("");
  }

  async function handleCalculate() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Packing plan name is required");
      return;
    }

    if (items.length === 0) {
      return;
    }

    let parsedSpacing: number | null = null;
    if (spacingOverride.trim() !== "") {
      parsedSpacing = Number(spacingOverride);
      if (Number.isNaN(parsedSpacing) || parsedSpacing < 0) {
        setError("Spacing override must be a non-negative number");
        return;
      }
      if (unitSystem === "in") {
        parsedSpacing = inchesToCm(parsedSpacing);
      }
    }

    setLoading(true);
    setError("");
    const result = await calculateAndSavePackingPlan(packingPlan.id, {
      name: trimmedName,
      items,
      spacingOverride: parsedSpacing,
    });
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onCalculated(trimmedName, result.results ?? [], result.idealResult ?? null);
  }

  const editingItem = editingIndex != null ? items[editingIndex] : undefined;
  const totalUnits = getTotalProductUnits(items);
  const showsQuotaUpgradeLink = error.endsWith(QUOTA_UPGRADE_SUFFIX);
  const quotaErrorPrefix = showsQuotaUpgradeLink
    ? error.slice(0, -QUOTA_UPGRADE_SUFFIX.length)
    : "";

  return (
    <Card className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Packing plan details</h1>
        <p className="text-sm text-gray-500">
          Measurements are displayed in {unitSystem === "in" ? "inches" : "centimeters"}. All values are stored in cm.
        </p>
      </div>

      <Input
        id="packing-plan-name"
        label="Packing Plan Name"
        value={name}
        onChange={(event) => handleNameChange(event.target.value)}
      />

      <Input
        id="packing-plan-spacing"
        label={`Spacing Override (${unitSystem}, optional)`}
        tooltip="Each box can have a custom item spacing configured, but you can override it on the packing plan level."
        type="number"
        step="0.1"
        value={spacingOverride}
        onChange={(event) => setSpacingOverride(event.target.value)}
      />

      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Products</h2>
          <p className="text-sm text-gray-500">
            {totalUnits} unit{totalUnits === 1 ? "" : "s"} across {items.length} item
            {items.length === 1 ? " type" : " types"}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 py-8 text-center">
            <p className="text-sm text-gray-500">No items added yet.</p>
            <div className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(true)}>
                + Add Item
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ProductList
              products={items}
              unit={unitSystem}
              onEdit={(index) => {
                setEditingIndex(index);
                setIsDialogOpen(true);
              }}
              onRemove={handleRemoveItem}
            />
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(true)}>
              + Add Item
            </Button>
          </>
        )}
      </div>

      {error ? (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {showsQuotaUpgradeLink ? (
            <>
              {quotaErrorPrefix}
              <Link href="/pricing" className="font-medium underline hover:no-underline">
                Upgrade
              </Link>{" "}
              your plan to continue.
            </>
          ) : (
            error
          )}
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button
          type="button"
          size="lg"
          disabled={items.length === 0 || loading}
          onClick={handleCalculate}
        >
          {loading
            ? "Calculating..."
            : hasBoxes
              ? "Calculate Best Box"
              : "Calculate Ideal Box"}
        </Button>
      </div>

      <Dialog
        open={isDialogOpen}
        title={editingIndex == null ? "Add Item" : "Edit Item"}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingIndex(null);
        }}
      >
        <ProductForm
          key={editingIndex == null ? "new-item" : `edit-item-${editingIndex}`}
          unit={unitSystem}
          initialProduct={editingItem}
          submitLabel={editingIndex == null ? "Add Product" : "Save Product"}
          showQuantity
          onAdd={handleUpsertItem}
        />
      </Dialog>
    </Card>
  );
}
