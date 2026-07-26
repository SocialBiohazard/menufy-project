"use client";

import Link from "next/link";
import { useActionState } from "react";
import { UtensilsCrossed } from "lucide-react";
import { loginOperator } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PanelLanguageSwitcher } from "@/components/shared/PanelLanguageSwitcher";
import { usePanelI18n } from "@/components/shared/PanelI18nProvider";

export function LoginForm({ initialError }: { initialError: string | null }) {
  const { t } = usePanelI18n();
  const [state, action, pending] = useActionState(loginOperator, {
    error: initialError,
  });

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-foreground text-background">
            <UtensilsCrossed className="size-5" />
          </div>
          <CardTitle className="text-2xl">MenuApp operator</CardTitle>
          <CardDescription>{t("Manage restaurants, customers, and publishing.")}</CardDescription>
          <div className="pt-2"><PanelLanguageSwitcher /></div>
        </CardHeader>
        <CardContent>
          <form action={action} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">{t("Email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">{t("Password")}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            {state.error && (
              <p className="text-sm text-destructive" role="alert">
                {t(state.error)}
              </p>
            )}
            <Button type="submit" disabled={pending}>
              {pending ? t("Signing in…") : t("Sign in")}
            </Button>
          </form>
          <p className="mt-5 border-t pt-4 text-center text-sm text-muted-foreground">
            {t("Restaurant customer?")}{" "}
            <Link href="/portal/login" className="font-medium text-foreground underline-offset-4 hover:underline">
              {t("Open the customer portal")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
