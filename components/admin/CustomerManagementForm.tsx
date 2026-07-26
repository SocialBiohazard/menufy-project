"use client";

import { useActionState } from "react";
import { createCustomerWorkspace } from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CustomerManagementForm({
  restaurants,
}: {
  restaurants: Array<{ id: string; businessName: string }>;
}) {
  const [state, action, pending] = useActionState(createCustomerWorkspace, {
    error: null,
    activationPath: null,
  });
  return (
    <form action={action} className="space-y-4 rounded-lg border p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1"><Label>Customer/company name</Label><Input name="accountName" required /></div>
        <div className="space-y-1"><Label>Owner email</Label><Input name="email" type="email" required /></div>
      </div>
      <div className="space-y-1">
        <Label>Initial restaurant</Label>
        <select name="restaurantId" className="h-9 w-full rounded-md border bg-background px-3 text-sm" required>
          <option value="">Select a restaurant</option>
          {restaurants.map((restaurant) => <option key={restaurant.id} value={restaurant.id}>{restaurant.businessName}</option>)}
        </select>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.activationPath && (
        <div className="rounded-md border bg-muted p-3 text-sm">
          Customer activation path:
          <code className="mt-1 block break-all">{state.activationPath}</code>
        </div>
      )}
      <Button type="submit" disabled={pending || restaurants.length === 0}>Create customer workspace</Button>
    </form>
  );
}
