"use client";

import Link from "next/link";
import posthog from "posthog-js";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { detectUnitSystemFromLocale } from "@/lib/unit-system";

interface DimensionalWeightDemoLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  children: ReactNode;
}

export function DimensionalWeightDemoLink({
  children,
  onClick,
  ...props
}: DimensionalWeightDemoLinkProps) {
  return (
    <Link
      href="/demo"
      onClick={(event) => {
        const unitSystem = detectUnitSystemFromLocale(navigator.language);
        posthog.capture("dimensional_weight_demo_clicked", {
          unit_system: unitSystem,
          actual_weight: null,
          package_dimensions: null,
          highest_dimensional_weight: null,
          highest_billable_weight: null,
          dimensional_weight_exceeds_actual_weight: null,
        });
        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </Link>
  );
}
