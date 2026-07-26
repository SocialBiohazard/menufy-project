"use client";

import { useActionState } from "react";
import {
  assignRestaurantToCustomer,
  updateCustomerAccount,
} from "@/lib/actions/customers";
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
