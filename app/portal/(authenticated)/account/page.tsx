import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChangePasswordForm,
  InviteStaffForm,
} from "@/components/customer/CustomerAccountForms";
import { requireCustomerUser } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import { getPanelI18n } from "@/lib/panel-i18n";

export default async function CustomerAccountPage() {
  const customer = await requireCustomerUser();
  const { t } = await getPanelI18n();
  const ownedRestaurants = customer.memberships
    .filter((membership) => membership.role === "OWNER")
    .map((membership) => membership.restaurantId);
  const [users, invitations] = await Promise.all([
    prisma.customerUser.findMany({
      where: {
        accountId: customer.accountId,
        memberships: {
          some: { restaurantId: { in: ownedRestaurants } },
        },
      },
      include: {
        memberships: {
          where: { restaurantId: { in: ownedRestaurants } },
          include: { restaurant: { select: { businessName: true } } },
        },
      },
      orderBy: { email: "asc" },
    }),
    prisma.customerInvitation.findMany({
      where: {
        customerAccountId: customer.accountId,
        restaurantIds: { hasSome: ownedRestaurants },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);
  const restaurantChoices = await prisma.restaurant.findMany({
    where: { id: { in: ownedRestaurants } },
    select: { id: true, businessName: true },
    orderBy: { businessName: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("Account settings")}</h1>
        <p className="text-muted-foreground">{customer.account.name} · {customer.account.plan.toLowerCase()} {t("plan")}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChangePasswordForm />
        {restaurantChoices.length > 0 && <InviteStaffForm restaurants={restaurantChoices} />}
      </div>
      {ownedRestaurants.length > 0 ? (
        <Card>
          <CardHeader><CardTitle className="text-base">{t("People and access")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 last:border-0">
                <div><p className="font-medium">{user.name || user.email}</p>{user.name && <p className="text-sm text-muted-foreground">{user.email}</p>}</div>
                <div className="flex flex-wrap gap-1">{user.memberships.map((membership) => <Badge key={membership.id} variant="secondary">{membership.restaurant.businessName}: {membership.role.toLowerCase()}</Badge>)}</div>
              </div>
            ))}
            {!users.length && <p className="text-sm text-muted-foreground">{t("No activated users for the locations you own.")}</p>}
          </CardContent>
        </Card>
      ) : (
        <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          {t("Team management is available to restaurant owners. Your personal password can still be changed above.")}
        </p>
      )}
      {invitations.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">{t("Invitation history")}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {invitations.map((invite) => <div key={invite.id} className="flex justify-between gap-3"><span>{invite.email} · {t(invite.role.toLowerCase())}</span><Badge variant="outline">{t(invite.acceptedAt ? "Accepted" : invite.expiresAt <= new Date() ? "Expired" : "Pending")}</Badge></div>)}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
