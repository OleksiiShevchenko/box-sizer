"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PackwellLogo } from "@/components/layout/packwell-logo";
import { UserMenu } from "@/components/layout/user-menu";

const links = [
  { href: "/dashboard", label: "Packing plans" },
  { href: "/settings/boxes", label: "Boxes" },
  { href: "/settings/api", label: "API" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center justify-between gap-6 px-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-6">
          <Link href="/dashboard" className="shrink-0 text-slate-950">
            <PackwellLogo />
          </Link>
          <div className="flex min-w-0 items-center gap-5 overflow-x-auto">
            {links.map((link) => {
              const isActive =
                link.href === "/dashboard"
                  ? pathname.startsWith("/dashboard")
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`border-b-2 px-0 py-4 text-[13px] font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "border-blue-600 text-slate-900"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="shrink-0">
          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
