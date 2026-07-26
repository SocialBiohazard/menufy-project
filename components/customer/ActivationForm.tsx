"use client";

import { useActionState } from "react";
import { KeyRound } from "lucide-react";
import { activateCustomer } from "@/lib/actions/customer-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ActivationForm({ token, email }: { token: string; email: string }) {
  const [state, action, pending] = useActionState(activateCustomer, { error: null });
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-foreground text-background">
          <KeyRound className="size-5" />
        </div>
        <CardTitle className="text-2xl">Activate restaurant access</CardTitle>
        <CardDescription>
          Create the password for <span className="font-medium text-foreground">{email}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          <div className="space-y-2">
            <Label htmlFor="activation-password">Choose a password</Label>
            <Input id="activation-password" name="password" type="password" minLength={10} maxLength={128} required />
            <p className="text-xs text-muted-foreground">
              Use at least 10 characters. This invitation can only be used once.
            </p>
          </div>
          {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Activating…" : "Activate account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
