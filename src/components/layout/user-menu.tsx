"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";

function getInitial(value: string | null | undefined): string {
  return (value?.trim().charAt(0) ?? "U").toUpperCase();
}

export function UserMenu() {
  const { data } = useSession();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const displayName = data?.user?.name ?? data?.user?.email ?? "User";

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="User menu"
        onClick={() => setOpen((current) => !current)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-semibold text-white transition-colors hover:bg-green-700"
      >
        <span aria-hidden="true">{getInitial(displayName)}</span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg shadow-slate-900/10"
        >
          <div className="border-b border-slate-100 px-3 py-2">
            <p className="text-sm font-medium text-slate-900">{displayName}</p>
            {data?.user?.email ? (
              <p className="text-xs text-slate-500">{data.user.email}</p>
            ) : null}
          </div>
          <Link
            href="/settings/profile"
            role="menuitem"
            className="mt-2 block rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
            onClick={() => setOpen(false)}
          >
            Profile Settings
          </Link>
          <Link
            href="/settings/billing"
            role="menuitem"
            className="block rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
            onClick={() => setOpen(false)}
          >
            Subscription & Billing
          </Link>
          <button
            type="button"
            role="menuitem"
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
