"use client";

import { useEffect, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface DialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  maxWidthClassName?: string;
  contentClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  headerBorder?: boolean;
  closeLabel?: string;
}

export function Dialog({
  open,
  title,
  children,
  onClose,
  maxWidthClassName = "max-w-2xl",
  contentClassName = "px-6 pb-6",
  headerClassName = "",
  titleClassName = "",
  headerBorder = false,
  closeLabel = "Close",
}: DialogProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative z-10 w-full ${maxWidthClassName} rounded-xl bg-white shadow-[0_8px_24px_rgba(15,23,42,0.12)] transition-all duration-200`}
      >
        <div
          className={`flex items-start justify-between gap-4 px-6 pt-5 pb-4 ${headerBorder ? "border-b border-slate-200" : ""} ${headerClassName}`}
        >
          <h2 id={titleId} className={`text-lg font-semibold text-slate-800 ${titleClassName}`}>
            {title}
          </h2>
          <button
            type="button"
            className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
            onClick={onClose}
          >
            {closeLabel}
          </button>
        </div>

        <div className={contentClassName}>{children}</div>
      </div>
    </div>,
    document.body
  );
}
