"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
            className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
            data-testid={`demo-item-${item.id}`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold text-slate-900">{item.name}</h3>
                <p className="text-sm text-slate-500">{formatItemMeta(item)}</p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => onDelete(item.id)}>
                Delete
              </Button>
            </div>
            <div className="max-w-[160px]">
              <Input
                id={`quantity-${item.id}`}
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                label="Quantity"
                value={item.quantity}
                onChange={(event) => onQuantityChange(item.id, event.target.value)}
                error={fieldErrors[item.id]}
              />
            </div>
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
