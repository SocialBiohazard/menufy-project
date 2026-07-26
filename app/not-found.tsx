import Link from "next/link";
import { CircleHelp, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-lg rounded-2xl border bg-background p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full bg-muted">
          <CircleHelp className="size-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">404</p>
        <h1 className="mt-1 text-2xl font-semibold">This menu is unavailable</h1>
        <p className="mx-auto mt-3 max-w-sm text-muted-foreground">
          The link may be incorrect, or the restaurant may not have published
          its menu yet. Ask the restaurant for its current menu link.
        </p>
        <Button
          className="mt-6"
          variant="outline"
          nativeButton={false}
          render={<Link href="/portal/login" />}
        >
          <LogIn className="size-4" />
          Restaurant portal
        </Button>
      </div>
    </main>
  );
}
