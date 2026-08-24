"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, ExternalLink, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { changeCustomerPassword } from "@/lib/actions/customer-auth";
import {
  inviteCustomerStaff,
  removeOwnedMembership,
  updateOwnedMembership,
} from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePanelI18n } from "@/components/shared/PanelI18nProvider";

const initialManagement = { error: null, activationPath: null, message: null };

export function ChangePasswordForm() {
  const { t } = usePanelI18n();
  const [state, action, pending] = useActionState(changeCustomerPassword, { error: null });
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{t("Change password")}</CardTitle></CardHeader>
      <CardContent>
        <form action={action} className="space-y-3">
          <div className="space-y-1"><Label htmlFor="current-password">{t("Current password")}</Label><Input id="current-password" name="currentPassword" type="password" required /></div>
          <div className="space-y-1"><Label htmlFor="new-password">{t("New password")}</Label><Input id="new-password" name="newPassword" type="password" minLength={10} required /></div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" disabled={pending}>{t("Update password")}</Button>
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
  const { t } = usePanelI18n();
  const router = useRouter();
  const [state, action, pending] = useActionState(inviteCustomerStaff, initialManagement);
  useEffect(() => {
    if (state.activationPath || state.message) router.refresh();
  }, [router, state.activationPath, state.message]);
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{t("Invite restaurant staff")}</CardTitle></CardHeader>
      <CardContent>
        <form action={action} className="space-y-3">
          <div className="space-y-1"><Label htmlFor="staff-email">{t("Email")}</Label><Input id="staff-email" name="email" type="email" required /></div>
          <div className="space-y-1">
            <Label htmlFor="staff-restaurant">{t("Restaurant")}</Label>
            <select id="staff-restaurant" name="restaurantId" className="h-9 w-full rounded-md border bg-background px-3 text-sm" required>
              {restaurants.map((restaurant) => <option key={restaurant.id} value={restaurant.id}>{restaurant.businessName}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="staff-role">{t("Role")}</Label>
            <select id="staff-role" name="role" className="h-9 w-full rounded-md border bg-background px-3 text-sm">
              <option value="EDITOR">{t("Editor")}</option>
              <option value="VIEWER">{t("Viewer")}</option>
              <option value="OWNER">{t("Owner")}</option>
            </select>
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          {state.message && <p className="text-sm text-emerald-700">{t(state.message)}</p>}
          {state.activationPath && (
            <div className="space-y-3 rounded-md border bg-muted p-3 text-sm">
              <p>{t("Share this one-time activation link:")}</p>
              <a
                className="block break-all font-mono text-primary underline"
                href={state.activationPath}
                target="_blank"
                rel="noreferrer"
              >
                {state.activationPath}
              </a>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await navigator.clipboard.writeText(state.activationPath!);
                    toast.success(t("Activation link copied"));
                  }}
                >
                  <Copy className="size-4" />
                  {t("Copy link")}
                </Button>
                <Button
                  size="sm"
                  nativeButton={false}
                  render={
                    <a
                      href={state.activationPath}
                      target="_blank"
                      rel="noreferrer"
                    />
                  }
                >
                  <ExternalLink className="size-4" />
                  {t("Open activation")}
                </Button>
              </div>
            </div>
          )}
          <Button type="submit" disabled={pending}>{pending ? t("Creating…") : t("Create invitation")}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function CustomerMemberAccessControls({
  currentUserId,
  users,
}: {
  currentUserId: string;
  users: Array<{
    id: string;
    name: string | null;
    email: string;
    memberships: Array<{
      id: string;
      role: "OWNER" | "EDITOR" | "VIEWER";
      restaurant: { businessName: string };
    }>;
  }>;
}) {
  const { t } = usePanelI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [roles, setRoles] = useState<Record<string, "OWNER" | "EDITOR" | "VIEWER">>(
    () =>
      Object.fromEntries(
        users.flatMap((user) =>
          user.memberships.map((membership) => [membership.id, membership.role]),
        ),
      ),
  );
  const run = (
    operation: () => Promise<{ ok: true } | { ok: false; error: string }>,
    success: string,
  ) => {
    startTransition(async () => {
      const result = await operation();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t(success));
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <div key={user.id} className="space-y-3 rounded-md border p-3">
          <div>
            <p className="font-medium">
              {user.name || user.email}
              {user.id === currentUserId && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {t("(you)")}
                </span>
              )}
            </p>
            {user.name && <p className="text-sm text-muted-foreground">{user.email}</p>}
          </div>
          {user.memberships.map((membership) => (
            <div key={membership.id} className="grid gap-2 sm:grid-cols-[1fr_9rem_auto_auto] sm:items-center">
              <span className="text-sm">{membership.restaurant.businessName}</span>
              <select
                value={roles[membership.id] ?? membership.role}
                disabled={pending || user.id === currentUserId}
                onChange={(event) =>
                  setRoles((current) => ({
                    ...current,
                    [membership.id]: event.target.value as "OWNER" | "EDITOR" | "VIEWER",
                  }))
                }
                className="h-9 rounded-md border bg-background px-2 text-sm disabled:opacity-60"
              >
                <option value="OWNER">{t("Owner")}</option>
                <option value="EDITOR">{t("Editor")}</option>
                <option value="VIEWER">{t("Viewer")}</option>
              </select>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={
                  pending ||
                  user.id === currentUserId ||
                  roles[membership.id] === membership.role
                }
                onClick={() =>
                  run(
                    () =>
                      updateOwnedMembership(
                        membership.id,
                        roles[membership.id] ?? membership.role,
                      ),
                    "Role updated",
                  )
                }
              >
                {t("Update")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-destructive"
                disabled={pending || user.id === currentUserId}
                onClick={() =>
                  run(
                    () => removeOwnedMembership(membership.id),
                    "Access removed",
                  )
                }
              >
                <UserMinus className="size-4" />
                {t("Remove")}
              </Button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
