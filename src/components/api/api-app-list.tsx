"use client";

import { ApiAppCard } from "@/components/api/api-app-card";

type ApiApp = Awaited<ReturnType<typeof import("@/actions/api-app-actions").getApiApps>>[number];

interface ApiAppListProps {
  apps: ApiApp[];
  onUpdated: (app: ApiApp) => void;
  onDeleted: (publicId: string) => void;
}

export function ApiAppList({ apps, onUpdated, onDeleted }: ApiAppListProps) {
  if (apps.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <h2 className="text-lg font-semibold text-gray-900">No API apps yet</h2>
        <p className="mt-2 text-sm text-gray-600">
          Create an app to generate OAuth client credentials for the public API.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {apps.map((app) => (
        <ApiAppCard key={app.publicId} app={app} onUpdated={onUpdated} onDeleted={onDeleted} />
      ))}
    </div>
  );
}
