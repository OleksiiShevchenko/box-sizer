import { getApiApps } from "@/actions/api-app-actions";
import { ApiSettingsClient } from "./client";

export default async function ApiSettingsPage() {
  const apps = await getApiApps();

  return <ApiSettingsClient initialApps={apps} />;
}
