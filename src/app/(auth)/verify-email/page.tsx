import { Card } from "@/components/ui/card";
import Link from "next/link";
import Script from "next/script";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Script id="gtag-conversion" strategy="afterInteractive">
        {`
          gtag('event', 'conversion', {
            'send_to': 'AW-18082628701/WkZACIiLpJocEN2IvK5D',
            'value': 1.0,
            'currency': 'EUR'
          });
        `}
      </Script>
      <Card className="w-full max-w-md mx-auto text-center">
        <div className="text-4xl mb-4">📧</div>
        <h1 className="text-2xl font-bold mb-2">Check your email</h1>
        <p className="text-gray-600 mb-6">
          We&apos;ve sent a confirmation link to your email address. Please click
          the link to verify your account.
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
