"use client";

import { useEffect, useRef, type PropsWithChildren } from "react";

export function ScrollReveal({ children }: PropsWithChildren) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const items = Array.from(
      container.querySelectorAll<HTMLElement>("[data-reveal]"),
    );

    if (!items.length) {
      return;
    }

    const revealAll = () => {
      items.forEach((item) => item.classList.add("is-visible"));
    };

    const markInViewItems = () => {
      const cutoff = window.innerHeight * 0.88;

      items.forEach((item) => {
        if (item.getBoundingClientRect().top <= cutoff) {
          item.classList.add("is-visible");
        }
      });
    };

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver === "undefined"
    ) {
      container.classList.add("scroll-reveal-ready");
      revealAll();
      return;
    }

    markInViewItems();
    container.classList.add("scroll-reveal-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -12% 0px",
      },
    );

    items.forEach((item) => {
      if (!item.classList.contains("is-visible")) {
        observer.observe(item);
      }
    });

    return () => observer.disconnect();
  }, []);

  return <div ref={containerRef}>{children}</div>;
}
