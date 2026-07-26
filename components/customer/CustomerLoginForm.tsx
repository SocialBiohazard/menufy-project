"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Building2 } from "lucide-react";
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
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-foreground text-background">
            <Building2 className="size-5" />
          </div>
          <CardTitle className="text-2xl">Restaurant portal</CardTitle>
          <CardDescription>Manage your menu, brand, and restaurant information.</CardDescription>
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
          <div className="mt-5 space-y-3 border-t pt-4 text-center text-sm text-muted-foreground">
            <p>
              First visit? Open the activation link sent by your MenuApp
              operator to choose a password.
            </p>
            <p>
              MenuApp staff?{" "}
              <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
                Operator sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
