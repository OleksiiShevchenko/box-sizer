import { getBoxes } from "@/actions/box-actions";
import { getShipments } from "@/actions/shipment-actions";
import { DashboardClient } from "./client";

interface DashboardPageProps {
  searchParams?: Promise<{ page?: string }> | { page?: string };
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const page = Math.max(1, Number(params?.page ?? "1") || 1);
  const pageSize = 10;
  const boxes = await getBoxes();
  const { shipments, totalCount } = await getShipments(page, pageSize);
  const dashboardStateKey = `${page}:${totalCount}:${shipments.map((shipment) => shipment.id).join(",")}`;

  return (
    <DashboardClient
      key={dashboardStateKey}
      hasBoxes={boxes.length > 0}
      initialShipments={shipments}
      totalCount={totalCount}
      page={page}
      pageSize={pageSize}
    />
  );
}
