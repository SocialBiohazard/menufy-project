"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PortalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="rounded-xl border bg-background p-10 text-center">
      <AlertTriangle className="mx-auto size-9 text-destructive" />
      <h1 className="mt-4 text-xl font-semibold">This screen could not load</h1>
      <p className="mt-2 text-muted-foreground">
        Your changes were not submitted. Try loading the screen again.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Button onClick={unstable_retry}>Try again</Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reload page
        </Button>
      </div>
    </div>
  );
}
