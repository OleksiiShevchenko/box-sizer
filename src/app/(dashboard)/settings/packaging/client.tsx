"use client";

import { useState } from "react";
import { BoxForm } from "@/components/boxes/box-form";
import { BoxList } from "@/components/boxes/box-list";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { UnitToggle } from "@/components/ui/unit-toggle";
import type { UnitSystem } from "@/types";
import type { BoxFormValues } from "@/components/boxes/types";

export function PackagingSettingsClient({ boxes }: { boxes: BoxFormValues[] }) {
  const [unit, setUnit] = useState<UnitSystem>("cm");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Packaging Settings</h1>
        <div className="flex items-center gap-3">
          <Button type="button" onClick={() => setIsAddDialogOpen(true)}>
            Add New Box
          </Button>
          <UnitToggle unit={unit} onChange={setUnit} />
        </div>
      </div>

      <Dialog
        open={isAddDialogOpen}
        title="Add New Box"
        onClose={() => setIsAddDialogOpen(false)}
      >
        <BoxForm unit={unit} onSuccess={() => setIsAddDialogOpen(false)} />
      </Dialog>

      <div>
        <h2 className="text-lg font-semibold mb-3 text-gray-900">Your Boxes</h2>
        <BoxList boxes={boxes} unit={unit} />
      </div>
    </div>
  );
}
