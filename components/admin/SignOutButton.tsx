import { LogOut } from "lucide-react";
import { logoutOperator } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action={logoutOperator}>
      <Button variant="ghost" size="sm" type="submit">
        <LogOut className="size-4" />
        Sign out
      </Button>
    </form>
  );
}
