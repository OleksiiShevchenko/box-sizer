"use client";

import { useState } from "react";
import { BoxForm } from "@/components/boxes/box-form";
import { BoxList } from "@/components/boxes/box-list";
import { UnitToggle } from "@/components/ui/unit-toggle";
import type { UnitSystem } from "@/types";

interface Box {
  id: string;
  name: string;
  width: number;
  height: number;
  depth: number;
  maxWeight: number | null;
}

export function PackagingSettingsClient({ boxes }: { boxes: Box[] }) {
  const [unit, setUnit] = useState<UnitSystem>("cm");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Packaging Settings</h1>
        <UnitToggle unit={unit} onChange={setUnit} />
      </div>
      <BoxForm unit={unit} />
      <div>
        <h2 className="text-lg font-semibold mb-3 text-gray-900">Your Boxes</h2>
        <BoxList boxes={boxes} unit={unit} />
      </div>
    </div>
  );
}
