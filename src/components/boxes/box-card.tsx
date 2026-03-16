"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteBox } from "@/actions/box-actions";
import { useState } from "react";
import { BoxForm } from "@/components/boxes/box-form";
import { Dialog } from "@/components/ui/dialog";
import type { BoxFormValues } from "./types";

interface BoxCardProps extends BoxFormValues {
  unit: "cm" | "in";
}

function convert(value: number, unit: "cm" | "in"): string {
  if (unit === "in") return (value / 2.54).toFixed(1);
  return value.toFixed(1);
}

export function BoxCard({ id, name, width, height, depth, spacing, maxWeight, unit }: BoxCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await deleteBox(id);
  }

  return (
    <Card className="flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-gray-900">{name}</h3>
        <p className="text-sm text-gray-500">
          {convert(width, unit)} x {convert(height, unit)} x {convert(depth, unit)} {unit}
          {" | "}Spacing: {convert(spacing ?? 0, unit)} {unit}
          {maxWeight != null && ` | Max: ${(unit === "in" ? maxWeight / 28.3495 : maxWeight).toFixed(1)}${unit === "in" ? "oz" : "g"}`}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={() => setIsEditDialogOpen(true)}>
          Edit
        </Button>
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "..." : "Delete"}
        </Button>
      </div>

      <Dialog
        open={isEditDialogOpen}
        title={`Edit ${name}`}
        onClose={() => setIsEditDialogOpen(false)}
      >
        <BoxForm
          unit={unit}
          box={{ id, name, width, height, depth, spacing, maxWeight }}
          onSuccess={() => setIsEditDialogOpen(false)}
        />
      </Dialog>
    </Card>
  );
}
