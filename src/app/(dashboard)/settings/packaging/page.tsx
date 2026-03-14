import { getBoxes } from "@/actions/box-actions";
import { PackagingSettingsClient } from "./client";

export default async function PackagingPage() {
  const boxes = await getBoxes();

  return <PackagingSettingsClient boxes={boxes} />;
}
