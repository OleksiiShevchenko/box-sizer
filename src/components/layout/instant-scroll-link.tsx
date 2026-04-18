"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

type InstantScrollLinkProps = ComponentProps<typeof Link>;

export function InstantScrollLink({
  onClick,
  ...props
}: InstantScrollLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        onClick?.(event);

        if (
          event.defaultPrevented ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        ) {
          return;
        }

        const html = document.documentElement;
        const body = document.body;
        const previousHtmlScrollBehavior = html.style.scrollBehavior;
        const previousBodyScrollBehavior = body.style.scrollBehavior;

        html.style.scrollBehavior = "auto";
        body.style.scrollBehavior = "auto";

        window.setTimeout(() => {
          html.style.scrollBehavior = previousHtmlScrollBehavior;
          body.style.scrollBehavior = previousBodyScrollBehavior;
        }, 1000);
      }}
    />
  );
}
