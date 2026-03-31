"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBox, updateBox } from "@/actions/box-actions";
import { cmToInches, inchesToCm, ozToGrams, gramsToOz } from "@/types";
import type { BoxFormValues } from "./types";

interface BoxFormProps {
  unit: "cm" | "in";
  box?: BoxFormValues;
  onSuccess?: () => void;
}

type FieldErrors = Record<string, string>;

function validateBoxValues(formData: FormData): FieldErrors {
  const name = formData.get("boxName")?.toString().trim() ?? "";
  const width = formData.get("width")?.toString().trim() ?? "";
  const height = formData.get("height")?.toString().trim() ?? "";
  const depth = formData.get("depth")?.toString().trim() ?? "";
  const spacing = formData.get("spacing")?.toString().trim() ?? "";
  const maxWeight = formData.get("maxWeight")?.toString().trim() ?? "";

  const fieldErrors: FieldErrors = {};

  if (!name) fieldErrors.name = "Name is required";

  const numericFields = [
    { key: "width", label: "Width", value: width },
    { key: "height", label: "Height", value: height },
    { key: "depth", label: "Depth", value: depth },
  ] as const;

  for (const field of numericFields) {
    if (!field.value) {
      fieldErrors[field.key] = `${field.label} is required`;
      continue;
    }

    const numericValue = Number(field.value);
    if (Number.isNaN(numericValue) || numericValue <= 0) {
      fieldErrors[field.key] = `${field.label} must be positive`;
    }
  }

  if (spacing) {
    const numericValue = Number(spacing);
    if (Number.isNaN(numericValue) || numericValue < 0) {
      fieldErrors.spacing = "Spacing must be non-negative";
    }
  }

  if (maxWeight) {
    const numericValue = Number(maxWeight);
    if (Number.isNaN(numericValue) || numericValue <= 0) {
      fieldErrors.maxWeight = "Max weight must be positive";
    }
  }

  return fieldErrors;
}

function getDisplayDimension(value: number, unit: "cm" | "in"): string {
  if (unit === "in") {
    return cmToInches(value).toFixed(1);
  }

  return value.toFixed(1);
}

export function BoxForm({ unit, box, onSuccess }: BoxFormProps) {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const isEditMode = Boolean(box);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const clientFieldErrors = validateBoxValues(formData);

    if (Object.keys(clientFieldErrors).length > 0) {
      setFieldErrors(clientFieldErrors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    // Convert inches to cm for storage if needed
    if (unit === "in") {
      const width = Number(formData.get("width"));
      const height = Number(formData.get("height"));
      const depth = Number(formData.get("depth"));
      const spacing = Number(formData.get("spacing"));
      formData.set("width", inchesToCm(width).toString());
      formData.set("height", inchesToCm(height).toString());
      formData.set("depth", inchesToCm(depth).toString());
      formData.set("spacing", inchesToCm(spacing).toString());
      const maxWeightStr = formData.get("maxWeight")?.toString().trim() ?? "";
      if (maxWeightStr) {
        formData.set("maxWeight", ozToGrams(Number(maxWeightStr)).toString());
      }
    }

    const result = isEditMode && box
      ? await updateBox(box.id, formData)
      : await createBox(formData);

    setLoading(false);

    if (result.fieldErrors) {
      setFieldErrors(result.fieldErrors);
      return;
    }

    setFieldErrors({});
    if (!isEditMode) {
      form.reset();
    }
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 px-6 pb-6">
      {fieldErrors.form && (
        <div className="rounded-lg bg-red-50 px-3.5 py-3 text-sm text-red-600">
          {fieldErrors.form}
        </div>
      )}

      <Input
        id="box-name"
        name="boxName"
        label="Box Name"
        placeholder="e.g., Small Box"
        defaultValue={box?.name ?? ""}
        error={fieldErrors.name}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input
          id="width"
          name="width"
          type="number"
          step="0.1"
          label={`Width (${unit})`}
          defaultValue={box ? getDisplayDimension(box.width, unit) : ""}
          error={fieldErrors.width}
        />
        <Input
          id="height"
          name="height"
          type="number"
          step="0.1"
          label={`Height (${unit})`}
          defaultValue={box ? getDisplayDimension(box.height, unit) : ""}
          error={fieldErrors.height}
        />
        <Input
          id="depth"
          name="depth"
          type="number"
          step="0.1"
          label={`Depth (${unit})`}
          defaultValue={box ? getDisplayDimension(box.depth, unit) : ""}
          error={fieldErrors.depth}
        />
      </div>

      <Input
        id="spacing"
        name="spacing"
        type="number"
        step="0.1"
        label={`Item Spacing (${unit})`}
        defaultValue={getDisplayDimension(box?.spacing ?? 0, unit)}
        error={fieldErrors.spacing}
      />

      <Input
        id="maxWeight"
        name="maxWeight"
        type="number"
        step="0.1"
        label={`Max Weight (${unit === "in" ? "oz" : "g"}, optional)`}
        placeholder="Optional"
        defaultValue={
          box?.maxWeight != null
            ? (unit === "in" ? gramsToOz(box.maxWeight) : box.maxWeight).toFixed(1)
            : ""
        }
        error={fieldErrors.maxWeight}
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading
            ? isEditMode
              ? "Saving..."
              : "Adding..."
            : isEditMode
              ? "Save Changes"
              : "Add Box"}
        </Button>
      </div>
    </form>
  );
}
