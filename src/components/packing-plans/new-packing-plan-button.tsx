"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createPackingPlan } from "@/actions/packing-plan-actions";

interface NewPackingPlanButtonProps {
  className?: string;
}

export function NewPackingPlanButton({ className }: NewPackingPlanButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const { id } = await createPackingPlan();
      router.push(`/dashboard/packing-plans/${id}`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <Button className={className} disabled={loading} onClick={handleClick}>
      {loading ? "Creating..." : "New Packing Plan"}
    </Button>
  );
}
