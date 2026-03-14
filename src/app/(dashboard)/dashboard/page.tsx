import { getBoxes } from "@/actions/box-actions";
import { DashboardClient } from "./client";

export default async function DashboardPage() {
  const boxes = await getBoxes();
  return <DashboardClient hasBoxes={boxes.length > 0} />;
}
