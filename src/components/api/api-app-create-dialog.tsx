"use client";

import { useState, useTransition } from "react";
import { createApiApp } from "@/actions/api-app-actions";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

type CreatedApp = NonNullable<Awaited<ReturnType<typeof createApiApp>>["app"]>;

interface ApiAppCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (app: CreatedApp) => void;
}

export function ApiAppCreateDialog({ open, onClose, onCreated }: ApiAppCreateDialogProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [createdApp, setCreatedApp] = useState<CreatedApp | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetDialogState() {
    setName("");
    setError(null);
    setCreatedSecret(null);
    setCreatedApp(null);
  }

  function handleClose() {
    resetDialogState();
    onClose();
  }

  function handleSubmit() {
    setError(null);

    startTransition(async () => {
      const result = await createApiApp(name);
      if (result.error || !result.app || !result.clientSecret) {
        setError(result.error ?? "Failed to create API app");
        return;
      }

      setCreatedApp(result.app);
      setCreatedSecret(result.clientSecret);
      onCreated(result.app);
    });
  }

  return (
    <Dialog open={open} title="Create API App" onClose={handleClose}>
      <div className="space-y-6">
        {createdSecret && createdApp ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Save this client secret now. It will not be shown again after you close this dialog.
            </p>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-800">
                Client Secret
              </p>
              <p className="mt-2 break-all rounded bg-white px-3 py-2 font-mono text-sm text-gray-900">
                {createdSecret}
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={async () => {
                  await navigator.clipboard.writeText(createdSecret);
                }}
              >
                Copy Secret
              </Button>
              <Button type="button" onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label htmlFor="api-app-name" className="text-sm font-medium text-gray-900">
                App name
              </label>
              <input
                id="api-app-name"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Internal integration name"
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="button" disabled={isPending} onClick={handleSubmit}>
                {isPending ? "Creating..." : "Create App"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}
