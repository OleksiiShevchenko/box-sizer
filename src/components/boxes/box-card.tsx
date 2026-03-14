"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteBox } from "@/actions/box-actions";
import { useState } from "react";

interface BoxCardProps {
  id: string;
  name: string;
  width: number;
  height: number;
  depth: number;
  maxWeight: number | null;
  unit: "cm" | "in";
}

function convert(value: number, unit: "cm" | "in"): string {
  if (unit === "in") return (value / 2.54).toFixed(1);
  return value.toFixed(1);
}

export function BoxCard({ id, name, width, height, depth, maxWeight, unit }: BoxCardProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await deleteBox(id);
  }

  return (
    <Card className="flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-gray-900">{name}</h3>
        <p className="text-sm text-gray-500">
          {convert(width, unit)} x {convert(height, unit)} x {convert(depth, unit)} {unit}
          {maxWeight != null && ` | Max: ${maxWeight}g`}
        </p>
      </div>
      <Button
        variant="danger"
        size="sm"
        onClick={handleDelete}
        disabled={deleting}
      >
        {deleting ? "..." : "Delete"}
      </Button>
    </Card>
  );
}
