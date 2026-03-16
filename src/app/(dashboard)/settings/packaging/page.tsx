import { getBoxes } from "@/actions/box-actions";
import { getUnitSystem } from "@/actions/profile-actions";
import { PackagingSettingsClient } from "./client";

export default async function PackagingPage() {
  const [boxes, unitSystem] = await Promise.all([getBoxes(), getUnitSystem()]);

  return <PackagingSettingsClient boxes={boxes} unitSystem={unitSystem} />;
}
