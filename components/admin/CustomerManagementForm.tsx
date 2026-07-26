"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { createCustomerWorkspace } from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePanelI18n } from "@/components/shared/PanelI18nProvider";

const STEPS = ["Customer", "Locations", "Access", "Review"] as const;

export function CustomerManagementForm({
  restaurants,
}: {
  restaurants: Array<{ id: string; businessName: string }>;
}) {
  const { t } = usePanelI18n();
  const [state, action, pending] = useActionState(createCustomerWorkspace, {
    error: null,
    activationPath: null,
  });
  const [step, setStep] = useState(0);
  const [accountName, setAccountName] = useState("");
  const [email, setEmail] = useState("");
  const [restaurantIds, setRestaurantIds] = useState<string[]>([]);
  const [plan, setPlan] = useState<"TRIAL" | "BASIC" | "PRO">("TRIAL");
  const [maxRestaurants, setMaxRestaurants] = useState(1);
  const [maxStorageMb, setMaxStorageMb] = useState(1024);

  if (state.activationPath) {
    return (
      <Card>
        <CardHeader>
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Check className="size-6" />
          </div>
          <CardTitle className="text-center">{t("Customer workspace created")}</CardTitle>
        </CardHeader>
        <CardContent className="mx-auto max-w-2xl space-y-5 text-center">
          <p className="text-sm text-muted-foreground">
            Send this one-time link to {email}. It expires after seven days.
          </p>
          <a
            className="block break-all rounded-md border bg-muted p-3 font-mono text-sm text-primary underline"
            href={state.activationPath}
            target="_blank"
            rel="noreferrer"
          >
            {state.activationPath}
          </a>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                await navigator.clipboard.writeText(state.activationPath!);
                toast.success(t("Activation link copied"));
              }}
            >
              <Copy className="size-4" /> {t("Copy link")}
            </Button>
            <Button nativeButton={false} render={<a href={state.activationPath} target="_blank" rel="noreferrer" />}>
              <ExternalLink className="size-4" /> {t("Open activation")}
            </Button>
            <Button variant="ghost" nativeButton={false} render={<Link href="/dashboard/customers" />}>
              {t("Customer overview")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedRestaurants = restaurants.filter((restaurant) =>
    restaurantIds.includes(restaurant.id),
  );
  const canContinue =
    (step === 0 && accountName.trim().length >= 2 && email.includes("@")) ||
    (step === 1 && restaurantIds.length > 0) ||
    (step === 2 && maxRestaurants >= restaurantIds.length) ||
    step === 3;

  function toggleRestaurant(id: string) {
    setRestaurantIds((current) => {
      const next = current.includes(id)
        ? current.filter((restaurantId) => restaurantId !== id)
        : [...current, id];
      setMaxRestaurants((limit) => Math.max(limit, next.length || 1));
      return next;
    });
  }

  return (
    <Card>
      <CardHeader className="space-y-5">
        <CardTitle>{t("New customer onboarding")}</CardTitle>
        <ol className="grid grid-cols-4 gap-2">
          {STEPS.map((label, index) => (
            <li key={label} className="space-y-2">
              <div className={`h-1.5 rounded-full ${index <= step ? "bg-primary" : "bg-muted"}`} />
              <p className={`text-xs ${index === step ? "font-semibold" : "text-muted-foreground"}`}>
                {index + 1}. {t(label)}
              </p>
            </li>
          ))}
        </ol>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-6">
          <input type="hidden" name="accountName" value={accountName} />
          <input type="hidden" name="email" value={email} />
          {restaurantIds.map((id) => <input key={id} type="hidden" name="restaurantIds" value={id} />)}
          <input type="hidden" name="plan" value={plan} />
          <input type="hidden" name="maxRestaurants" value={maxRestaurants} />
          <input type="hidden" name="maxStorageMb" value={maxStorageMb} />

          {step === 0 && (
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="onboarding-account-name">{t("Customer or company name")}</Label>
                <Input id="onboarding-account-name" value={accountName} onChange={(event) => setAccountName(event.target.value)} autoFocus />
              </div>
              <div className="space-y-2">
                <Label htmlFor="onboarding-owner-email">{t("Owner email")}</Label>
                <Input id="onboarding-owner-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              </div>
              <p className="text-sm text-muted-foreground sm:col-span-2">
                {t("This person receives owner access and can invite their own staff later.")}
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <div><h2 className="font-medium">{t("Assign restaurant locations")}</h2><p className="text-sm text-muted-foreground">{t("Choose every location this customer should own initially.")}</p></div>
              <div className="grid gap-2 sm:grid-cols-2">
                {restaurants.map((restaurant) => (
                  <label key={restaurant.id} className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 ${restaurantIds.includes(restaurant.id) ? "border-primary bg-primary/5" : ""}`}>
                    <input type="checkbox" checked={restaurantIds.includes(restaurant.id)} onChange={() => toggleRestaurant(restaurant.id)} />
                    <span className="text-sm font-medium">{restaurant.businessName}</span>
                  </label>
                ))}
              </div>
              {!restaurants.length && <p className="rounded-md border border-dashed p-6 text-center text-muted-foreground">{t("Every restaurant is already assigned.")}</p>}
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-5 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="onboarding-plan">{t("Plan")}</Label>
                <select id="onboarding-plan" value={plan} onChange={(event) => setPlan(event.target.value as typeof plan)} className="h-9 w-full rounded-md border bg-background px-3 text-sm">
                  <option value="TRIAL">Trial</option>
                  <option value="BASIC">Basic</option>
                  <option value="PRO">Pro</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="onboarding-location-limit">{t("Location limit")}</Label>
                <Input id="onboarding-location-limit" type="number" min={restaurantIds.length || 1} value={maxRestaurants} onChange={(event) => setMaxRestaurants(Number(event.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="onboarding-storage">{t("Storage limit (MB)")}</Label>
                <Input id="onboarding-storage" type="number" min={100} value={maxStorageMb} onChange={(event) => setMaxStorageMb(Number(event.target.value))} />
              </div>
              <p className="text-sm text-muted-foreground sm:col-span-3">{t("These limits stay operator-only and can be changed later.")}</p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-medium">{t("Review customer workspace")}</h2>
              <dl className="grid gap-3 rounded-md border p-4 text-sm sm:grid-cols-2">
                <div><dt className="text-muted-foreground">{t("Customer")}</dt><dd className="font-medium">{accountName}</dd></div>
                <div><dt className="text-muted-foreground">{t("Owner")}</dt><dd className="font-medium">{email}</dd></div>
                <div><dt className="text-muted-foreground">{t("Locations")}</dt><dd className="font-medium">{selectedRestaurants.map((restaurant) => restaurant.businessName).join(", ")}</dd></div>
                <div><dt className="text-muted-foreground">{t("Access")}</dt><dd className="font-medium">{plan.toLowerCase()} · {maxRestaurants} {t("Locations").toLowerCase()} · {maxStorageMb} MB</dd></div>
              </dl>
              <p className="text-sm text-muted-foreground">{t("Creating the workspace assigns these restaurants and generates a one-time activation link. No email is sent automatically yet.")}</p>
            </div>
          )}

          {state.error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{state.error}</p>}

          <div className="flex justify-between border-t pt-4">
            <Button type="button" variant="ghost" disabled={step === 0 || pending} onClick={() => setStep((current) => current - 1)}>
              <ChevronLeft className="size-4" /> {t("Back")}
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" disabled={!canContinue} onClick={() => setStep((current) => current + 1)}>
                {t("Continue")} <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={pending}>{pending ? t("Creating…") : t("Create workspace")}</Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
