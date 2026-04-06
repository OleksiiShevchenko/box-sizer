"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";

function ResetPasswordForm({
  token,
  email,
}: {
  token: string;
  email: string;
}) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    formData.set("token", token);
    formData.set("email", email);

    const result = await resetPassword(formData);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <>
        <div className="text-4xl mb-4">✅</div>
        <h1 className="text-2xl font-bold mb-2">Password Reset!</h1>
        <p className="text-gray-600 mb-6">
          Your password has been updated. You can now log in with your new
          password.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Go to Login
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-6">
        Set New Password
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <Input
          id="password"
          name="password"
          type="password"
          label="New Password"
          placeholder="********"
          autoComplete="new-password"
          required
          minLength={8}
        />

        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          placeholder="********"
          autoComplete="new-password"
          required
          minLength={8}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return (
      <Card className="w-full max-w-md mx-auto text-center">
        <div className="text-4xl mb-4">❌</div>
        <h1 className="text-2xl font-bold mb-2">Invalid Reset Link</h1>
        <p className="text-gray-600 mb-6">
          This password reset link is invalid or incomplete.
        </p>
        <Link href="/forgot-password" className="text-blue-600 hover:underline">
          Request a new reset link
        </Link>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <ResetPasswordForm token={token} email={email} />
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Suspense
        fallback={
          <Card className="w-full max-w-md mx-auto text-center">
            <div className="text-4xl mb-4">⏳</div>
            <h1 className="text-2xl font-bold">Loading...</h1>
          </Card>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
