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
    <Dialog open={open} title={title} onClose={onClose}>
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          {message ?? (
            <>
              This will permanently delete
              {entityName ? ` "${entityName}"` : " this item"}.
            </>
          )}
        </p>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="danger" disabled={loading} onClick={handleConfirm}>
            {loading ? "Deleting..." : confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
