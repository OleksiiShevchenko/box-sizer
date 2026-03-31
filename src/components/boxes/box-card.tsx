"use client";

import { deleteBox } from "@/actions/box-actions";
import { useState } from "react";
import { BoxForm } from "@/components/boxes/box-form";
import { Dialog } from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import type { BoxFormValues } from "./types";

interface BoxCardProps extends BoxFormValues {
  unit: "cm" | "in";
  showDivider?: boolean;
}

function convert(value: number, unit: "cm" | "in"): string {
  if (unit === "in") return (value / 2.54).toFixed(1);
  return value.toFixed(1);
}

export function BoxCard({ id, name, width, height, depth, spacing, maxWeight, unit, showDivider = false }: BoxCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handleDelete(): Promise<boolean> {
    setDeleting(true);
    setDeleteError("");
    const result = await deleteBox(id);
    setDeleting(false);

    if (result.success) {
      return true;
    }

    setDeleteError(result.error ?? "Failed to delete box");
    return false;
  }

  return (
    <>
      <div className={`flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between ${showDivider ? "border-b border-slate-200" : ""}`}>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-800">{name}</h3>
          <p className="mt-1 text-[13px] text-slate-500">
            {convert(width, unit)} x {convert(height, unit)} x {convert(depth, unit)} {unit}
            {" | "}Spacing: {convert(spacing ?? 0, unit)} {unit}
            {maxWeight != null && ` | Max: ${(unit === "in" ? maxWeight / 28.3495 : maxWeight).toFixed(1)}${unit === "in" ? "oz" : "g"}`}
          </p>
        </div>
        <div className="flex items-center gap-4 self-start sm:self-auto">
          <button
            type="button"
            className="text-[13px] font-medium text-blue-600 transition-colors hover:text-blue-700"
            onClick={() => setIsEditDialogOpen(true)}
          >
            Edit
          </button>
          <button
            type="button"
            className="text-[13px] font-medium text-slate-400 transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={deleting}
          >
            Delete
          </button>
        </div>

        <Dialog
          open={isEditDialogOpen}
          title={`Edit ${name}`}
          maxWidthClassName="max-w-[460px]"
          contentClassName="px-0 pb-0"
          onClose={() => setIsEditDialogOpen(false)}
        >
          <BoxForm
            unit={unit}
            box={{ id, name, width, height, depth, spacing, maxWeight }}
            onSuccess={() => setIsEditDialogOpen(false)}
          />
        </Dialog>
      </div>

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        title="Delete box"
        entityName={name}
        error={deleteError}
        loading={deleting}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeleteError("");
        }}
        onConfirm={handleDelete}
      />
    </>
  );
}
