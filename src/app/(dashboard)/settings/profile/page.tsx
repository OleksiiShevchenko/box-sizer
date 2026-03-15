import { getProfile } from "@/actions/profile-actions";
import { ProfileForm } from "@/components/profile/profile-form";

export default async function ProfileSettingsPage() {
  const profile = await getProfile();
  return <ProfileForm profile={profile} />;
}
