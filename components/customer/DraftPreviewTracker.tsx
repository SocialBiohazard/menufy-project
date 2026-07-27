"use client";

import { useEffect } from "react";
import { recordDraftPreview } from "@/lib/actions/restaurant";

export function DraftPreviewTracker({ restaurantId }: { restaurantId: string }) {
  useEffect(() => {
    void recordDraftPreview(restaurantId);
  }, [restaurantId]);
  return null;
}
