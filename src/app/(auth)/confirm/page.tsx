"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { confirmEmail } from "@/actions/auth-actions";
import { Card } from "@/components/ui/card";
import Link from "next/link";

type ConfirmEmailResult = Awaited<ReturnType<typeof confirmEmail>>;

function ConfirmResult({
  token,
  email,
}: {
  token: string;
  email: string;
}) {
  const [result, setResult] = useState<ConfirmEmailResult | null>(null);

  useEffect(() => {
    let cancelled = false;

    void confirmEmail(token, email)
      .then((nextResult) => {
        if (!cancelled) {
          setResult(nextResult);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResult({ error: "Confirmation failed. Please try again." });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token, email]);

  if (!result) {
    return (
      <>
        <div className="text-4xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold mb-2">Confirming your email...</h1>
      </>
    );
  }

  if (result.error) {
    return (
      <>
        <div className="text-4xl mb-4">❌</div>
        <h1 className="text-2xl font-bold mb-2">Confirmation Failed</h1>
        <p className="text-gray-600 mb-6">{result.error}</p>
        <Link href="/signup" className="text-blue-600 hover:underline">
          Try signing up again
        </Link>
      </>
    );
  }

  return (
    <>
      <div className="text-4xl mb-4">✅</div>
      <h1 className="text-2xl font-bold mb-2">Email Confirmed!</h1>
      <p className="text-gray-600 mb-6">
        Your email has been confirmed! You can now log in.
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

function ConfirmContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return (
      <Card className="w-full max-w-md mx-auto text-center">
        <div className="text-4xl mb-4">❌</div>
        <h1 className="text-2xl font-bold mb-2">Confirmation Failed</h1>
        <p className="text-gray-600 mb-6">Invalid confirmation link.</p>
        <Link href="/signup" className="text-blue-600 hover:underline">
          Try signing up again
        </Link>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto text-center">
      <ConfirmResult token={token} email={email} />
    </Card>
  );
}

export default function ConfirmPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <ConfirmContent />
    </div>
  );
}
