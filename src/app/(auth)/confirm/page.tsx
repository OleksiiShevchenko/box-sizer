"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { confirmEmail } from "@/actions/auth-actions";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Suspense } from "react";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      setStatus("error");
      setMessage("Invalid confirmation link.");
      return;
    }

    confirmEmail(token, email).then((result) => {
      if (result.error) {
        setStatus("error");
        setMessage(result.error);
      } else {
        setStatus("success");
        setMessage("Your email has been confirmed! You can now log in.");
      }
    });
  }, [searchParams]);

  return (
    <Card className="w-full max-w-md mx-auto text-center">
      {status === "loading" && (
        <>
          <div className="text-4xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold">Confirming your email...</h1>
        </>
      )}
      {status === "success" && (
        <>
          <div className="text-4xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-2">Email Confirmed!</h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <Link
            href="/login"
            className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2">Confirmation Failed</h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <Link href="/signup" className="text-blue-600 hover:underline">
            Try signing up again
          </Link>
        </>
      )}
    </Card>
  );
}

export default function ConfirmPage() {
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
        <ConfirmContent />
      </Suspense>
    </div>
  );
}
