"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await requestPasswordReset(formData);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md mx-auto text-center">
          <div className="text-4xl mb-4">📧</div>
          <h1 className="text-2xl font-bold mb-2">Check your email</h1>
          <p className="text-gray-600 mb-6">
            If an account exists with that email, we&apos;ve sent a password
            reset link. The link will expire in 1 hour.
          </p>
          <Link
            href="/login"
            className="text-blue-600 hover:underline text-sm"
          >
            Back to login
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-2">
          Forgot Password
        </h1>
        <p className="text-center text-sm text-gray-600 mb-6">
          Enter your email and we&apos;ll send you a link to reset your
          password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          <Link href="/login" className="text-blue-600 hover:underline">
            Back to login
          </Link>
        </p>
      </Card>
    </div>
  );
}
