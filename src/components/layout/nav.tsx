"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PackwellLogo } from "@/components/layout/packwell-logo";
import { UserMenu } from "@/components/layout/user-menu";

const links = [
  { href: "/dashboard", label: "Shipments" },
  { href: "/settings/packaging", label: "Packaging" },
  { href: "/settings/api", label: "API" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center text-slate-950">
              <PackwellLogo className="h-7 w-auto" />
            </Link>
            <div className="flex gap-1">
              {links.map((link) => {
                const isActive =
                  link.href === "/dashboard"
                    ? pathname.startsWith("/dashboard")
                    : pathname.startsWith(link.href);

                return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {link.label}
                </Link>
                );
              })}
            </div>
          </div>
          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
