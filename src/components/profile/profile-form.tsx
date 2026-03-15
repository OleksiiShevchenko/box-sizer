"use client";

import { useState } from "react";
import { updateEmail, updatePassword } from "@/actions/profile-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { IProfile } from "@/types";

export function ProfileForm({ profile }: { profile: IProfile }) {
  const [email, setEmail] = useState(profile.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingEmail(true);
    setEmailMessage("");
    const result = await updateEmail(email);
    setSavingEmail(false);
    setEmailMessage(result.success ? "Email updated." : result.error ?? "Unable to update email");
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordMessage("");

    if (newPassword !== confirmPassword) {
      setPasswordMessage("New password and confirmation must match");
      return;
    }

    setSavingPassword(true);
    const result = await updatePassword(currentPassword, newPassword);
    setSavingPassword(false);
    setPasswordMessage(
      result.success ? "Password updated." : result.error ?? "Unable to update password"
    );

    if (result.success) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-sm text-gray-500">
              Update your account details and authentication settings.
            </p>
          </div>
          {profile.isGoogleUser ? (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              Google SSO
            </span>
          ) : null}
        </div>

        <form className="space-y-4" onSubmit={handleEmailSubmit}>
          <Input
            id="profile-email"
            label="Email"
            type="email"
            disabled={profile.isGoogleUser}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {emailMessage ? (
            <p className="text-sm text-gray-600">{emailMessage}</p>
          ) : null}
          {!profile.isGoogleUser ? (
            <div className="flex justify-end">
              <Button type="submit" disabled={savingEmail}>
                {savingEmail ? "Saving..." : "Save Email"}
              </Button>
            </div>
          ) : null}
        </form>
      </Card>

      {profile.isGoogleUser || !profile.hasPassword ? null : (
        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
            <p className="text-sm text-gray-500">
              Use your current password to set a new one.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handlePasswordSubmit}>
            <Input
              id="current-password"
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
            <Input
              id="new-password"
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
            <Input
              id="confirm-password"
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            {passwordMessage ? (
              <p className="text-sm text-gray-600">{passwordMessage}</p>
            ) : null}
            <div className="flex justify-end">
              <Button type="submit" disabled={savingPassword}>
                {savingPassword ? "Saving..." : "Update Password"}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
