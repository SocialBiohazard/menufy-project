"use client";

import { useActionState } from "react";
import { loginCustomer } from "@/lib/actions/customer-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CustomerLoginForm({ message }: { message?: string }) {
  const [state, action, pending] = useActionState(loginCustomer, { error: null });
  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Restaurant portal</CardTitle>
          <CardDescription>Manage your menu and restaurant information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer-email">Email</Label>
              <Input id="customer-email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-password">Password</Label>
              <Input id="customer-password" name="password" type="password" autoComplete="current-password" required />
            </div>
            {message && <p className="text-sm text-emerald-700">{message}</p>}
            {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
