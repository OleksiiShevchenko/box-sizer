import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { isProductionDeployment } from "@/lib/vercel-env";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Packwell — Find the Right Box for Every Order",
  description:
    "Calculate the optimal box size for every shipment, reduce shipping costs, and eliminate wasted space. Use our API or UI to optimize packing for ecommerce, 3PL, and kit workflows.",
  icons: {
    icon: [{ url: "/email/packwell-mark.svg", type: "image/svg+xml" }],
    shortcut: [{ url: "/email/packwell-mark.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "Packwell — Find the Right Box for Every Order",
    description:
      "Calculate the optimal box size for every shipment, reduce shipping costs, and eliminate wasted space. Use our API or UI to optimize packing for ecommerce, 3PL, and kit workflows.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Packwell — Find the Right Box for Every Order",
    description:
      "Calculate the optimal box size for every shipment, reduce shipping costs, and eliminate wasted space. Use our API or UI to optimize packing for ecommerce, 3PL, and kit workflows.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const shouldLoadGoogleAds = isProductionDeployment();

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {shouldLoadGoogleAds ? (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=AW-18082628701"
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'AW-18082628701');
              `}
            </Script>
          </>
        ) : null}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
