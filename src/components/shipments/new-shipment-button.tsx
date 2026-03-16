"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createShipment } from "@/actions/shipment-actions";

interface NewShipmentButtonProps {
  className?: string;
}

export function NewShipmentButton({ className }: NewShipmentButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const { id } = await createShipment();
      router.push(`/dashboard/shipments/${id}`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <Button className={className} disabled={loading} onClick={handleClick}>
      {loading ? "Creating..." : "New Shipment"}
    </Button>
  );
}
