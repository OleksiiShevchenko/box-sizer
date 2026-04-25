"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { DemoScenario } from "@/lib/demo-scenarios";

export interface DemoDraftItem {
  id: string;
  name: string;
  widthIn: number;
  heightIn: number;
  depthIn: number;
  weightOz: number;
  quantity: string;
}

interface DemoOrderFormProps {
  scenario: DemoScenario;
  items: DemoDraftItem[];
  loading: boolean;
  error: string;
  fieldErrors: Record<string, string>;
  onQuantityChange: (itemId: string, quantity: string) => void;
  onDelete: (itemId: string) => void;
  onCalculate: () => void;
}

function formatItemMeta(item: DemoDraftItem): string {
  return `${item.widthIn} x ${item.heightIn} x ${item.depthIn} in | ${item.weightOz} oz`;
}

export function DemoOrderForm({
  scenario,
  items,
  loading,
  error,
  fieldErrors,
  onQuantityChange,
  onDelete,
  onCalculate,
}: DemoOrderFormProps) {
  return (
    <Card className="space-y-6" data-testid="demo-order-form">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">{scenario.name}</h2>
        <p className="text-sm text-slate-500">{scenario.description}</p>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-2 gap-y-2 rounded-lg border border-slate-200 bg-white px-3 py-3 sm:px-4"
            data-testid={`demo-item-${item.id}`}
          >
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-5">
                <h3 className="min-w-0 truncate font-semibold leading-9 text-slate-900" title={item.name}>
                  {item.name}
                </h3>
                <div className="flex shrink-0 items-center gap-1">
                  <label
                    htmlFor={`quantity-${item.id}`}
                    className="text-xs font-medium text-slate-500"
                  >
                    Q-ty:
                  </label>
                  <input
                    id={`quantity-${item.id}`}
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    aria-label="Quantity"
                    aria-invalid={fieldErrors[item.id] ? "true" : "false"}
                    aria-describedby={fieldErrors[item.id] ? `quantity-${item.id}-error` : undefined}
                    className={`block h-9 w-12 rounded-lg border px-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500 ${
                      fieldErrors[item.id]
                        ? "border-red-600 focus:border-red-600 focus:ring-red-600/10"
                        : "border-slate-200 focus:border-blue-600 focus:ring-blue-600/15"
                    }`}
                    value={item.quantity}
                    onChange={(event) => onQuantityChange(item.id, event.target.value)}
                  />
                </div>
              </div>
              <p className="text-sm text-slate-500">{formatItemMeta(item)}</p>
              {fieldErrors[item.id] ? (
                <p id={`quantity-${item.id}-error`} className="mt-1 text-[11px] font-medium text-red-600">
                  {fieldErrors[item.id]}
                </p>
              ) : null}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="!px-0"
              onClick={() => onDelete(item.id)}
            >
              Delete
            </Button>
          </div>
        ))}
      </div>

      {error ? (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      ) : null}

      <div className="flex justify-end">
        <Button
          type="button"
          size="lg"
          disabled={items.length === 0 || loading}
          onClick={onCalculate}
        >
          {loading ? "Calculating..." : "Calculate Box"}
        </Button>
      </div>
    </Card>
  );
}
