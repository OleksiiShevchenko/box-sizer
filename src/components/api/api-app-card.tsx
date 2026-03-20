"use client";

import { useMemo, useState, useTransition } from "react";
import {
  deleteApiApp,
  regenerateClientSecret,
  updateApiAppName,
} from "@/actions/api-app-actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";

type ApiApp = Awaited<ReturnType<typeof import("@/actions/api-app-actions").getApiApps>>[number];

interface ApiAppCardProps {
  app: ApiApp;
  onUpdated: (app: ApiApp) => void;
  onDeleted: (publicId: string) => void;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function ApiAppCard({ app, onUpdated, onDeleted }: ApiAppCardProps) {
  const [draftName, setDraftName] = useState(app.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [latestSecret, setLatestSecret] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const metadata = useMemo(
    () => [
      { label: "Client ID", value: app.clientId, mono: true },
      { label: "Created", value: formatDate(app.createdAt), mono: false },
    ],
    [app.clientId, app.createdAt]
  );

  function copy(value: string) {
    return navigator.clipboard.writeText(value);
  }

  function saveName() {
    setActionError(null);

    startTransition(async () => {
      const result = await updateApiAppName(app.publicId, draftName);
      if (result.error || !result.app) {
        setActionError(result.error ?? "Failed to update API app");
        return;
      }

      onUpdated(result.app);
      setIsEditingName(false);
    });
  }

  function handleRegenerateSecret() {
    setActionError(null);
    if (!window.confirm("Regenerate the client secret and revoke all active API tokens?")) {
      return;
    }

    startTransition(async () => {
      const result = await regenerateClientSecret(app.publicId);
      if (result.error || !result.app || !result.clientSecret) {
        setActionError(result.error ?? "Failed to regenerate client secret");
        return;
      }

      onUpdated(result.app);
      setLatestSecret(result.clientSecret);
    });
  }

  return (
    <>
      <Card className="space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            {isEditingName ? (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                />
                <Button type="button" size="sm" disabled={isPending} onClick={saveName}>
                  Save
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setDraftName(app.name);
                    setIsEditingName(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">{app.name}</h2>
                <Button type="button" size="sm" variant="secondary" onClick={() => setIsEditingName(true)}>
                  Rename
                </Button>
              </div>
            )}
            <p className="text-sm text-gray-500">Public app ID: {app.publicId}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={handleRegenerateSecret}>
              Regenerate Secret
            </Button>
            <Button type="button" variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {metadata.map((item) => (
            <div key={item.label} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  {item.label}
                </p>
                {item.label === "Client ID" ? (
                  <Button type="button" variant="ghost" size="sm" onClick={() => copy(item.value)}>
                    Copy
                  </Button>
                ) : null}
              </div>
              <p className={`mt-2 text-sm text-gray-900 ${item.mono ? "break-all font-mono" : ""}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {latestSecret ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-amber-800">
                  New Client Secret
                </p>
                <p className="mt-2 break-all font-mono text-sm text-gray-900">{latestSecret}</p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={() => copy(latestSecret)}>
                Copy Secret
              </Button>
            </div>
          </div>
        ) : null}

        {actionError ? <p className="text-sm text-red-600">{actionError}</p> : null}
      </Card>

      <DeleteConfirmDialog
        open={deleteOpen}
        title="Delete API app"
        entityName={app.name}
        error={deleteError ?? undefined}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteError(null);
        }}
        onConfirm={async () => {
          const result = await deleteApiApp(app.publicId);
          if (result.error) {
            setDeleteError(result.error);
            return false;
          }

          onDeleted(app.publicId);
          return true;
        }}
      />
    </>
  );
}
