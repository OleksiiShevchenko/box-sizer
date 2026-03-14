"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { createBox } from "@/actions/box-actions";
import { inchesToCm } from "@/types";

interface BoxFormProps {
  unit: "cm" | "in";
}

export function BoxForm({ unit }: BoxFormProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Convert inches to cm for storage if needed
    if (unit === "in") {
      const width = parseFloat(formData.get("width") as string);
      const height = parseFloat(formData.get("height") as string);
      const depth = parseFloat(formData.get("depth") as string);
      formData.set("width", inchesToCm(width).toString());
      formData.set("height", inchesToCm(height).toString());
      formData.set("depth", inchesToCm(depth).toString());
    }

    const result = await createBox(formData);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      form.reset();
    }
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold mb-4">Add New Box</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <Input id="name" name="name" label="Box Name" placeholder="e.g., Small Box" required />

        <div className="grid grid-cols-3 gap-3">
          <Input
            id="width"
            name="width"
            type="number"
            step="0.1"
            min="0.1"
            label={`Width (${unit})`}
            required
          />
          <Input
            id="height"
            name="height"
            type="number"
            step="0.1"
            min="0.1"
            label={`Height (${unit})`}
            required
          />
          <Input
            id="depth"
            name="depth"
            type="number"
            step="0.1"
            min="0.1"
            label={`Depth (${unit})`}
            required
          />
        </div>

        <Input
          id="maxWeight"
          name="maxWeight"
          type="number"
          step="0.1"
          min="0.1"
          label="Max Weight (g, optional)"
          placeholder="Optional"
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Box"}
        </Button>
      </form>
    </Card>
  );
}
