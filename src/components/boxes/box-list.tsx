"use client";

import { BoxCard } from "./box-card";

interface Box {
  id: string;
  name: string;
  width: number;
  height: number;
  depth: number;
  maxWeight: number | null;
}

interface BoxListProps {
  boxes: Box[];
  unit: "cm" | "in";
}

export function BoxList({ boxes, unit }: BoxListProps) {
  if (boxes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No boxes added yet</p>
        <p className="text-sm">Add your first box using the form above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {boxes.map((box) => (
        <BoxCard key={box.id} {...box} unit={unit} />
      ))}
    </div>
  );
}
