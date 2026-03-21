"use client";

import Link from "next/link";
import { useState } from "react";
import { ApiAppCreateDialog } from "@/components/api/api-app-create-dialog";
import { ApiAppList } from "@/components/api/api-app-list";
import { Button } from "@/components/ui/button";

type ApiApp = Awaited<ReturnType<typeof import("@/actions/api-app-actions").getApiApps>>[number];

export function ApiSettingsClient({ initialApps }: { initialApps: ApiApp[] }) {
  const [apps, setApps] = useState(initialApps);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Access</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage OAuth client credentials for the Packwell.io public API.
          </p>
          <Link
            href="/api/v1/docs"
            className="mt-2 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            View API documentation
          </Link>
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          Create API App
        </Button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">OAuth Client Credentials</h2>
        <p className="mt-2 text-sm text-gray-600">
          Each app gets a client ID and client secret. Exchange them at
          <span className="mx-1 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-900">
            /api/v1/oauth/token
          </span>
          for a Bearer token.
        </p>
      </div>

      <ApiAppList
        apps={apps}
        onUpdated={(updatedApp) => {
          setApps((current) =>
            current.map((app) => (app.publicId === updatedApp.publicId ? updatedApp : app))
          );
        }}
        onDeleted={(publicId) => {
          setApps((current) => current.filter((app) => app.publicId !== publicId));
        }}
      />

      <ApiAppCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(app) => {
          setApps((current) => [app, ...current]);
        }}
      />
    </div>
  );
}
