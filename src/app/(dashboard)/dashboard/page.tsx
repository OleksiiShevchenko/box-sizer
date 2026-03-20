import { getSubscriptionInfo } from "@/actions/subscription-actions";
import { getBoxes } from "@/actions/box-actions";
import { getUnitSystem } from "@/actions/profile-actions";
import { getShipments } from "@/actions/shipment-actions";
import { Card } from "@/components/ui/card";
import { DashboardClient } from "./client";

interface DashboardPageProps {
  searchParams?: Promise<{ page?: string }> | { page?: string };
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const page = Math.max(1, Number(params?.page ?? "1") || 1);
  const pageSize = 10;
  const [boxes, { shipments, totalCount, schemaReady }, unitSystem, subscriptionInfo] = await Promise.all([
    getBoxes(),
    getShipments(page, pageSize),
    getUnitSystem(),
    getSubscriptionInfo(),
  ]);
  const dashboardStateKey = `${page}:${totalCount}:${shipments.map((shipment) => shipment.id).join(",")}`;

  if (!schemaReady) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Shipments</h1>
        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Database migration required</h2>
          <p className="text-sm text-gray-600">
            The shipment tables are not available in this environment yet. Apply the latest
            Prisma migration and redeploy to enable the shipment dashboard.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <DashboardClient
      key={dashboardStateKey}
      hasBoxes={boxes.length > 0}
      initialShipments={shipments}
      totalCount={totalCount}
      page={page}
      pageSize={pageSize}
      subscriptionInfo={subscriptionInfo}
      unitSystem={unitSystem}
    />
  );
}
