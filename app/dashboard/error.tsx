"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="rounded-xl border bg-background p-10 text-center">
      <AlertTriangle className="mx-auto size-9 text-destructive" />
      <h1 className="mt-4 text-xl font-semibold">The dashboard could not load</h1>
      <p className="mt-2 text-muted-foreground">
        Your data was not changed. Try loading this screen again.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Button onClick={unstable_retry}>Try again</Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reload dashboard
        </Button>
      </div>
    </div>
  );
}
