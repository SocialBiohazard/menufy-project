import { Bell, History } from "lucide-react";
import { CustomerRestaurantCard } from "@/components/customer/CustomerRestaurantCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCustomerUser } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import { markCustomerNotificationsRead } from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";
import { getPanelI18n } from "@/lib/panel-i18n";
import { panelIntlLocale } from "@/lib/panel-i18n-shared";

export default async function PortalPage() {
  const user = await requireCustomerUser();
  const { locale, t } = await getPanelI18n();
  const [memberships, notifications, audits] = await Promise.all([
    prisma.restaurantMembership.findMany({
      where: { customerUserId: user.id },
      include: { restaurant: { include: { _count: { select: { categories: true } } } } },
      orderBy: { restaurant: { businessName: "asc" } },
    }),
    prisma.notification.findMany({
      where: { customerUserId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.auditLog.findMany({
      where: { restaurantId: { in: user.memberships.map((entry) => entry.restaurantId) } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);
  return (
    <div className="space-y-8">
      <div><h1 className="text-2xl font-semibold">{t("Restaurant overview")}</h1><p className="text-muted-foreground">{t("Manage every location assigned to your account.")}</p></div>
      <div className="grid gap-4 md:grid-cols-2">
        {memberships.map(({ role, restaurant }) => (
          <CustomerRestaurantCard
            key={restaurant.id}
            canEdit={role !== "VIEWER"}
            restaurant={{
              id: restaurant.id,
              slug: restaurant.slug,
              businessName: restaurant.businessName,
              publicHostname: restaurant.publicHostname,
              isPublished: restaurant.isPublished,
              hasUnpublishedChanges: Boolean(
                restaurant.draftUpdatedAt &&
                (!restaurant.publishedAt || restaurant.draftUpdatedAt > restaurant.publishedAt),
              ),
              categoryCount: restaurant._count.categories,
              role,
            }}
          />
        ))}
      </div>
      {memberships.length === 0 && <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">{t("No restaurant locations are assigned yet.")}</p>}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><div className="flex items-center justify-between gap-2"><CardTitle className="flex items-center gap-2 text-base"><Bell className="size-4" /> {t("Notifications")}</CardTitle>{notifications.some((notice) => !notice.readAt) && <form action={markCustomerNotificationsRead}><Button type="submit" size="xs" variant="ghost">{t("Mark read")}</Button></form>}</div></CardHeader><CardContent className="space-y-3">
          {notifications.map((notice) => <div key={notice.id} className="border-b pb-2 text-sm last:border-0"><div className="flex gap-2"><span className="font-medium">{notice.title}</span>{!notice.readAt && <Badge variant="secondary">{t("New")}</Badge>}</div>{notice.body && <p className="text-muted-foreground">{notice.body}</p>}</div>)}
          {!notifications.length && <p className="text-sm text-muted-foreground">{t("No notifications.")}</p>}
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><History className="size-4" /> {t("Recent changes")}</CardTitle></CardHeader><CardContent className="space-y-3">
          {audits.map((audit) => <div key={audit.id} className="border-b pb-2 text-sm last:border-0"><p><span className="font-medium">{t(audit.action)}</span> {t(audit.entityType)}</p><p className="text-xs text-muted-foreground">{audit.actorEmail ?? t("System")} · {audit.createdAt.toLocaleString(panelIntlLocale(locale))}</p></div>)}
          {!audits.length && <p className="text-sm text-muted-foreground">{t("No recorded changes yet.")}</p>}
        </CardContent></Card>
      </div>
    </div>
  );
}
