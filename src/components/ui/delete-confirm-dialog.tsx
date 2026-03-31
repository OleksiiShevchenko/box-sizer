"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

interface DeleteConfirmDialogProps {
  open: boolean;
  title?: string;
  message?: ReactNode;
  entityName?: string;
  confirmLabel?: string;
  loading?: boolean;
  error?: string;
  onClose: () => void;
  onConfirm: () => Promise<boolean> | boolean;
}

export function DeleteConfirmDialog({
  open,
  title = "Delete item",
  message,
  entityName,
  confirmLabel = "Delete",
  loading = false,
  error,
  onClose,
  onConfirm,
}: DeleteConfirmDialogProps) {
  async function handleConfirm() {
    const shouldClose = await onConfirm();

    if (shouldClose) {
      onClose();
    }
  }

  return (
    <Dialog
      open={open}
      title={title}
      onClose={onClose}
      maxWidthClassName="max-w-[420px]"
      contentClassName="px-0 pb-0"
      headerBorder
      titleClassName="text-base"
    >
      <div className="px-6 py-6">
        <p className="text-sm text-slate-700">
          {message ?? (
            <>
              This will permanently delete
              {entityName ? ` "${entityName}"` : " this item"}.
            </>
          )}
        </p>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      </div>

      <div className="flex items-center justify-end gap-4 border-t border-slate-200 px-6 py-4">
        <button
          type="button"
          className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
          onClick={onClose}
        >
          Cancel
        </button>
        <Button type="button" variant="danger" disabled={loading} onClick={handleConfirm}>
          {loading ? "Deleting..." : confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
