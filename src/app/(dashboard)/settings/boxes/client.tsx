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
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Box Settings</h1>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-slate-800">Your Boxes</h2>
        <Button type="button" className="shrink-0" onClick={() => setIsAddDialogOpen(true)}>
          Add New Box
        </Button>
      </div>

      <Dialog
        open={isAddDialogOpen}
        title="Add New Box"
        maxWidthClassName="max-w-[460px]"
        contentClassName="px-0 pb-0"
        onClose={() => setIsAddDialogOpen(false)}
      >
        <BoxForm unit={unitSystem} onSuccess={() => setIsAddDialogOpen(false)} />
      </Dialog>

      <BoxList boxes={boxes} unit={unitSystem} onAddBox={() => setIsAddDialogOpen(true)} />
    </div>
  );
}
