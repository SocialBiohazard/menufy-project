import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PortalNotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-lg rounded-xl border bg-background p-8 text-center shadow-sm">
        <Store className="mx-auto size-9 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-semibold">Location unavailable</h1>
        <p className="mt-2 text-muted-foreground">
          This location does not exist or is not assigned to your account.
        </p>
        <Button
          className="mt-5"
          variant="outline"
          nativeButton={false}
          render={<Link href="/portal" />}
        >
          <ArrowLeft className="size-4" />
          Restaurant overview
        </Button>
      </div>
    </main>
  );
}
