import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  return (
    <html lang="en" className="scroll-smooth">
      <head>
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
