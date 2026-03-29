import { getBoxes } from "@/actions/box-actions";
import { getUnitSystem } from "@/actions/profile-actions";
import { BoxesSettingsClient } from "./client";

export default async function BoxPage() {
  const [boxes, unitSystem] = await Promise.all([getBoxes(), getUnitSystem()]);

  return <BoxesSettingsClient boxes={boxes} unitSystem={unitSystem} />;
}
