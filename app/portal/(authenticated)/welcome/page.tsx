import Link from "next/link";
import {
  Check,
  Circle,
  Eye,
  ImageIcon,
  LayoutList,
  Rocket,
  Store,
  UserRoundCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCustomerUser } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import { getPanelI18n } from "@/lib/panel-i18n";

type SetupStep = {
  title: string;
  description: string;
  complete: boolean;
  href: string;
  action: string;
  icon: typeof Check;
  external?: boolean;
  available?: boolean;
};

export default async function CustomerWelcomePage() {
  const customer = await requireCustomerUser();
  const { t } = await getPanelI18n();
  const editableRestaurantIds = customer.memberships
    .filter((membership) => membership.role !== "VIEWER")
    .map((membership) => membership.restaurantId);
  const restaurants = await prisma.restaurant.findMany({
    where: { id: { in: editableRestaurantIds } },
    include: {
      categories: { select: { _count: { select: { items: true } } } },
    },
    orderBy: { businessName: "asc" },
  });
  const previewAudits = await prisma.auditLog.findMany({
    where: {
      restaurantId: { in: editableRestaurantIds },
      action: "PREVIEW",
      entityType: "Restaurant",
    },
    orderBy: { createdAt: "desc" },
    select: { restaurantId: true, createdAt: true },
  });
  const latestPreviewByRestaurant = new Map<string, Date>();
  for (const preview of previewAudits) {
    if (
      preview.restaurantId &&
      !latestPreviewByRestaurant.has(preview.restaurantId)
    ) {
      latestPreviewByRestaurant.set(preview.restaurantId, preview.createdAt);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <Badge variant="secondary" className="mb-3">{t("Welcome to Menufy")}</Badge>
        <h1 className="text-3xl font-semibold">{t("Let’s get your menu ready")}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {t("Follow these steps in order. Your live menu will not change until you explicitly publish.")}
        </p>
      </div>

      {restaurants.map((restaurant) => {
        const hasDetails = Boolean(
          restaurant.businessType &&
          (restaurant.phone || restaurant.email || restaurant.address),
        );
        const hasBranding = Boolean(restaurant.logo);
        const hasMenu = restaurant.categories.some(
          (category) => category._count.items > 0,
        );
        const latestPreview = latestPreviewByRestaurant.get(restaurant.id);
        const hasCurrentPreview = Boolean(
          latestPreview &&
          (!restaurant.draftUpdatedAt ||
            latestPreview >= restaurant.draftUpdatedAt),
        );
        const hasCurrentPublication = Boolean(
          restaurant.isPublished &&
          restaurant.publishedAt &&
          (!restaurant.draftUpdatedAt ||
            restaurant.publishedAt >= restaurant.draftUpdatedAt),
        );
        const steps: SetupStep[] = [
          {
            title: t("Account activated"),
            description: t("Your secure customer access is ready."),
            complete: true,
            href: "/portal/account",
            action: t("View account"),
            icon: UserRoundCheck,
          },
          {
            title: t("Confirm restaurant details"),
            description: t("Add contact details, address, hours, links, and notices."),
            complete: hasDetails,
            href: `/portal/restaurants/${restaurant.id}#restaurant-details`,
            action: t("Edit details"),
            icon: Store,
          },
          {
            title: t("Build the menu"),
            description: t("Create categories, products, prices, translations, and dietary details."),
            complete: hasCurrentPreview,
            href: `/portal/restaurants/${restaurant.id}/menu`,
            action: t("Open menu builder"),
            icon: LayoutList,
          },
          {
            title: t("Preview the draft"),
            description: t("Review exactly how the current draft looks before publishing."),
            complete: hasMenu,
            href: `/portal-preview/${restaurant.id}`,
            action: t("Preview draft"),
            icon: Eye,
            external: true,
          },
          {
            title: t("Publish"),
            description: t("Make the reviewed draft available to diners."),
            complete: hasCurrentPublication,
            href: "/portal",
            action: t("Review and publish"),
            icon: Rocket,
          },
        ];
        let previousComplete = true;
        for (const step of steps) {
          step.available = previousComplete || step.complete;
          previousComplete = previousComplete && step.complete;
        }
        const nextIndex = steps.findIndex((step) => !step.complete);
        const completed = steps.filter((step) => step.complete).length;

        return (
          <Card key={restaurant.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>{restaurant.businessName}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{completed} / {steps.length} {t("steps complete")}</p>
                </div>
                <Badge variant={restaurant.isPublished ? "default" : "outline"}>
                  {t(restaurant.isPublished ? "Live" : "Setup in progress")}
                </Badge>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary transition-all" style={{ width: `${Math.round((completed / steps.length) * 100)}%` }} />
              </div>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isNext = index === nextIndex;
                  return (
                    <li key={step.title} className={`flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center ${isNext ? "border-primary bg-primary/5" : ""}`}>
                      <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${step.complete ? "bg-emerald-100 text-emerald-700" : isNext ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {step.complete ? <Check className="size-4" /> : isNext ? <Icon className="size-4" /> : <Circle className="size-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2"><p className="font-medium">{index + 1}. {step.title}</p>{isNext && <Badge>{t("Next")}</Badge>}</div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                      {step.available ? (
                        <Button size="sm" variant={isNext ? "default" : "outline"} nativeButton={false} render={<Link href={step.href} target={step.external ? "_blank" : undefined} />}>
                          {step.action}
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          {step.action}
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ol>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed p-4">
                <div className="flex items-start gap-3">
                  <ImageIcon className="mt-0.5 size-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{t("Optional: add your branding")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("Upload a logo, cover, and splash imagery whenever you are ready.")}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" nativeButton={false} render={<Link href={`/portal/restaurants/${restaurant.id}#branding`} />}>
                  {t(hasBranding ? "Review branding" : "Add branding")}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
      {!restaurants.length && <div className="rounded-lg border border-dashed p-8 text-center"><p className="text-muted-foreground">{t("Your access is read-only, or no editable restaurant is assigned.")}</p><Button className="mt-3" variant="outline" nativeButton={false} render={<Link href="/portal" />}>{t("Go to overview")}</Button></div>}
    </div>
  );
}
