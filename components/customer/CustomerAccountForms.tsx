"use client";

import { useActionState } from "react";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { changeCustomerPassword } from "@/lib/actions/customer-auth";
import { inviteCustomerStaff } from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePanelI18n } from "@/components/shared/PanelI18nProvider";

const initialManagement = { error: null, activationPath: null };

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
  const [state, action, pending] = useActionState(inviteCustomerStaff, initialManagement);
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
