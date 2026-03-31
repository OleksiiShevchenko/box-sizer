"use client";

import { BoxCard } from "./box-card";
import type { BoxFormValues } from "./types";

interface BoxListProps {
  boxes: BoxFormValues[];
  unit: "cm" | "in";
  onAddBox?: () => void;
}

function EmptyBoxIcon() {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
      <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-white">
        <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3 4 7l8 4 8-4-8-4Z" />
          <path d="M4 7v10l8 4 8-4V7" />
          <path d="m12 11 8-4" />
          <path d="M12 11 4 7" />
          <path d="M12 11v10" />
        </svg>
      </div>
    </div>
  );
}

export function BoxList({ boxes, unit, onAddBox }: BoxListProps) {
  if (boxes.length === 0) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex w-full max-w-[420px] flex-col items-center gap-5 rounded-xl border border-slate-200 bg-white p-10 text-center">
          <EmptyBoxIcon />
          <div className="space-y-2">
            <p className="text-xl font-semibold text-slate-800">No boxes added yet</p>
            <p className="mx-auto max-w-[300px] text-sm text-slate-500">
              Add your first box to enable optimal packing calculations.
            </p>
          </div>
          {onAddBox ? (
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              onClick={onAddBox}
            >
              <span aria-hidden="true" className="text-base leading-none">+</span>
              <span>Add New Box</span>
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
      {boxes.map((box, index) => (
        <BoxCard key={box.id} {...box} unit={unit} showDivider={index < boxes.length - 1} />
      ))}
      <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-slate-500">Showing 1-{boxes.length} of {boxes.length} boxes</p>
        <div className="flex items-center gap-2 text-[13px]">
          <span className="text-slate-400">Previous</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 font-semibold text-white">1</span>
          <span className="text-slate-400">Next</span>
        </div>
      </div>
    </div>
  );
}
