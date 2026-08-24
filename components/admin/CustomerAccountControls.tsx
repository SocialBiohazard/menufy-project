"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Trash2, UserMinus, Unlink, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  assignRestaurantToCustomer,
  deleteCustomerWorkspace,
  inviteCustomerUserAsOperator,
  removeCustomerUser,
  unassignRestaurantFromCustomer,
  updateCustomerAccount,
  updateCustomerMembership,
} from "@/lib/actions/customers";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePanelI18n } from "@/components/shared/PanelI18nProvider";

const initialState = { error: null, activationPath: null };

export function CustomerAccountSettings({
  account,
}: {
  account: {
    id: string;
    plan: "TRIAL" | "BASIC" | "PRO";
    maxRestaurants: number;
    maxStorageMb: number;
    isActive: boolean;
  };
}) {
  const { t } = usePanelI18n();
  const [state, action, pending] = useActionState(updateCustomerAccount, initialState);
  return (
    <form action={action} className="grid gap-3 rounded-md border p-3 sm:grid-cols-4">
      <input type="hidden" name="accountId" value={account.id} />
      <div className="space-y-1">
        <Label>{t("Plan")}</Label>
        <select name="plan" defaultValue={account.plan} className="h-9 w-full rounded-md border bg-background px-2 text-sm">
          <option value="TRIAL">Trial</option>
          <option value="BASIC">Basic</option>
          <option value="PRO">Pro</option>
        </select>
      </div>
      <div className="space-y-1"><Label>{t("Location limit")}</Label><Input name="maxRestaurants" type="number" min={1} defaultValue={account.maxRestaurants} /></div>
      <div className="space-y-1"><Label>{t("Storage (MB)")}</Label><Input name="maxStorageMb" type="number" min={100} defaultValue={account.maxStorageMb} /></div>
      <div className="space-y-1">
        <Label>{t("Status")}</Label>
        <select name="isActive" defaultValue={String(account.isActive)} className="h-9 w-full rounded-md border bg-background px-2 text-sm">
          <option value="true">{t("Active")}</option>
          <option value="false">{t("Suspended")}</option>
        </select>
      </div>
      {state.error && <p className="text-sm text-destructive sm:col-span-4">{state.error}</p>}
      <Button type="submit" size="sm" disabled={pending} className="sm:col-span-4 sm:justify-self-end">
        {pending ? t("Saving…") : t("Save account limits")}
      </Button>
    </form>
  );
}

type AccountLifecycleProps = {
  account: {
    id: string;
    name: string;
    restaurants: Array<{ id: string; businessName: string }>;
    users: Array<{
      id: string;
      email: string;
      name: string | null;
      memberships: Array<{
        id: string;
        role: "OWNER" | "EDITOR" | "VIEWER";
        restaurant: { id: string; businessName: string };
      }>;
    }>;
  };
};

export function CustomerAccountLifecycle({ account }: AccountLifecycleProps) {
  const { t } = usePanelI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [roles, setRoles] = useState<Record<string, "OWNER" | "EDITOR" | "VIEWER">>(
    () =>
      Object.fromEntries(
        account.users.flatMap((user) =>
          user.memberships.map((membership) => [membership.id, membership.role]),
        ),
      ),
  );
  const [confirmation, setConfirmation] = useState("");

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
    <div className="space-y-4 rounded-md border p-3">
      <div className="space-y-2">
        <p className="text-sm font-medium">{t("Assigned locations")}</p>
        {account.restaurants.map((restaurant) => (
          <div key={restaurant.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted/50 p-2 text-sm">
            <span>{restaurant.businessName}</span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() =>
                run(
                  () => unassignRestaurantFromCustomer(account.id, restaurant.id),
                  "Location unassigned",
                )
              }
            >
              <Unlink className="size-4" />
              {t("Unassign")}
            </Button>
          </div>
        ))}
        {!account.restaurants.length && (
          <p className="text-sm text-muted-foreground">{t("No locations")}</p>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">{t("Users and access")}</p>
        {account.users.map((user) => (
          <div key={user.id} className="space-y-2 rounded-md bg-muted/50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium">{user.name || user.email}</p>
                {user.name && <p className="text-xs text-muted-foreground">{user.email}</p>}
              </div>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={pending}
                onClick={() =>
                  run(
                    () => removeCustomerUser(account.id, user.id),
                    "User access revoked",
                  )
                }
              >
                <UserMinus className="size-4" />
                {t("Revoke user")}
              </Button>
            </div>
            {user.memberships.map((membership) => (
              <div key={membership.id} className="grid gap-2 sm:grid-cols-[1fr_9rem_auto] sm:items-center">
                <span className="text-sm">{membership.restaurant.businessName}</span>
                <select
                  value={roles[membership.id] ?? membership.role}
                  onChange={(event) =>
                    setRoles((current) => ({
                      ...current,
                      [membership.id]: event.target.value as "OWNER" | "EDITOR" | "VIEWER",
                    }))
                  }
                  className="h-9 rounded-md border bg-background px-2 text-sm"
                >
                  <option value="OWNER">{t("Owner")}</option>
                  <option value="EDITOR">{t("Editor")}</option>
                  <option value="VIEWER">{t("Viewer")}</option>
                </select>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pending || roles[membership.id] === membership.role}
                  onClick={() =>
                    run(
                      () =>
                        updateCustomerMembership(
                          membership.id,
                          roles[membership.id] ?? membership.role,
                        ),
                      "Role updated",
                    )
                  }
                >
                  {t("Update role")}
                </Button>
              </div>
            ))}
            {!user.memberships.length && (
              <p className="text-xs text-muted-foreground">{t("No location access")}</p>
            )}
          </div>
        ))}
        {!account.users.length && (
          <p className="text-sm text-muted-foreground">{t("No activated users")}</p>
        )}
      </div>

      <div className="flex justify-end border-t pt-3">
        <AlertDialog>
          <AlertDialogTrigger render={<Button type="button" variant="destructive" size="sm" />}>
            <Trash2 className="size-4" />
            {t("Delete workspace")}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("Delete customer workspace?")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("Users and invitations will be deleted. Restaurants will be preserved and unassigned.")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2">
              <Label htmlFor={`delete-${account.id}`}>
                {t("Type the workspace name to confirm")}: {account.name}
              </Label>
              <Input
                id={`delete-${account.id}`}
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={pending || confirmation !== account.name}
                onClick={() =>
                  run(
                    () => deleteCustomerWorkspace(account.id, confirmation),
                    "Workspace deleted",
                  )
                }
              >
                {t("Delete workspace")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export function OperatorInviteCustomerForm({
  account,
}: {
  account: {
    id: string;
    restaurants: Array<{ id: string; businessName: string }>;
  };
}) {
  const { t } = usePanelI18n();
  const router = useRouter();
  const [state, action, pending] = useActionState(inviteCustomerUserAsOperator, {
    error: null,
    activationPath: null,
    message: null,
  });
  useEffect(() => {
    if (state.activationPath || state.message) router.refresh();
  }, [router, state.activationPath, state.message]);

  if (!account.restaurants.length) return null;

  return (
    <form action={action} className="space-y-3 rounded-md border p-3">
      <input type="hidden" name="accountId" value={account.id} />
      <div className="flex items-center gap-2 text-sm font-medium">
        <UserPlus className="size-4" />
        {t("Add customer user")}
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_9rem_auto] sm:items-end">
        <div className="space-y-1">
          <Label htmlFor={`customer-email-${account.id}`}>{t("Email")}</Label>
          <Input id={`customer-email-${account.id}`} name="email" type="email" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`customer-restaurant-${account.id}`}>{t("Restaurant")}</Label>
          <select id={`customer-restaurant-${account.id}`} name="restaurantId" className="h-9 w-full rounded-md border bg-background px-2 text-sm" required>
            {account.restaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>{restaurant.businessName}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor={`customer-role-${account.id}`}>{t("Role")}</Label>
          <select id={`customer-role-${account.id}`} name="role" defaultValue="OWNER" className="h-9 w-full rounded-md border bg-background px-2 text-sm">
            <option value="OWNER">{t("Owner")}</option>
            <option value="EDITOR">{t("Editor")}</option>
            <option value="VIEWER">{t("Viewer")}</option>
          </select>
        </div>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? t("Creating…") : t("Add user")}
        </Button>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.message && <p className="text-sm text-emerald-700">{t(state.message)}</p>}
      {state.activationPath && (
        <div className="space-y-2 rounded-md bg-muted p-3 text-sm">
          <p>{t("Send this one-time activation link to the customer. It expires after seven days.")}</p>
          <a href={state.activationPath} target="_blank" rel="noreferrer" className="block break-all font-mono text-primary underline">
            {state.activationPath}
          </a>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={async () => {
              await navigator.clipboard.writeText(state.activationPath!);
              toast.success(t("Activation link copied"));
            }}
          >
            <Copy className="size-4" /> {t("Copy link")}
          </Button>
        </div>
      )}
    </form>
  );
}

export function AssignRestaurantForm({
  accounts,
  restaurants,
}: {
  accounts: Array<{ id: string; name: string }>;
  restaurants: Array<{ id: string; businessName: string }>;
}) {
  const { t } = usePanelI18n();
  const [state, action, pending] = useActionState(assignRestaurantToCustomer, initialState);
  return (
    <form action={action} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <div className="space-y-1">
        <Label>{t("Customer account")}</Label>
        <select name="accountId" className="h-9 w-full rounded-md border bg-background px-2 text-sm" required>
          <option value="">{t("Select account")}</option>
          {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        <Label>{t("Additional location")}</Label>
        <select name="restaurantId" className="h-9 w-full rounded-md border bg-background px-2 text-sm" required>
          <option value="">{t("Select restaurant")}</option>
          {restaurants.map((restaurant) => <option key={restaurant.id} value={restaurant.id}>{restaurant.businessName}</option>)}
        </select>
      </div>
      <Button type="submit" disabled={pending || !accounts.length || !restaurants.length}>{pending ? t("Assigning…") : t("Assign location")}</Button>
      {state.error && <p className="text-sm text-destructive sm:col-span-3">{state.error}</p>}
    </form>
  );
}
