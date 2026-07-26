import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardNotFound() {
  return (
    <div className="rounded-xl border border-dashed bg-background p-10 text-center">
      <Store className="mx-auto size-9 text-muted-foreground" />
      <h1 className="mt-4 text-xl font-semibold">Restaurant not found</h1>
      <p className="mt-2 text-muted-foreground">
        It may have been removed, or the link is no longer valid.
      </p>
      <Button
        className="mt-5"
        variant="outline"
        nativeButton={false}
        render={<Link href="/dashboard" />}
      >
        <ArrowLeft className="size-4" />
        All restaurants
      </Button>
    </div>
  );
}
