"use client";

import { useActionState } from "react";
import { changeCustomerPassword } from "@/lib/actions/customer-auth";
import { inviteCustomerStaff } from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialManagement = { error: null, activationPath: null };

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changeCustomerPassword, { error: null });
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Change password</CardTitle></CardHeader>
      <CardContent>
        <form action={action} className="space-y-3">
          <div className="space-y-1"><Label>Current password</Label><Input name="currentPassword" type="password" required /></div>
          <div className="space-y-1"><Label>New password</Label><Input name="newPassword" type="password" minLength={10} required /></div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" disabled={pending}>Update password</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function InviteStaffForm({
  restaurants,
}: {
  restaurants: Array<{ id: string; businessName: string }>;
}) {
  const [state, action, pending] = useActionState(inviteCustomerStaff, initialManagement);
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Invite restaurant staff</CardTitle></CardHeader>
      <CardContent>
        <form action={action} className="space-y-3">
          <div className="space-y-1"><Label>Email</Label><Input name="email" type="email" required /></div>
          <div className="space-y-1">
            <Label>Restaurant</Label>
            <select name="restaurantId" className="h-9 w-full rounded-md border bg-background px-3 text-sm" required>
              {restaurants.map((restaurant) => <option key={restaurant.id} value={restaurant.id}>{restaurant.businessName}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <Label>Role</Label>
            <select name="role" className="h-9 w-full rounded-md border bg-background px-3 text-sm">
              <option value="EDITOR">Editor</option>
              <option value="VIEWER">Viewer</option>
              <option value="OWNER">Owner</option>
            </select>
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          {state.activationPath && (
            <div className="rounded-md border bg-muted p-3 text-sm">
              Share this one-time activation link:
              <a
                className="mt-1 block break-all font-mono text-primary underline"
                href={state.activationPath}
                target="_blank"
                rel="noreferrer"
              >
                {state.activationPath}
              </a>
            </div>
          )}
          <Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create invitation"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
