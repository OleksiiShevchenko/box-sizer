"use client";

import { useState } from "react";
import { BoxForm } from "@/components/boxes/box-form";
import { BoxList } from "@/components/boxes/box-list";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { UnitSystem } from "@/types";
import type { BoxFormValues } from "@/components/boxes/types";

export function BoxesSettingsClient({ boxes, unitSystem }: { boxes: BoxFormValues[]; unitSystem: UnitSystem }) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Box Settings</h1>
        <Button type="button" onClick={() => setIsAddDialogOpen(true)}>
          Add New Box
        </Button>
      </div>

      <Dialog
        open={isAddDialogOpen}
        title="Add New Box"
        onClose={() => setIsAddDialogOpen(false)}
      >
        <BoxForm unit={unitSystem} onSuccess={() => setIsAddDialogOpen(false)} />
      </Dialog>

      <div>
        <h2 className="text-lg font-semibold mb-3 text-gray-900">Your Boxes</h2>
        <BoxList boxes={boxes} unit={unitSystem} />
      </div>
    </div>
  );
}
