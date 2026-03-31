import { SessionProvider } from "next-auth/react";
import { Nav } from "@/components/layout/nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-slate-100">
        <Nav />
        <main className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-8 lg:px-20">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
